"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Text } from "@/components/ui";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Email o contraseña incorrectos.",
  INVALID_EMAIL: "Introduce un email válido.",
  PASSWORD_NOT_SET:
    "Esta cuenta usa acceso por código. Ve a Iniciar sesión y solicita un código.",
  UNAVAILABLE: "El servicio no está disponible. Intenta más tarde.",
};

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/account");
        router.refresh();
        return;
      }
      setError(
        ERROR_MESSAGES[data.error] ||
          data.error ||
          "Email o contraseña incorrectos."
      );
    } catch {
      setError("Algo salió mal. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <p className="font-sans text-sm text-charcoal/80">{error}</p>
      )}
      <div>
        <label
          htmlFor="signin-email"
          className="block font-sans text-xs uppercase tracking-[0.2em] text-charcoal mb-2"
        >
          Email
        </label>
        <input
          id="signin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border border-charcoal/20 bg-ivory font-sans text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/40 transition-colors"
          placeholder="your@email.com"
        />
      </div>
      <div>
        <label
          htmlFor="signin-password"
          className="block font-sans text-xs uppercase tracking-[0.2em] text-charcoal mb-2"
        >
          Password
        </label>
        <input
          id="signin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 border border-charcoal/20 bg-ivory font-sans text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/40 transition-colors"
          placeholder="Your password"
        />
      </div>
      <Button type="submit" variant="subtle" disabled={loading}>
        {loading ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>
    </form>
  );
}
