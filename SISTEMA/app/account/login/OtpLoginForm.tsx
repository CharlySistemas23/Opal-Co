"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

type Step = "email" | "code";

export function OtpLoginForm() {
  const router = useRouter();
  const { refetch } = useCustomerAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/public/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (res.ok && !data.error) {
        setStep("code");
      } else if (data.error === "RATE_LIMITED") {
        setError("Too many attempts. Please try again in 15 minutes.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = code.trim().replace(/\s/g, "");
    if (!trimmed || !/^\d{6}$/.test(trimmed)) {
      setError("Please enter the 6-digit code from your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/public/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: trimmed }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && !data.error) {
        await refetch();
        router.push("/account");
        router.refresh();
      } else if (data.error === "RATE_LIMITED") {
        setError("Too many attempts. Please try again in 15 minutes.");
      } else {
        setError("Invalid code. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "email") {
    return (
      <form onSubmit={handleRequestCode} className="space-y-8">
        {error && (
          <p className="font-sans text-sm text-charcoal/80">{error}</p>
        )}
        <div>
          <label
            htmlFor="otp-email"
            className="block font-sans text-xs uppercase tracking-[0.2em] text-charcoal mb-2"
          >
            Email
          </label>
          <input
            id="otp-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-charcoal/20 bg-ivory font-sans text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/40 transition-colors"
            placeholder="your@email.com"
          />
        </div>
        <Button type="submit" variant="subtle" disabled={loading}>
          {loading ? "Sending..." : "Send code"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyCode} className="space-y-8">
      {error && <p className="font-sans text-sm text-charcoal/80">{error}</p>}
      <p className="font-sans text-sm text-charcoal/80">
        We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
      </p>
      <div>
        <label
          htmlFor="otp-code"
          className="block font-sans text-xs uppercase tracking-[0.2em] text-charcoal mb-2"
        >
          Verification code
        </label>
        <input
          id="otp-code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          required
          className="w-full px-4 py-3 border border-charcoal/20 bg-ivory font-sans text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/40 transition-colors"
          placeholder="000000"
        />
      </div>
      <div className="flex flex-col gap-4">
        <Button type="submit" variant="subtle" disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setStep("email");
            setCode("");
            setError(null);
          }}
          className="font-sans text-xs uppercase tracking-[0.2em] text-charcoal/70 hover:text-charcoal transition-colors"
        >
          Use a different email
        </button>
      </div>
    </form>
  );
}
