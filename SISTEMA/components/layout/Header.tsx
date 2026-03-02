"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { useSearch } from "@/context/SearchContext";
import { useAccount } from "@/context/AccountContext";
import { Container, Link as UiLink } from "@/components/ui";
import { useSiteText } from "@/hooks/useSiteText";

const navItems = [
  { href: "/collections", label: "Collections" },
  { href: "/high-jewelry", label: "High Jewelry" },
  { href: "/the-house", label: "The House" },
  { href: "/journal", label: "Journal" },
  { href: "/private-clients", label: "Private Clients" },
  { href: "/contact", label: "Contact" },
];

const PersonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21a8 8 0 0 0-16 0" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const LocationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const BagIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
  </svg>
);

export function Header() {
  const { openCart } = useCart();
  const t = useSiteText().t;
  const { open: openSearch, triggerRef } = useSearch();
  const { openAccount } = useAccount();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const handleEscape = (e: KeyboardEvent) => e.key === "Escape" && closeMobile();
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen, closeMobile]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ivory/95 backdrop-blur-sm border-b border-charcoal/10">
      {/* Top bar: centered logo + right icons */}
      <Container className="hidden md:flex items-center justify-between min-h-16 py-5">
        <div className="flex-1" />
        <Link
          href="/"
          className="font-serif text-3xl md:text-4xl xl:text-5xl tracking-tight text-charcoal"
        >
          {t("header_brand_text", "OPAL & CO")}
        </Link>
        <div className="flex-1 flex items-center justify-end gap-6">
          <button
            ref={triggerRef}
            type="button"
            onClick={openSearch}
            className="p-2 -m-2 text-charcoal hover:text-champagne transition-colors duration-fast"
            aria-label="Open search"
          >
            <SearchIcon />
          </button>
          <UiLink href="/stores" className="p-2 -m-2 text-charcoal hover:text-champagne transition-colors duration-fast" aria-label="Stores">
            <LocationIcon />
          </UiLink>
          <button
            type="button"
            onClick={openAccount}
            className="p-2 -m-2 text-charcoal hover:text-champagne transition-colors duration-fast"
            aria-label="Open account"
          >
            <PersonIcon />
          </button>
          <button
            type="button"
            onClick={openCart}
            className="p-2 -m-2 text-charcoal hover:text-champagne transition-colors duration-fast"
            aria-label="Open cart"
          >
            <BagIcon />
          </button>
        </div>
      </Container>

      {/* Bottom bar: main navigation */}
      <Container className="flex items-center justify-between h-16 md:border-t border-charcoal/10 md:py-4">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="md:hidden p-2 -m-2 text-charcoal hover:text-champagne transition-colors duration-600"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>

        <Link href="/" className="md:hidden font-serif text-3xl tracking-tight text-charcoal">
          {t("header_brand_text", "OPAL & CO")}
        </Link>

        <nav className="hidden md:flex items-center justify-center gap-10 xl:gap-14 flex-1" aria-label="Main navigation">
          {navItems.map((item) => (
            <UiLink key={item.href} href={item.href} className="font-sans text-xs uppercase tracking-[0.2em] text-charcoal hover:text-champagne transition-colors duration-fast">
              {item.label}
            </UiLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <button
            ref={triggerRef}
            type="button"
            onClick={openSearch}
            className="p-2 -m-2 text-charcoal hover:text-champagne transition-colors duration-600"
            aria-label="Open search"
          >
            <SearchIcon />
          </button>
          <UiLink href="/stores" className="p-2 -m-2 text-charcoal hover:text-champagne transition-colors duration-600" aria-label="Stores">
            <LocationIcon />
          </UiLink>
          <button
            type="button"
            onClick={openAccount}
            className="p-2 -m-2 text-charcoal hover:text-champagne transition-colors duration-600"
            aria-label="Open account"
          >
            <PersonIcon />
          </button>
          <button
            type="button"
            onClick={openCart}
            className="p-2 -m-2 text-charcoal hover:text-champagne transition-colors duration-600"
            aria-label="Open cart"
          >
            <BagIcon />
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="mobile-overlay"
              role="presentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-charcoal/40 md:hidden"
              onClick={closeMobile}
              aria-hidden="true"
            />
            <motion.nav
              key="mobile-nav"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-16 left-4 right-4 z-[51] md:hidden bg-ivory border border-charcoal/10 shadow-lg py-6 px-6"
              aria-label="Mobile navigation"
            >
              <ul className="space-y-4">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      openSearch();
                      closeMobile();
                    }}
                    className="block w-full text-left font-sans text-base uppercase tracking-[0.15em] text-charcoal hover:text-champagne transition-colors duration-600 py-2"
                  >
                    Search
                  </button>
                </li>
                <li>
                  <Link href="/stores" onClick={closeMobile} className="block font-sans text-base uppercase tracking-[0.15em] text-charcoal hover:text-champagne transition-colors duration-600 py-2">
                    Stores
                  </Link>
                </li>
                <li>
                  <Link href="/appointments" onClick={closeMobile} className="block font-sans text-base uppercase tracking-[0.15em] text-charcoal hover:text-champagne transition-colors duration-600 py-2">
                    Schedule an appointment
                  </Link>
                </li>
                <li className="pt-4 border-t border-charcoal/10 mt-4">
                  <button
                    type="button"
                    onClick={() => { openAccount(); closeMobile(); }}
                    className="flex items-center justify-between w-full font-sans text-sm uppercase tracking-[0.15em] text-charcoal hover:text-champagne py-2 group text-left"
                  >
                    Account <span className="group-hover:translate-x-1 transition-transform">›</span>
                  </button>
                </li>
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMobile}
                      className="block font-sans text-base uppercase tracking-[0.15em] text-charcoal hover:text-champagne transition-colors duration-600 py-2"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
