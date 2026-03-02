"use client";

import { useEffect, useState } from "react";
import { Container, Section, Heading, Text, Button } from "@/components/ui";
import { DEFAULT_SITE_TEXT } from "@/lib/constants/siteText";

const SECTIONS = [
  { id: "account_drawer", label: "Account drawer", keys: ["account_drawer_title", "account_drawer_close", "account_drawer_loading", "account_drawer_welcome_prefix", "account_drawer_logged_in_desc", "account_drawer_link_account", "account_drawer_link_orders", "account_drawer_sign_in_prompt", "account_drawer_sign_in_desc", "account_drawer_link_sign_in", "account_drawer_link_register"] },
  { id: "cart", label: "Cart", keys: ["cart_title", "cart_close", "cart_empty_message", "cart_continue_shopping", "cart_view_bag", "cart_checkout", "cart_unavailable_message", "cart_contact_us", "cart_remove", "cart_subtotal"] },
  { id: "footer", label: "Footer", keys: ["footer_copyright", "footer_legal_title"] },
  { id: "header", label: "Header", keys: ["header_brand_text"] },
  { id: "hero_fallback", label: "Hero fallback (home)", keys: ["hero_fallback_headline", "hero_fallback_image_url"] },
  { id: "newsletter", label: "Newsletter", keys: ["newsletter_title", "newsletter_body", "newsletter_placeholder", "newsletter_button", "newsletter_thank_you"] },
  { id: "high_jewelry", label: "High Jewelry page", keys: ["high_jewelry_hero_title", "high_jewelry_hero_image_url"] },
  { id: "journal", label: "Journal page", keys: ["journal_hero_title", "journal_hero_subtitle"] },
  { id: "contact_fallback", label: "Contact fallback", keys: ["contact_fallback_title", "contact_fallback_body", "contact_fallback_email", "contact_fallback_appointment"] },
  { id: "collections", label: "Collections page", keys: ["collections_page_title", "collections_page_subtitle"] },
  { id: "search_overlay", label: "Search overlay", keys: ["search_placeholder", "search_empty", "search_searching", "search_no_results_prefix", "search_clear", "search_by_inquiry"] },
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
