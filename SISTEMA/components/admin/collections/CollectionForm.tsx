"use client";

import { useState } from "react";
import { Button, Text } from "@/components/ui";

interface CollectionFormProps {
  collection: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    published: boolean;
  };
  onSaved?: () => void;
}

export function CollectionForm({ collection, onSaved }: CollectionFormProps) {
  const [slug, setSlug] = useState(collection.slug);
  const [title, setTitle] = useState(collection.title);
  const [description, setDescription] = useState(collection.description ?? "");
  const [published, setPublished] = useState(collection.published);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass = "w-full max-w-md px-3 py-2 border border-charcoal/20 rounded text-charcoal bg-ivory font-sans text-sm";
  const labelClass = "block text-xs uppercase tracking-wider text-charcoal/70 mt-3 mb-1";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/collections/${collection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, title, description: description || null, published }),
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
      <label className={labelClass}>Slug</label>
      <input type="text" className={inputClass} value={slug} onChange={(e) => setSlug(e.target.value)} required />
      <label className={labelClass}>Title</label>
      <input type="text" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
      <label className={labelClass}>Description</label>
      <textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      <label className="flex items-center gap-2 mt-4">
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
