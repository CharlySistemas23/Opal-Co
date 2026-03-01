"use client";

import { useEffect, useState } from "react";
import { Container, Section, Heading, Text, Button } from "@/components/ui";
import { DEFAULT_SITE_TEXT } from "@/lib/constants/siteText";

const SECTIONS = [
  { id: "cart", label: "Cart", keys: ["cart_title", "cart_close", "cart_empty_message", "cart_continue_shopping", "cart_view_bag", "cart_checkout"] },
  { id: "footer", label: "Footer", keys: ["footer_copyright", "footer_legal_title"] },
  { id: "header", label: "Header", keys: ["header_brand_text"] },
];

const inputClass = "w-full max-w-md px-3 py-2 border border-charcoal/20 rounded text-charcoal bg-ivory font-sans text-sm";
const labelClass = "block text-xs uppercase tracking-wider text-charcoal/70 mt-3 mb-1";

export default function AdminSiteSettingsPage() {
  const [map, setMap] = useState<Record<string, string>>({ ...DEFAULT_SITE_TEXT });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site-settings", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setMap({ ...DEFAULT_SITE_TEXT, ...data.data });
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
      const items = Object.entries(map).map(([key, value]) => ({ key, value }));
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
            Site Text
          </Heading>
          <div className="flex items-center gap-4">
            {saved && <Text variant="small" className="text-green-600">Saved</Text>}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
        <Text variant="body" muted className="mb-8">
          Edit the text shown in the cart, footer, header, and other areas of the site.
        </Text>

        <div className="space-y-12">
          {SECTIONS.map((section) => (
            <div key={section.id} className="border border-charcoal/10 rounded p-6">
              <Heading as="h2" level={4} className="text-charcoal mb-4">
                {section.label}
              </Heading>
              <div className="space-y-4">
                {section.keys.map((key) => (
                  <div key={key}>
                    <label className={labelClass}>{key.replace(/_/g, " ")}</label>
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
