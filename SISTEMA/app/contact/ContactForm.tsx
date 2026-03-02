"use client";

import { useState } from "react";
import { Button, Text } from "@/components/ui";
import { useSiteText } from "@/components/providers/SiteTextProvider";

export function ContactForm() {
  const { t } = useSiteText();
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
          {t("form_contact_thank_you", "Thank you. We have received your message and will respond within twenty-four hours.")}
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
          {t("form_contact_label_name", "Name")}
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-3 border border-charcoal/20 bg-ivory font-sans text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/40 transition-colors"
          placeholder={t("form_contact_placeholder_name", "Your name")}
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="block font-sans text-xs uppercase tracking-[0.2em] text-charcoal mb-2"
        >
          {t("form_contact_label_email", "Email")}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border border-charcoal/20 bg-ivory font-sans text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/40 transition-colors"
          placeholder={t("form_contact_placeholder_email", "your@email.com")}
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="block font-sans text-xs uppercase tracking-[0.2em] text-charcoal mb-2"
        >
          {t("form_contact_label_message", "Message")}
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={6}
          className="w-full px-4 py-3 border border-charcoal/20 bg-ivory font-sans text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/40 transition-colors resize-none"
          placeholder={t("form_contact_placeholder_message", "Your message")}
        />
      </div>
      <Button type="submit" variant="subtle">
        {t("form_contact_submit", "Send")}
      </Button>
    </form>
  );
}
