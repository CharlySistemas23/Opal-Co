"use client";

import { useEffect, useState } from "react";
import { Container, Section, Heading, Text, Button } from "@/components/ui";
import { DEFAULT_SITE_TEXT } from "@/lib/constants/siteText";

const FORM_KEYS = [
  { id: "contact", label: "Contact form", keys: [
    "form_contact_label_name", "form_contact_label_email", "form_contact_label_message",
    "form_contact_placeholder_name", "form_contact_placeholder_email", "form_contact_placeholder_message",
    "form_contact_submit", "form_contact_thank_you", "form_contact_redirect_url",
  ]},
  { id: "newsletter", label: "Newsletter form", keys: [
    "newsletter_title", "newsletter_body", "newsletter_placeholder", "newsletter_button", "newsletter_thank_you",
  ]},
];

const inputClass = "w-full max-w-md px-3 py-2 border border-charcoal/20 rounded text-charcoal bg-ivory font-sans text-sm";
const labelClass = "block text-xs uppercase tracking-wider text-charcoal/70 mt-3 mb-1";

export default function AdminFormsPage() {
  const [map, setMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site-settings", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const defaults: Record<string, string> = {};
        FORM_KEYS.forEach((s) => s.keys.forEach((k) => { defaults[k] = DEFAULT_SITE_TEXT[k] ?? ""; }));
        setMap({ ...defaults, ...data?.data });
      })
      .finally(() => setLoading(false));
  }, []);

  const update = (key: string, value: string) => {
    setMap((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const items = Object.entries(map)
        .filter(([k]) => FORM_KEYS.some((s) => s.keys.includes(k)))
        .map(([key, value]) => ({ key, value: value ?? "" }));
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Section background="stone" spacing="default">
        <Container>
          <Text variant="body" muted>Loading…</Text>
        </Container>
      </Section>
    );
  }

  return (
    <Section background="stone" spacing="default">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Heading as="h1" level={2} className="text-charcoal">
            Forms
          </Heading>
          <div className="flex items-center gap-4">
            {saved && <Text variant="small" className="text-green-600">Saved</Text>}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
        <Text variant="body" muted className="mb-8">
          Edit labels, placeholders, submit text, thank-you messages, and redirect URLs for forms used across the site.
        </Text>

        <div className="space-y-12">
          {FORM_KEYS.map((section) => (
            <div key={section.id} className="border border-charcoal/10 rounded p-6">
              <Heading as="h2" level={4} className="text-charcoal mb-4">
                {section.label}
              </Heading>
              <div className="space-y-4">
                {section.keys.map((key) => (
                  <div key={key}>
                    <label className={labelClass}>{key.replace(/form_contact_|form_newsletter_|newsletter_/g, "").replace(/_/g, " ")}</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={map[key] ?? ""}
                      onChange={(e) => update(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
