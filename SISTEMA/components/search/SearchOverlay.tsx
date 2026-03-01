"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSearch } from "@/context/SearchContext";
import { createFocusTrap } from "@/utils/focusTrap";
import { Text } from "@/components/ui";
import { formatPrice } from "@/utils/formatPrice";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function SearchOverlay() {
  const { isOpen, close, query, setQuery, results, isLoading, error, search } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const runSearch = useCallback(
    (q: string) => {
      setQuery(q);
      search(q);
    },
    [search, setQuery]
  );

  useEffect(() => {
    if (!isOpen) return;
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const cleanup = createFocusTrap(containerRef.current, {
      initialFocus: inputRef.current ?? undefined,
      onEscape: close,
    });
    return cleanup;
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleResultClick = (handle: string) => {
    close();
    router.push(`/products/${handle}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: prefersReducedMotion() ? 0 : 0.2 }}
        className="fixed inset-0 z-[60] flex items-start justify-center bg-charcoal/40"
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: prefersReducedMotion() ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 md:mt-32 w-full max-w-2xl mx-4 bg-ivory shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center border-b border-charcoal/10">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => runSearch(e.target.value)}
              placeholder="Search pieces"
              autoComplete="off"
              className="flex-1 px-6 py-5 font-sans text-charcoal placeholder:text-charcoal/40 bg-transparent focus:outline-none"
              aria-label="Search products"
            />
            <button
              type="button"
              onClick={close}
              className="p-4 text-charcoal hover:text-champagne transition-colors"
              aria-label="Close search"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-4">
            {!query.trim() && (
              <Text variant="body" muted className="py-8 text-center">
                Search pieces
              </Text>
            )}
            {query.trim() && isLoading && (
              <Text variant="body" muted className="py-8 text-center">
                Searching…
              </Text>
            )}
            {query.trim() && !isLoading && error && (
              <Text variant="body" muted className="py-8 text-center">
                {error}
              </Text>
            )}
            {query.trim() && !isLoading && !error && results.length === 0 && (
              <div className="py-8 text-center space-y-4">
                <Text variant="body" muted>
                  No results for “{query}”
                </Text>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    runSearch("");
                  }}
                  className="font-sans text-sm uppercase tracking-[0.2em] text-charcoal hover:text-champagne transition-colors"
                >
                  Clear search
                </button>
              </div>
            )}
            {!isLoading && !error && results.length > 0 && (
              <ul className="space-y-2" role="list">
                {results.map((r) => (
                  <li key={r.handle}>
                    <button
                      type="button"
                      onClick={() => handleResultClick(r.handle)}
                      className="w-full flex items-center gap-4 p-4 text-left hover:bg-charcoal/5 transition-colors group"
                    >
                      {r.image && (
                        <div className="relative w-16 h-16 flex-shrink-0 bg-charcoal/5">
                          <Image
                            src={r.image}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="64px"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-charcoal group-hover:text-champagne transition-colors">
                          {r.title}
                        </span>
                        {r.material && (
                          <Text variant="small" muted className="mt-0.5">
                            {r.material}
                          </Text>
                        )}
                      </div>
                      <span className="font-sans text-sm text-charcoal/80">
                        {r.byInquiry ? "By inquiry" : formatPrice(r.price, "USD")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
