"use client";

import { useState } from "react";
import { Button, Text } from "@/components/ui";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        setSubmitted(true);
        setName("");
        setEmail("");
        setMessage("");
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
          Thank you. We have received your message and will respond within twenty-four hours.
        </Text>
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
          htmlFor="name"
          className="block font-sans text-xs uppercase tracking-[0.2em] text-charcoal mb-2"
        >
          Name
        </label>
        <input
          id="name"
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
          htmlFor="email"
          className="block font-sans text-xs uppercase tracking-[0.2em] text-charcoal mb-2"
        >
          Email
        </label>
        <input
          id="email"
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
          htmlFor="message"
          className="block font-sans text-xs uppercase tracking-[0.2em] text-charcoal mb-2"
        >
          Message
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={6}
          className="w-full px-4 py-3 border border-charcoal/20 bg-ivory font-sans text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/40 transition-colors resize-none"
          placeholder="Your message"
        />
      </div>
      <Button type="submit" variant="subtle">
        Send Inquiry
      </Button>
    </form>
  );
}
