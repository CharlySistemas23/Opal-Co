"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

export interface SearchProduct {
  handle: string;
  title: string;
  material?: string;
  price: string;
  byInquiry: boolean;
  image?: string;
}

interface SearchContextValue {
  isOpen: boolean;
  query: string;
  results: SearchProduct[];
  isLoading: boolean;
  error: string | null;
  open: () => void;
  close: () => void;
  setQuery: (q: string) => void;
  search: (q: string) => Promise<void>;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQueryState] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const open = useCallback(() => {
    setIsOpen(true);
    setQueryState("");
    setResults([]);
    setError(null);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQueryState("");
    setResults([]);
    setError(null);
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, []);

  const setQuery = useCallback((q: string) => {
    setQueryState(q);
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setError("Search failed");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <SearchContext.Provider
      value={{
        isOpen,
        query,
        results,
        isLoading,
        error,
        open,
        close,
        setQuery,
        search,
        triggerRef,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}
