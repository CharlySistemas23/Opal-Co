"use client";

import { useState } from "react";
import { Button, Text } from "@/components/ui";

interface ProductFormProps {
  product: {
    id: string;
    handle: string;
    title: string;
    description: string | null;
    productType?: string | null;
    materialSummary: string | null;
    gemstoneSummary: string | null;
    careText?: string | null;
    detailsText?: string | null;
    byInquiry: boolean;
    published: boolean;
  };
  onSaved?: () => void;
}

export function ProductForm({ product, onSaved }: ProductFormProps) {
  const [title, setTitle] = useState(product.title);
  const [handle, setHandle] = useState(product.handle);
  const [description, setDescription] = useState(product.description ?? "");
  const [productType, setProductType] = useState(product.productType ?? "");
  const [materialSummary, setMaterialSummary] = useState(product.materialSummary ?? "");
  const [gemstoneSummary, setGemstoneSummary] = useState(product.gemstoneSummary ?? "");
  const [careText, setCareText] = useState(product.careText ?? "");
  const [detailsText, setDetailsText] = useState(product.detailsText ?? "");
  const [byInquiry, setByInquiry] = useState(product.byInquiry);
  const [published, setPublished] = useState(product.published);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass = "w-full max-w-md px-3 py-2 border border-charcoal/20 rounded text-charcoal bg-ivory font-sans text-sm";
  const labelClass = "block text-xs uppercase tracking-wider text-charcoal/70 mt-3 mb-1";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          handle,
          description: description || null,
          productType: productType.trim() || null,
          materialSummary: materialSummary || null,
          gemstoneSummary: gemstoneSummary || null,
          careText: careText || null,
          detailsText: detailsText || null,
          byInquiry,
          published,
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className={labelClass}>Title</label>
      <input type="text" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
      <label className={labelClass}>Handle</label>
      <input type="text" className={inputClass} value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="product-handle" />
      <label className={labelClass}>Description</label>
      <textarea className={inputClass} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
      <label className={labelClass}>Product type (for filters, e.g. rings, necklaces)</label>
      <input type="text" className={inputClass} value={productType} onChange={(e) => setProductType(e.target.value)} placeholder="rings" />
      <label className={labelClass}>Material summary</label>
      <input type="text" className={inputClass} value={materialSummary} onChange={(e) => setMaterialSummary(e.target.value)} />
      <label className={labelClass}>Gemstone summary</label>
      <input type="text" className={inputClass} value={gemstoneSummary} onChange={(e) => setGemstoneSummary(e.target.value)} />
      <label className={labelClass}>Care instructions</label>
      <textarea className={inputClass} rows={3} value={careText} onChange={(e) => setCareText(e.target.value)} placeholder="e.g. Store in a soft pouch. Avoid contact with chemicals." />
      <label className={labelClass}>Details</label>
      <textarea className={inputClass} rows={3} value={detailsText} onChange={(e) => setDetailsText(e.target.value)} placeholder="e.g. Handcrafted with precision. Each piece is unique." />
      <label className="flex items-center gap-2 mt-4">
        <input type="checkbox" checked={byInquiry} onChange={(e) => setByInquiry(e.target.checked)} className="rounded" />
        <span className="text-sm">By inquiry only</span>
      </label>
      <label className="flex items-center gap-2 mt-2">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="rounded" />
        <span className="text-sm">Published</span>
      </label>
      <div className="mt-4 flex items-center gap-4">
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        {error && <Text variant="body" className="text-red-600">{error}</Text>}
      </div>
    </form>
  );
}
