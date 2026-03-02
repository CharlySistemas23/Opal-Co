"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Section, Heading, Button } from "@/components/ui";

const inputClass = "w-full max-w-md px-3 py-2 border border-charcoal/20 rounded text-charcoal bg-ivory font-sans text-sm";
const labelClass = "block text-xs uppercase tracking-wider text-charcoal/70 mt-3 mb-1";

function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function AdminPagesNewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!slug || slug === slugify(title)) setSlug(slugify(v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          slug: slug || undefined,
          seoTitle: seoTitle || undefined,
          seoDescription: seoDescription || undefined,
          published,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Failed to create page");
        return;
      }
      const pageSlug = data?.data?.slug ?? slugify(title);
      router.push(`/admin/pages/${pageSlug}`);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section background="stone" spacing="default">
      <Container>
        <Heading as="h1" level={2} className="text-charcoal mb-8">
          Create page
        </Heading>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          {error && (
            <p className="font-sans text-sm text-red-600">{error}</p>
          )}
          <div>
            <label className={labelClass}>Title</label>
            <input
              type="text"
              className={inputClass}
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Page title"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input
              type="text"
              className={inputClass}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="page-slug"
            />
          </div>
          <div>
            <label className={labelClass}>SEO Title</label>
            <input
              type="text"
              className={inputClass}
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div>
            <label className={labelClass}>SEO Description</label>
            <textarea
              className={inputClass}
              rows={2}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <label className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Published</span>
          </label>
          <div className="mt-6 flex gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create page"}
            </Button>
          </div>
        </form>
      </Container>
    </Section>
  );
}
