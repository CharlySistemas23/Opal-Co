import { isShopifyConfigured } from "@/utils/safeEnv";
import { shopifyFetch } from "./client";
import {
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  COLLECTIONS_QUERY,
  COLLECTION_BY_HANDLE_QUERY,
  CART_CREATE_MUTATION,
  CART_ADD_LINES_MUTATION,
  CART_QUERY,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
} from "./queries";
import type { Product } from "@/types";
import type { Cart, CartItem } from "@/types";

function mapShopifyProduct(node: ShopifyProductNode): Product {
  const images = node.images?.edges?.map((e) => ({
    url: e.node.url,
    altText: e.node.altText,
    width: e.node.width,
    height: e.node.height,
  })) ?? [];

  const variants = node.variants?.edges?.map((e) => ({
    id: e.node.id,
    title: e.node.title,
    price: e.node.price?.amount ?? "0",
    availableForSale: e.node.availableForSale ?? false,
    selectedOptions: e.node.selectedOptions ?? [],
  })) ?? [];

  const priceRange = node.priceRange
    ? {
        minVariantPrice: {
          amount: node.priceRange.minVariantPrice?.amount ?? "0",
          currencyCode: node.priceRange.minVariantPrice?.currencyCode ?? "USD",
        },
        maxVariantPrice: {
          amount: node.priceRange.maxVariantPrice?.amount ?? "0",
          currencyCode: node.priceRange.maxVariantPrice?.currencyCode ?? "USD",
        },
      }
    : {
        minVariantPrice: { amount: "0", currencyCode: "USD" as const },
        maxVariantPrice: { amount: "0", currencyCode: "USD" as const },
      };

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description ?? "",
    descriptionHtml: node.descriptionHtml ?? "",
    vendor: node.vendor ?? "",
    productType: node.productType ?? "",
    tags: node.tags ?? [],
    images,
    variants,
    priceRange,
  };
}

interface ShopifyProductNode {
  id: string;
  handle: string;
  title: string;
  description?: string;
  descriptionHtml?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  images?: {
    edges: Array<{
      node: { url: string; altText: string | null; width: number; height: number };
    }>;
  };
  variants?: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price?: { amount: string; currencyCode: string };
        availableForSale?: boolean;
        selectedOptions?: Array<{ name: string; value: string }>;
      };
    }>;
  };
  priceRange?: {
    minVariantPrice?: { amount: string; currencyCode: string };
    maxVariantPrice?: { amount: string; currencyCode: string };
  };
}

export async function getProducts(first = 12): Promise<Product[]> {
  if (!isShopifyConfigured()) return [];

  try {
    const { data } = await shopifyFetch<{ products: { edges: Array<{ node: ShopifyProductNode }> } }>({
      query: PRODUCTS_QUERY,
      variables: { first },
    });
    return data.products.edges.map((e) => mapShopifyProduct(e.node));
  } catch {
    return [];
  }
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  if (!isShopifyConfigured()) return null;

  try {
    const { data } = await shopifyFetch<{ product: ShopifyProductNode | null }>({
      query: PRODUCT_BY_HANDLE_QUERY,
      variables: { handle },
    });
    return data.product ? mapShopifyProduct(data.product) : null;
  } catch {
    return null;
  }
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image?: { url: string; altText: string | null };
}

export async function getCollections(): Promise<ShopifyCollection[]> {
  if (!isShopifyConfigured()) return [];

  try {
    const { data } = await shopifyFetch<{
      collections: { edges: Array<{ node: ShopifyCollection }> };
    }>({
      query: COLLECTIONS_QUERY,
      variables: { first: 10 },
    });
    return data.collections.edges.map((e) => e.node);
  } catch {
    return [];
  }
}

export interface CollectionWithProducts extends ShopifyCollection {
  products: Product[];
}

