"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useAccount } from "@/context/AccountContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { Heading, Text } from "@/components/ui";
import { LogoutButton } from "./LogoutButton";

export function AccountDrawer() {
  const { isOpen, closeAccount } = useAccount();
  const { customer, isLoading } = useCustomerAuth();

  useEffect(() => {
    if (!isOpen) return;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const handleEscape = (e: KeyboardEvent) => e.key === "Escape" && closeAccount();
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, closeAccount]);

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
            onClick={closeAccount}
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
                Account
              </Heading>
              <button
                type="button"
                onClick={closeAccount}
                className="font-sans text-sm uppercase tracking-[0.2em] text-charcoal hover:text-champagne transition-colors"
                aria-label="Close account menu"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {isLoading ? (
                <Text variant="body" muted>
                  Loading...
                </Text>
              ) : customer ? (
                <>
                  <h3 className="font-serif text-xl tracking-tight text-charcoal mb-2">
                    Welcome, {customer.email}
                  </h3>
                  <Text variant="body" muted className="mb-8">
                    Manage your account and view your orders.
                  </Text>
                  <div className="space-y-4">
                    <Link
                      href="/account"
                      onClick={closeAccount}
                      className="flex items-center justify-between font-sans text-sm uppercase tracking-[0.15em] text-charcoal hover:text-champagne transition-colors duration-fast py-4 border-b border-charcoal/10 group"
                    >
                      Account
                      <span className="group-hover:translate-x-1 transition-transform" aria-hidden>›</span>
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={closeAccount}
                      className="flex items-center justify-between font-sans text-sm uppercase tracking-[0.15em] text-charcoal hover:text-champagne transition-colors duration-fast py-4 border-b border-charcoal/10 group"
                    >
                      Order history
                      <span className="group-hover:translate-x-1 transition-transform" aria-hidden>›</span>
                    </Link>
                    <div className="pt-4">
                      <LogoutButton />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-serif text-xl tracking-tight text-charcoal mb-4">
                    Sign in or create an account
                  </h3>
                  <Text variant="body" muted className="mb-8">
                    With an account, you can shop faster, view your order history, and access your bag or saved products from any device.
                  </Text>
                  <Link
                    href="/account/login"
                    onClick={closeAccount}
                    className="flex items-center justify-between font-sans text-sm uppercase tracking-[0.15em] text-charcoal hover:text-champagne transition-colors duration-fast py-4 border-b border-charcoal/10 group"
                  >
                    Sign in
                    <span className="group-hover:translate-x-1 transition-transform" aria-hidden>›</span>
                  </Link>
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
