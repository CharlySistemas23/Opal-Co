"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface AccountContextValue {
  isOpen: boolean;
  openAccount: () => void;
  closeAccount: () => void;
}

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openAccount = useCallback(() => setIsOpen(true), []);
  const closeAccount = useCallback(() => setIsOpen(false), []);

  return (
    <AccountContext.Provider value={{ isOpen, openAccount, closeAccount }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used within AccountProvider");
  return ctx;
}
