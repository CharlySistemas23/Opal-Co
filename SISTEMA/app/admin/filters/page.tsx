"use client";

import { useEffect, useState } from "react";
import { Container, Section, Heading, Text, Button } from "@/components/ui";

interface FilterOption {
  value: string;
  label: string;
}

const DEFAULT_OPTIONS: FilterOption[] = [
  { value: "rings", label: "Rings" },
  { value: "necklaces", label: "Necklaces" },
  { value: "earrings", label: "Earrings" },
  { value: "bracelets", label: "Bracelets" },
];

const inputClass = "w-full max-w-xs px-3 py-2 border border-charcoal/20 rounded text-charcoal bg-ivory font-sans text-sm";
const labelClass = "block text-xs uppercase tracking-wider text-charcoal/70 mt-3 mb-1";

export default function AdminFiltersPage() {
  const [options, setOptions] = useState<FilterOption[]>(DEFAULT_OPTIONS);
  const [layout, setLayout] = useState<"horizontal" | "sidebar">("horizontal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site-settings", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const d = data?.data ?? {};
        const raw = d.filter_options;
        if (raw && typeof raw === "string") {
          try {
            const parsed = JSON.parse(raw) as FilterOption[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              setOptions(parsed);
            }
          } catch {
            // keep defaults
          }
        }
        const l = d.collection_filter_layout;
        if (l === "sidebar" || l === "horizontal") setLayout(l);
      })
      .finally(() => setLoading(false));
  }, []);

  const updateOption = (index: number, field: "value" | "label", val: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const addOption = () => {
    setOptions((prev) => [...prev, { value: "", label: "" }]);
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const items = [
        { key: "filter_options", value: JSON.stringify(options.filter((o) => o.value.trim() || o.label.trim())) },
        { key: "collection_filter_layout", value: layout },
      ];
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
            Filters
          </Heading>
          <div className="flex items-center gap-4">
            {saved && <Text variant="small" className="text-green-600">Saved</Text>}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
        <Text variant="body" muted className="mb-8">
          Configure filter options shown on collection pages (e.g. Rings, Necklaces). Products with matching productType will be filterable.
        </Text>

        <div className="mb-8 p-4 border border-charcoal/10 rounded">
          <label className={labelClass}>Filter layout</label>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="layout"
                checked={layout === "horizontal"}
                onChange={() => setLayout("horizontal")}
                className="rounded"
              />
              <span className="text-sm">Horizontal</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="layout"
                checked={layout === "sidebar"}
                onChange={() => setLayout("sidebar")}
                className="rounded"
              />
              <span className="text-sm">Sidebar</span>
            </label>
          </div>
        </div>

        <div className="space-y-4 max-w-2xl">
          {options.map((opt, i) => (
            <div key={i} className="flex flex-wrap gap-4 items-end border border-charcoal/10 rounded p-4">
              <div>
                <label className={labelClass}>Value (slug)</label>
                <input
                  type="text"
                  className={inputClass}
                  value={opt.value}
                  onChange={(e) => updateOption(i, "value", e.target.value)}
                  placeholder="rings"
                />
              </div>
              <div>
                <label className={labelClass}>Label</label>
                <input
                  type="text"
                  className={inputClass}
                  value={opt.label}
                  onChange={(e) => updateOption(i, "label", e.target.value)}
                  placeholder="Rings"
                />
              </div>
              <button
                type="button"
                onClick={() => removeOption(i)}
                className="px-3 py-2 text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            className="text-sm text-charcoal/70 hover:text-charcoal underline"
          >
            + Add filter option
          </button>
        </div>
      </Container>
    </Section>
  );
}
