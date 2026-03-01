"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

export function AppointmentForm() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, preferredDate: date, message }),
      });
      if (res.ok) {
        setSubmitted(true);
        setName("");
        setEmail("");
        setDate("");
        setMessage("");
      }
    } catch {
      setSubmitted(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <p className="font-sans text-charcoal">
          Thank you. We have received your request and will be in touch within twenty-four hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label htmlFor="appt-name" className="block font-sans text-xs uppercase tracking-[0.2em] text-charcoal mb-2">
          Name
        </label>
        <input
          id="appt-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-3 border border-charcoal/20 bg-ivory font-sans text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/40 transition-colors"
          placeholder="Your name"
        />
      </div>
      <div>
        <label htmlFor="appt-email" className="block font-sans text-xs uppercase tracking-[0.2em] text-charcoal mb-2">
          Email
        </label>
        <input
          id="appt-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border border-charcoal/20 bg-ivory font-sans text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/40 transition-colors"
          placeholder="your@email.com"
        />
      </div>
      <div>
        <label htmlFor="appt-date" className="block font-sans text-xs uppercase tracking-[0.2em] text-charcoal mb-2">
          Preferred date (optional)
        </label>
        <input
          id="appt-date"
          type="text"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-3 border border-charcoal/20 bg-ivory font-sans text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/40 transition-colors"
          placeholder="e.g. Next week"
        />
      </div>
      <div>
        <label htmlFor="appt-message" className="block font-sans text-xs uppercase tracking-[0.2em] text-charcoal mb-2">
          Message
        </label>
        <textarea
          id="appt-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-charcoal/20 bg-ivory font-sans text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-charcoal/40 transition-colors resize-none"
          placeholder="Tell us how we can help"
        />
      </div>
      <Button type="submit" variant="subtle">
        Request appointment
      </Button>
    </form>
  );
}
