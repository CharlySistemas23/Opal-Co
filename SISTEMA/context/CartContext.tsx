"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Cart, CartItem } from "@/types";
import { isShopifyConfigured } from "@/utils/safeEnv";
import {
  createCart as shopifyCreateCart,
  addToCart as shopifyAddToCart,
  getCart as shopifyGetCart,
  removeCartLines,
  updateCartLines,
} from "@/lib/shopify";

const CART_ID_KEY = "opal-cart-id";

interface CartContextValue {
  cart: Cart | null;
  isOpen: boolean;
  isCartAvailable: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "id">) => Promise<void>;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [useDbCart, setUseDbCart] = useState<boolean | null>(null);

  const refreshCart = useCallback(async () => {
    if (typeof window === "undefined") return;
    const cartId = localStorage.getItem(CART_ID_KEY);

    if (useDbCart === true) {
      if (cartId) {
        const res = await fetch(`/api/public/cart?cartId=${encodeURIComponent(cartId)}`);
        if (res.ok) {
          const data = await res.json();
          setCart(data.cart);
        } else if (res.status === 404) {
          setCart(null);
        }
      } else {
        setCart(null);
      }
      return;
    }

    if (useDbCart === false && isShopifyConfigured() && cartId) {
      const c = await shopifyGetCart(cartId);
      setCart(c);
      return;
    }

    if (useDbCart === null && cartId) {
      const res = await fetch(`/api/public/cart?cartId=${encodeURIComponent(cartId)}`);
      if (res.status === 503) {
        setUseDbCart(false);
        if (isShopifyConfigured()) {
          const c = await shopifyGetCart(cartId);
          setCart(c);
        } else {
          setCart(null);
        }
      } else if (res.ok) {
        setUseDbCart(true);
        const data = await res.json();
        setCart(data.cart);
      } else if (res.status === 404) {
        setUseDbCart(true);
        setCart(null);
      } else {
        setUseDbCart(false);
        if (isShopifyConfigured()) {
          const c = await shopifyGetCart(cartId);
          setCart(c);
        } else {
          setCart(null);
        }
      }
      return;
    }

    if (useDbCart === null) {
      const res = await fetch("/api/public/cart?cartId=probe");
      if (res.status !== 503) {
        setUseDbCart(true);
        setCart(null);
      } else {
        setUseDbCart(false);
        setCart(null);
      }
    }
  }, [useDbCart]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const openCart = useCallback(async () => {
    setIsOpen(true);
    await refreshCart();
  }, [refreshCart]);

  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback(
    async (item: Omit<CartItem, "id">) => {
      if (typeof window === "undefined") return;
      let cartId = localStorage.getItem(CART_ID_KEY);
      let c: Cart | null = null;

      if (useDbCart === true) {
        if (!cartId) {
          const res = await fetch("/api/public/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
            credentials: "include",
          });
          if (!res.ok) return;
          const data = await res.json();
          cartId = data.cart?.id;
          if (cartId) localStorage.setItem(CART_ID_KEY, cartId);
          c = data.cart;
        }
        if (cartId && item.variantId) {
          const res = await fetch("/api/public/cart/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cartId,
              variantId: item.variantId,
              quantity: item.quantity || 1,
            }),
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            c = data.cart;
          }
        }
      } else if (useDbCart === false && isShopifyConfigured()) {
        if (!cartId) {
          c = await shopifyCreateCart();
          if (c) {
            cartId = c.id;
            localStorage.setItem(CART_ID_KEY, cartId);
          }
        }
        if (cartId && item.variantId) {
          c = await shopifyAddToCart(cartId, item.variantId, item.quantity || 1);
        }
      }

      if (c) {
        setCart(c);
        setIsOpen(true);
      }
    },
    [useDbCart]
  );

  const removeItem = useCallback(
    (lineId: string) => {
      if (useDbCart === true) {
        fetch(`/api/public/cart/items/${lineId}`, {
          method: "DELETE",
          credentials: "include",
        }).then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            setCart(data.cart);
          }
        });
        return;
      }
      const cartId = localStorage.getItem(CART_ID_KEY);
      if (!cartId) return;
      removeCartLines(cartId, [lineId]).then((c) => {
        if (c) setCart(c);
      });
    },
    [useDbCart]
  );

  const updateQuantity = useCallback(
    (lineId: string, quantity: number) => {
      if (useDbCart === true) {
        if (quantity <= 0) {
          removeItem(lineId);
          return;
        }
        fetch(`/api/public/cart/items/${lineId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
          credentials: "include",
        }).then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            setCart(data.cart);
          }
        });
        return;
      }
      const cartId = localStorage.getItem(CART_ID_KEY);
      if (!cartId) return;
      if (quantity <= 0) {
        removeCartLines(cartId, [lineId]).then((c) => {
          if (c) setCart(c);
        });
        return;
      }
      updateCartLines(cartId, [{ id: lineId, quantity }]).then((c) => {
        if (c) setCart(c);
      });
    },
    [useDbCart, removeItem]
  );

  const isCartAvailable =
    useDbCart === true || (useDbCart === false && isShopifyConfigured());

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        isCartAvailable,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartContext must be used within CartProvider");
  return ctx;
}
