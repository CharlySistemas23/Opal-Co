"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Text } from "@/components/ui";

export function NewCollectionForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass = "w-full max-w-md px-3 py-2 border border-charcoal/20 rounded text-charcoal bg-ivory font-sans text-sm";
  const labelClass = "block text-xs uppercase tracking-wider text-charcoal/70 mt-3 mb-1";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug.trim() || undefined,
          title: title.trim(),
          description: description.trim() || null,
          published,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Failed to create");
        return;
      }
      router.push(`/admin/collections/${data.id}`);
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
        placeholder="Collection title"
      />
      <label className={labelClass}>Slug (optional, auto-generated from title)</label>
      <input
        type="text"
        className={inputClass}
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="collection-slug"
      />
      <label className={labelClass}>Description</label>
      <textarea
        className={inputClass}
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Optional"
      />
      <label className="flex items-center gap-2 mt-4">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="rounded"
        />
        <span className="text-sm">Published</span>
      </label>
      <div className="mt-6 flex items-center gap-4">
        <Button type="submit" disabled={saving}>
          {saving ? "Creating…" : "Create collection"}
        </Button>
        {error && <Text variant="body" className="text-red-600">{error}</Text>}
      </div>
    </form>
  );
}
