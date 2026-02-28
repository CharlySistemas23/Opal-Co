import type { Cart, CartItem } from "@/types";
import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";

const MAX_QUANTITY = 999;
const MIN_QUANTITY = 1;

function mapDbCartToCart(raw: {
  id: string;
  items: Array<{
    id: string;
    variantId: string;
    quantity: number;
    snapshotTitle: string;
    snapshotPriceCents: number;
    variant: {
      product: {
        images: Array<{
          order: number;
          mediaAsset: { url: string; alt: string | null } | null;
        }>;
      };
    };
  }>;
}): Cart {
  const lines: CartItem[] = raw.items.map((i) => {
    const firstImg = i.variant.product.images
      .filter((img) => img.mediaAsset?.url)
      .sort((a, b) => a.order - b.order)[0];
    return {
      id: i.id,
      variantId: i.variantId,
      title: i.snapshotTitle,
      quantity: i.quantity,
      price: (i.snapshotPriceCents / 100).toFixed(2),
      image: firstImg?.mediaAsset
        ? { url: firstImg.mediaAsset.url, altText: firstImg.mediaAsset.alt }
        : undefined,
    };
  });
  return {
    id: raw.id,
    checkoutUrl: "",
    lines,
    totalQuantity: lines.reduce((s, l) => s + l.quantity, 0),
  };
}

export async function getCartById(cartId: string): Promise<Cart | null> {
  if (!databaseConfigured() || !db) return null;
  try {
    const cart = await db.cart.findFirst({
      where: { id: cartId, status: "ACTIVE" },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: {
                      orderBy: { order: "asc" },
                      include: { mediaAsset: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!cart) return null;
    return mapDbCartToCart(cart);
  } catch {
    return null;
  }
}

export async function createCart(customerId?: string) {
  if (!databaseConfigured() || !db) return null;
  try {
    const cart = await db.cart.create({
      data: {
        customerId: customerId || null,
        status: "ACTIVE",
      },
    });
    return getCartById(cart.id);
  } catch {
    return null;
  }
}

export async function attachCartToCustomer(
  cartId: string,
  customerId: string
): Promise<Cart | null> {
  if (!databaseConfigured() || !db) return null;
  try {
    const cart = await db.cart.findFirst({
      where: { id: cartId, status: "ACTIVE", customerId: null },
    });
    if (!cart) return null;
    await db.cart.update({
      where: { id: cartId },
      data: { customerId },
    });
    return getCartById(cartId);
  } catch {
    return null;
  }
}

export async function addCartItem(
  cartId: string,
  variantId: string,
  quantity: number
): Promise<{ cart: Cart | null; error?: string }> {
  if (!databaseConfigured() || !db) return { cart: null, error: "UNAVAILABLE" };
  const qty = Math.max(MIN_QUANTITY, Math.min(MAX_QUANTITY, Math.floor(quantity)));
  if (qty < MIN_QUANTITY) return { cart: null, error: "INVALID_QUANTITY" };

  try {
    const cart = await db.cart.findFirst({
      where: { id: cartId, status: "ACTIVE" },
    });
    if (!cart) return { cart: null, error: "CART_NOT_FOUND" };

    const variant = await db.variant.findUnique({
      where: { id: variantId, active: true },
      include: { product: true },
    });
    if (!variant) return { cart: null, error: "VARIANT_NOT_FOUND" };

    const existing = await db.cartItem.findFirst({
      where: { cartId, variantId },
    });

    if (existing) {
      const newQty = Math.min(MAX_QUANTITY, existing.quantity + qty);
      await db.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: newQty,
          snapshotTitle: variant.product.title,
          snapshotPriceCents: variant.priceCents,
        },
      });
    } else {
      await db.cartItem.create({
        data: {
          cartId,
          variantId,
          quantity: qty,
          snapshotTitle: variant.product.title,
          snapshotPriceCents: variant.priceCents,
        },
      });
    }
    const updated = await getCartById(cartId);
    return { cart: updated };
  } catch {
    return { cart: null, error: "FAILED" };
  }
}

export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<{ cart: Cart | null; error?: string }> {
  if (!databaseConfigured() || !db) return { cart: null, error: "UNAVAILABLE" };
  const qty = Math.floor(quantity);

  try {
    const item = await db.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });
    if (!item || item.cart.status !== "ACTIVE") {
      return { cart: null, error: "NOT_FOUND" };
    }

    if (qty <= 0) {
      await db.cartItem.delete({ where: { id: cartItemId } });
    } else {
      const newQty = Math.min(MAX_QUANTITY, qty);
      await db.cartItem.update({
        where: { id: cartItemId },
        data: { quantity: newQty },
      });
    }
    const updated = await getCartById(item.cartId);
    return { cart: updated };
  } catch {
    return { cart: null, error: "FAILED" };
  }
}

export async function removeCartItem(
  cartItemId: string
): Promise<{ cart: Cart | null; error?: string }> {
  if (!databaseConfigured() || !db) return { cart: null, error: "UNAVAILABLE" };
  try {
    const item = await db.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });
    if (!item || item.cart.status !== "ACTIVE") {
      return { cart: null, error: "NOT_FOUND" };
    }
    await db.cartItem.delete({ where: { id: cartItemId } });
    const updated = await getCartById(item.cartId);
    return { cart: updated };
  } catch {
    return { cart: null, error: "FAILED" };
  }
}

export async function getCartForCheckout(cartId: string) {
  if (!databaseConfigured() || !db) return null;
  try {
    const cart = await db.cart.findFirst({
      where: { id: cartId, status: "ACTIVE" },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
    if (!cart || cart.items.length === 0) return null;
    for (const item of cart.items) {
      if (!item.variant?.active || !item.variant?.product?.published) {
        return null;
      }
    }
    return cart;
  } catch {
    return null;
  }
}
