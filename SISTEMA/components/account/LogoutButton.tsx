"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

export function LogoutButton() {
  const router = useRouter();
  const { refetch } = useCustomerAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/public/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      await refetch();
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="subtle"
      onClick={handleLogout}
      disabled={loading}
    >
      {loading ? "Signing out..." : "Sign out"}
    </Button>
  );
}
