"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { Heading, Text, Button } from "@/components/ui";
import { calculateCartSubtotal } from "@/utils/cart";

export function CartDrawer() {
  const { isOpen, closeCart, cart, isCartAvailable, removeItem, updateQuantity } = useCart();

  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-charcoal/40 z-40"
            onClick={closeCart}
            aria-hidden
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-ivory z-50 flex flex-col shadow-xl"
          >
            <div className="flex items-center justify-between p-8 border-b border-charcoal/10">
              <Heading as="h2" level={4}>
                Your Bag
              </Heading>
              <button
                type="button"
                onClick={closeCart}
                className="font-sans text-sm uppercase tracking-[0.2em] text-charcoal hover:text-champagne transition-colors"
                aria-label="Close cart"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {!isCartAvailable ? (
                <div className="py-20 text-center space-y-6">
                  <Text variant="body" muted>
                    Shopping bag is unavailable. Please contact us to complete your purchase.
                  </Text>
                  <Link
                    href="/contact"
                    onClick={closeCart}
                    className="inline-block font-sans text-sm uppercase tracking-[0.2em] text-charcoal hover:text-champagne transition-colors underline"
                  >
                    Contact us
                  </Link>
                </div>
              ) : cart && cart.lines.length > 0 ? (
                <ul className="space-y-8">
                  {cart.lines.map((item) => (
                    <li key={item.id} className="flex gap-6">
                      {item.image && (
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <Image
                            src={item.image.url}
                            alt={item.image.altText || item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <Text variant="small" className="font-medium">
                          {item.title}
                        </Text>
                        <div className="mt-2 flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center border border-charcoal/20 text-charcoal hover:border-charcoal/40 transition-colors font-sans text-sm"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="font-sans text-sm w-6 text-center">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center border border-charcoal/20 text-charcoal hover:border-charcoal/40 transition-colors font-sans text-sm"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="font-sans text-xs uppercase tracking-wider text-charcoal/60 hover:text-charcoal transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                        <Text variant="small" muted className="mt-1">
                          {parseFloat(item.price).toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                          {item.quantity > 1 && ` × ${item.quantity}`}
                        </Text>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <Text variant="body" muted>
                    Your bag is empty.
                  </Text>
                  <Link
                    href="/collections"
                    onClick={closeCart}
                    className="inline-block font-sans text-sm uppercase tracking-[0.2em] text-charcoal hover:text-champagne transition-colors"
                  >
                    Continue shopping
                  </Link>
                </div>
              )}
            </div>

            {cart && cart.lines.length > 0 && (
              <div className="p-8 border-t border-charcoal/10 space-y-4">
                <div className="flex justify-between font-sans text-sm text-charcoal">
                  <span>Subtotal</span>
                  <span>
                    {calculateCartSubtotal(cart.lines).toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                  </span>
                </div>
                <Link href="/checkout" onClick={closeCart} className="block">
                  <Button variant="primary" className="w-full">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