export async function getCollectionByHandle(
  handle: string,
  first = 24
): Promise<CollectionWithProducts | null> {
  if (!isShopifyConfigured()) return null;

  try {
    const { data } = await shopifyFetch<{
      collection: {
        id: string;
        handle: string;
        title: string;
        description: string;
        image?: { url: string; altText: string | null };
        products: { edges: Array<{ node: ShopifyProductNode }> };
      } | null;
    }>({
      query: COLLECTION_BY_HANDLE_QUERY,
      variables: { handle, first },
    });

    if (!data.collection) return null;
    const c = data.collection;
    return {
      id: c.id,
      handle: c.handle,
      title: c.title,
      description: c.description,
      image: c.image,
      products: c.products.edges.map((e) => mapShopifyProduct(e.node)),
    };
  } catch {
    return null;
  }
}

function mapShopifyCartToCart(shopifyCart: ShopifyCart): Cart {
  const lines: CartItem[] = shopifyCart.lines.edges.map((e) => {
    const merch = e.node.merchandise;
    const img = merch.product?.images?.edges?.[0]?.node;
    return {
      id: e.node.id,
      variantId: merch.id,
      title: merch.product?.title ?? merch.title,
      quantity: e.node.quantity,
      price: merch.price?.amount ?? "0",
      image: img ? { url: img.url, altText: img.altText } : undefined,
    };
  });
  return {
    id: shopifyCart.id,
    checkoutUrl: shopifyCart.checkoutUrl ?? "",
    lines,
    totalQuantity: lines.reduce((s, l) => s + l.quantity, 0),
  };
}

interface ShopifyCart {
  id: string;
  checkoutUrl: string | null;
  lines: {
    edges: Array<{
      node: {
        id: string;
        quantity: number;
        merchandise: {
          id: string;
          title: string;
          price?: { amount: string; currencyCode: string };
          product?: {
            title: string;
            images?: {
              edges: Array<{ node: { url: string; altText: string | null } }>;
            };
          };
        };
      };
    }>;
  };
}

export async function createCart(): Promise<Cart | null> {
  if (!isShopifyConfigured()) return null;

  try {
    const { data } = await shopifyFetch<{
      cartCreate: { cart: ShopifyCart | null };
    }>({ query: CART_CREATE_MUTATION });
    return data.cartCreate.cart ? mapShopifyCartToCart(data.cartCreate.cart) : null;
  } catch {
    return null;
  }
}

export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number
): Promise<Cart | null> {
  if (!isShopifyConfigured()) return null;

  try {
    const { data } = await shopifyFetch<{
      cartLinesAdd: { cart: ShopifyCart | null };
    }>({
      query: CART_ADD_LINES_MUTATION,
      variables: {
        cartId,
        lines: [{ merchandiseId: variantId, quantity }],
      },
    });
    return data.cartLinesAdd.cart ? mapShopifyCartToCart(data.cartLinesAdd.cart) : null;
  } catch {
    return null;
  }
}

export async function getCart(cartId: string): Promise<Cart | null> {
  if (!isShopifyConfigured()) return null;

  try {
    const { data } = await shopifyFetch<{ cart: ShopifyCart | null }>({
      query: CART_QUERY,
      variables: { cartId },
    });
    return data.cart ? mapShopifyCartToCart(data.cart) : null;
  } catch {
    return null;
  }
}

export async function removeCartLines(cartId: string, lineIds: string[]): Promise<Cart | null> {
  if (!isShopifyConfigured()) return null;

  try {
    const { data } = await shopifyFetch<{
      cartLinesRemove: { cart: ShopifyCart | null };
    }>({
      query: CART_LINES_REMOVE_MUTATION,
      variables: { cartId, lineIds },
    });
    return data.cartLinesRemove.cart ? mapShopifyCartToCart(data.cartLinesRemove.cart) : null;
  } catch {
    return null;
  }
}

export async function updateCartLines(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>
): Promise<Cart | null> {
  if (!isShopifyConfigured()) return null;

  try {
    const { data } = await shopifyFetch<{
      cartLinesUpdate: { cart: ShopifyCart | null };
    }>({
      query: CART_LINES_UPDATE_MUTATION,
      variables: { cartId, lines },
    });
    return data.cartLinesUpdate.cart ? mapShopifyCartToCart(data.cartLinesUpdate.cart) : null;
  } catch {
    return null;
  }
}
