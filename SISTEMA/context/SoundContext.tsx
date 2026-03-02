"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface SoundContextValue {
  isEnabled: boolean;
  toggle: () => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("opal-sound-enabled");
    if (stored === "true") setIsEnabled(true);
  }, []);

  const toggle = useCallback(() => {
    setIsEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("opal-sound-enabled", String(next));
      return next;
    });
  }, []);

  return (
    <SoundContext.Provider value={{ isEnabled, toggle }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundContext() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSoundContext must be used within SoundProvider");
  return ctx;
}
