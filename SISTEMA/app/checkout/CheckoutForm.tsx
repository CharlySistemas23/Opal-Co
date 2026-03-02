"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { Button, Text } from "@/components/ui";
import { createStripeCheckoutSession } from "@/app/actions/checkout";

function parsePrice(price: string): number {
  return Math.round(parseFloat(price) * 100);
}

export function CheckoutForm() {
  const { cart } = useCart();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.lines.length === 0) return;
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/public/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: cart.id,
          email: trimmedEmail,
        }),
        credentials: "include",
      });
      const result = await res.json();
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      if (result.error === "INVALID_CART" || result.error === "UNAVAILABLE") {
        const lineItems = cart.lines.map((item) => ({
          title: item.title,
          price: parsePrice(item.price),
          quantity: item.quantity,
        }));
        const fallback = await createStripeCheckoutSession(lineItems);
        if (fallback.url) {
          window.location.href = fallback.url;
          return;
        }
        if (fallback.error === "STRIPE_NOT_CONFIGURED") {
          setErrorMessage("Payment is not configured. Please contact us or book an appointment.");
        } else {
          setErrorMessage("Unable to proceed. Please try again.");
        }
      } else if (result.error === "STRIPE_NOT_CONFIGURED") {
        setErrorMessage("Payment is not configured. Please contact us or book an appointment.");
      } else if (result.error === "INSUFFICIENT_STOCK") {
        setErrorMessage("Some items are no longer in stock. Please update your cart.");
      } else {
        setErrorMessage("Unable to proceed. Please try again.");
      }
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setErrorMessage("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  if (!cart || cart.lines.length === 0) {
    return (
      <Text variant="body" muted>
        Your cart is empty. Add items to continue.
      </Text>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label htmlFor="checkout-email" className="block text-xs uppercase tracking-wider text-charcoal/70 mb-2">
          Email
        </label>
        <input
          id="checkout-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full px-3 py-2 border border-charcoal/20 rounded text-charcoal bg-ivory font-sans text-sm"
        />
      </div>
      {errorMessage && (
        <div className="space-y-4">
          <p className="font-sans text-sm text-charcoal/70">{errorMessage}</p>
          {errorMessage.includes("not configured") && (
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] border border-charcoal/30 text-charcoal hover:border-charcoal hover:bg-charcoal/5 transition-colors"
              >
                Contact us
              </Link>
              <Link
                href="/appointments"
                className="inline-flex items-center justify-center px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] border border-charcoal/30 text-charcoal hover:border-charcoal hover:bg-charcoal/5 transition-colors"
              >
                Book an appointment
              </Link>
            </div>
          )}
        </div>
      )}
      <div className="space-y-6">
        {cart.lines.map((item) => (
          <div
            key={item.id}
            className="flex justify-between font-sans text-sm text-charcoal"
          >
            <span>
              {item.title} × {item.quantity}
            </span>
            <span>
              {Number(item.price).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        ))}
      </div>
      <Button type="submit" variant="primary" disabled={isLoading}>
        {isLoading ? "Processing…" : "Proceed to Payment"}
      </Button>
    </form>
  );
}
