"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Text } from "@/components/ui";

export function NewProductForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass = "w-full max-w-md px-3 py-2 border border-charcoal/20 rounded text-charcoal bg-ivory font-sans text-sm";
  const labelClass = "block text-xs uppercase tracking-wider text-charcoal/70 mt-3 mb-1";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), handle: handle.trim() || undefined }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Failed to create");
        return;
      }
      router.push(`/admin/products/${data.id}`);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className={labelClass}>Title</label>
      <input
        type="text"
        className={inputClass}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        placeholder="Product title"
      />
      <label className={labelClass}>Handle (optional, auto-generated from title)</label>
      <input
        type="text"
        className={inputClass}
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
        placeholder="product-handle"
      />
      <div className="mt-6 flex items-center gap-4">
        <Button type="submit" disabled={saving}>
          {saving ? "Creating…" : "Create product"}
        </Button>
        {error && <Text variant="body" className="text-red-600">{error}</Text>}
      </div>
    </form>
  );
}
