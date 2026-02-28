"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Text } from "@/components/ui";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        setSubmitted(true);
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
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
          Thank you. Your account has been created. You may now sign in.
        </Text>
        <Link
          href="/sign-in"
          className="inline-block mt-6 font-sans text-xs uppercase tracking-[0.2em] text-charcoal hover:text-champagne transition-colors duration-fast"
        >
          Sign in
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
          htmlFor="reg-name"
          className="block font-sans text-xs uppercase tracking-[0.2em] text-charcoal mb-2"
        >
          Name
        </label>
        <input
          id="reg-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-3 border border-charcoal/20 bg-ivory font-sans text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/40 transition-colors"
          placeholder="Your name"
        />
      </div>
      <div>
        <label
          htmlFor="reg-email"
          className="block font-sans text-xs uppercase tracking-[0.2em] text-charcoal mb-2"
        >
          Email
        </label>
        <input
          id="reg-email"
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
          htmlFor="reg-password"
          className="block font-sans text-xs uppercase tracking-[0.2em] text-charcoal mb-2"
        >
          Password
        </label>
        <input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-4 py-3 border border-charcoal/20 bg-ivory font-sans text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/40 transition-colors"
          placeholder="At least 8 characters"
        />
      </div>
      <div>
        <label
          htmlFor="reg-confirm"
          className="block font-sans text-xs uppercase tracking-[0.2em] text-charcoal mb-2"
        >
          Confirm password
        </label>
        <input
          id="reg-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full px-4 py-3 border border-charcoal/20 bg-ivory font-sans text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/40 transition-colors"
          placeholder="Confirm your password"
        />
      </div>
      <Button type="submit" variant="subtle">
        Create account
      </Button>
    </form>
  );
}
