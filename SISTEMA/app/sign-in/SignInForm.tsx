"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Text } from "@/components/ui";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSubmitted(true);
          setEmail("");
          setPassword("");
        } else {
          setError(data.error || "Invalid email or password.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <Text variant="body" className="text-charcoal">
          You have signed in successfully. Welcome back.
        </Text>
        <Link
          href="/"
          className="inline-block mt-6 font-sans text-xs uppercase tracking-[0.2em] text-charcoal hover:text-champagne transition-colors duration-fast"
        >
          Continue to homepage
        </Link>
      </div>
    );
  }

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
      <Button type="submit" variant="subtle">
        Sign in
      </Button>
    </form>
  );
}
