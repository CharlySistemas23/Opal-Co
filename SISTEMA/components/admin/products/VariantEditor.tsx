"use client";

import { useState } from "react";
import { Button, Text } from "@/components/ui";

interface Variant {
  id?: string;
  sku: string;
  title: string;
  priceCents: number;
  currency: string;
  active: boolean;
}

interface VariantEditorProps {
  productId: string;
  variants: Variant[];
  onSaved?: () => void;
}

export function VariantEditor({ productId, variants: initialVariants, onSaved }: VariantEditorProps) {
  const [variants, setVariants] = useState<Variant[]>(
    initialVariants.map((v) => ({
      id: v.id,
      sku: v.sku,
      title: v.title,
      priceCents: v.priceCents,
      currency: v.currency ?? "USD",
      active: v.active ?? true,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass = "px-3 py-2 border border-charcoal/20 rounded text-charcoal bg-ivory font-sans text-sm";
  const labelClass = "block text-xs uppercase tracking-wider text-charcoal/70 mb-1";

  function addVariant() {
    setVariants([...variants, { sku: "", title: "", priceCents: 0, currency: "USD", active: true }]);
  }

  function updateVariant(i: number, updates: Partial<Variant>) {
    const next = [...variants];
    next[i] = { ...next[i]!, ...updates };
    setVariants(next);
  }

  function removeVariant(i: number) {
    setVariants(variants.filter((_, j) => j !== i));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}/variants`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variants: variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            title: v.title,
            priceCents: v.priceCents,
            currency: v.currency,
            active: v.active,
          })),
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Failed to save");
        return;
      }
      onSaved?.();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Text variant="body" className="font-medium">Variants</Text>
        <Button type="button" variant="subtle" onClick={addVariant}>
          + Add variant
        </Button>
      </div>
      {variants.map((v, i) => (
        <div key={i} className="border border-charcoal/10 rounded p-4 flex flex-wrap gap-4">
          <div>
            <label className={labelClass}>SKU</label>
            <input
              type="text"
              className={inputClass}
              value={v.sku}
              onChange={(e) => updateVariant(i, { sku: e.target.value })}
              placeholder="SKU-001"
            />
          </div>
          <div>
            <label className={labelClass}>Title</label>
            <input
              type="text"
              className={inputClass}
              value={v.title}
              onChange={(e) => updateVariant(i, { title: e.target.value })}
              placeholder="Default"
            />
          </div>
          <div>
            <label className={labelClass}>Price (cents)</label>
            <input
              type="number"
              className={inputClass}
              value={v.priceCents}
              onChange={(e) => updateVariant(i, { priceCents: parseInt(e.target.value, 10) || 0 })}
              min={0}
            />
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <input
              type="text"
              className={inputClass}
              value={v.currency}
              onChange={(e) => updateVariant(i, { currency: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 self-end">
            <input
              type="checkbox"
              checked={v.active}
              onChange={(e) => updateVariant(i, { active: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Active</span>
          </label>
          <button type="button" onClick={() => removeVariant(i)} className="text-red-600 text-sm hover:underline self-end">
            Remove
          </button>
        </div>
      ))}
      <Button type="button" onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Save variants"}
      </Button>
      {error && <Text variant="body" className="text-red-600">{error}</Text>}
    </div>
  );
}
