"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { DEFAULT_SITE_TEXT } from "@/lib/constants/siteText";

type SiteTextMap = Record<string, string>;

const SiteTextContext = createContext<{
  get: (key: string, fallback?: string) => string;
  map: SiteTextMap;
} | null>(null);

export function SiteTextProvider({
  initialSiteText,
  children,
}: {
  initialSiteText: SiteTextMap;
  children: React.ReactNode;
}) {
  const map = useMemo(
    () => ({ ...DEFAULT_SITE_TEXT, ...initialSiteText }),
    [initialSiteText]
  );
  const get = useCallback(
    (key: string, fallback?: string) => map[key] ?? fallback ?? "",
    [map]
  );

  return (
    <SiteTextContext.Provider value={{ get, map }}>
      {children}
    </SiteTextContext.Provider>
  );
}

export function useSiteText() {
  const ctx = useContext(SiteTextContext);
  if (!ctx) {
    return {
      t: (key: string, fallback?: string) =>
        DEFAULT_SITE_TEXT[key] ?? fallback ?? "",
      map: DEFAULT_SITE_TEXT,
    };
  }
  return {
    t: ctx.get,
    map: ctx.map,
  };
}
