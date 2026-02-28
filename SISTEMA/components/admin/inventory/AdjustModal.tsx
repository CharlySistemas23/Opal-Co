"use client";

import { useState } from "react";
import { Text } from "@/components/ui";

interface AdjustModalProps {
  branch: { id: string; name: string };
  variant: { id: string; sku: string; product: { title: string } };
  onClose: () => void;
}

export function AdjustModal({ branch, variant, onClose }: AdjustModalProps) {
  const [type, setType] = useState<"IN" | "OUT" | "ADJUST">("ADJUST");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "w-full px-3 py-2 border border-charcoal/20 rounded text-charcoal bg-ivory text-sm";
  const labelClass =
    "block text-xs uppercase tracking-wider text-charcoal/70 mt-3 mb-1";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: branch.id,
          variantId: variant.id,
          type,
          quantity,
          note: note || null,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Failed");
        return;
      }
      onClose();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50"
      onClick={onClose}
    >
      <div
        className="bg-ivory rounded-lg shadow-xl max-w-md w-full m-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-medium text-charcoal mb-4">Adjust stock</h3>
        <p className="text-sm text-charcoal/70 mb-4">
          {variant.product.title} at {branch.name}
        </p>
        <form onSubmit={handleSubmit}>
          <label className={labelClass}>Type</label>
          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value as "IN" | "OUT" | "ADJUST")
            }
            className={inputClass}
          >
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
            <option value="ADJUST">ADJUST (set absolute)</option>
          </select>
          <label className={labelClass}>Quantity</label>
          <input
            type="number"
            min={1}
            className={inputClass}
            value={quantity}
            onChange={(e) =>
              setQuantity(parseInt(e.target.value, 10) || 1)
            }
          />
          <label className={labelClass}>Note</label>
          <input
            type="text"
            className={inputClass}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional"
          />
          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-charcoal text-ivory rounded hover:bg-charcoal/90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-charcoal/20 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
        {error && (
          <Text variant="body" className="text-red-600 mt-2">
            {error}
          </Text>
        )}
      </div>
    </div>
  );
}
