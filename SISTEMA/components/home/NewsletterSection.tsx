"use client";

import { useState } from "react";
import { RevealOnScroll, Heading, Text, Button } from "@/components/ui";
import { Container } from "@/components/ui";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/public/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source: "homepage" }),
      });
      const data = await res.json();
      if (res.ok && !data.error) {
        setSubmitted(true);
        setEmail("");
      } else if (data.error === "EMAIL_NOT_CONFIGURED") {
        setError(
          "Email service not configured. Subscriptions are temporarily unavailable."
        );
      } else if (data.error === "EMAIL_FAILED") {
        setError("Unable to send confirmation. Please try again later.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-stone">
      <Container>
        <RevealOnScroll>
          <div className="max-w-[600px] mx-auto text-center">
            <Heading as="h2" level={3} className="mb-4 text-charcoal">
              Stay Connected
            </Heading>
            <Text variant="body" muted className="mb-8">
              Receive early access to new collections, stories from the atelier, and invitations to private events.
            </Text>
            {submitted ? (
              <Text variant="body" className="text-charcoal">
                Thank you. Please check your email to confirm.
              </Text>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                {error && (
                  <p className="w-full font-sans text-sm text-charcoal/80">
                    {error}
                  </p>
                )}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="flex-1 min-w-0 px-4 py-3 border border-charcoal/20 bg-ivory font-sans text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/40 transition-colors"
                />
                <Button
                  type="submit"
                  variant="subtle"
                  className="shrink-0"
                  disabled={loading}
                >
                  {loading ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
            )}
          </div>
        </RevealOnScroll>
      </Container>
    </section>
  );
}
