"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Section, Heading, Text, Button } from "@/components/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (data.error) {
        if (data.error === "USER_NOT_FOUND") {
          setError("No account found for this email.");
        } else if (data.error === "INVALID_EMAIL") {
          setError("Please enter a valid email address.");
        } else if (data.error === "INVALID_BODY" || data.error === "INVALID_REQUEST") {
          setError("Invalid request. Please try again.");
        } else if (data.error === "UNAVAILABLE") {
          setError("Service temporarily unavailable. Try again later.");
        } else {
          setError("Something went wrong.");
        }
        return;
      }
      setStep("code");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.replace(/\s/g, ""),
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error === "INVALID_CODE" ? "Invalid or expired code." : "Something went wrong.");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section background="stone" spacing="default">
      <Container className="max-w-md">
        <Heading as="h1" level={2} className="mb-6 text-charcoal">
          Admin login
        </Heading>
        <Text variant="body" muted className="mb-8">
          Sign in with your staff email. We’ll send you a one-time code.
        </Text>

        {step === "email" ? (
          <form onSubmit={handleRequestCode} className="space-y-6">
            {error && (
              <p className="font-sans text-sm text-charcoal/80" role="alert">
                {error}
              </p>
            )}
            <div>
              <label
                htmlFor="admin-email"
                className="block font-sans text-xs uppercase tracking-[0.2em] text-charcoal mb-2"
              >
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 border border-charcoal/20 bg-ivory font-sans text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/40 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Sending…" : "Send code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            {error && (
              <p className="font-sans text-sm text-charcoal/80" role="alert">
                {error}
              </p>
            )}
            <p className="font-sans text-sm text-charcoal/80">
              Code sent to <strong>{email}</strong>.{" "}
              <button
                type="button"
                onClick={() => { setStep("email"); setCode(""); setError(null); }}
                className="underline hover:no-underline"
              >
                Use another email
              </button>
            </p>
            <div>
              <label
                htmlFor="admin-code"
                className="block font-sans text-xs uppercase tracking-[0.2em] text-charcoal mb-2"
              >
                Code
              </label>
              <input
                id="admin-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
                className="w-full px-4 py-3 border border-charcoal/20 bg-ivory font-sans text-charcoal text-center text-lg tracking-[0.3em] placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/40 transition-colors"
                placeholder="000000"
              />
            </div>
            <Button type="submit" disabled={loading || code.length !== 6}>
              {loading ? "Verifying…" : "Verify"}
            </Button>
          </form>
        )}
      </Container>
    </Section>
  );
}
