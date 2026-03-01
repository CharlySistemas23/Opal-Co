"use client";

import { useState } from "react";
import { Heading, Button, Text } from "@/components/ui";
import { PageBlocksEditor, type EditorBlock } from "@/components/admin/pages/PageBlocksEditor";

interface PageEditorClientProps {
  page: {
    id: string;
    slug: string;
    title: string;
    seoTitle: string | null;
    seoDescription: string | null;
    published: boolean;
    blocks: Array<{
      id: string;
      type: string;
      order: number;
      visible: boolean;
      dataJson: unknown;
    }>;
  };
}

function mapBlocks(blocks: PageEditorClientProps["page"]["blocks"]): EditorBlock[] {
  return blocks
    .sort((a, b) => a.order - b.order)
    .map((b) => ({
      id: b.id,
      type: b.type as EditorBlock["type"],
      order: b.order,
      visible: b.visible,
      dataJson:
        b.dataJson && typeof b.dataJson === "object" && !Array.isArray(b.dataJson)
          ? (b.dataJson as Record<string, unknown>)
          : {},
    }));
}

export function PageEditorClient({ page }: PageEditorClientProps) {
  const [title, setTitle] = useState(page.title);
  const [seoTitle, setSeoTitle] = useState(page.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(page.seoDescription ?? "");
  const [published, setPublished] = useState(page.published);
  const [saving, setSaving] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);

  const saveMeta = async () => {
    setSaving(true);
    setMetaError(null);
    try {
      const res = await fetch(`/api/admin/pages/${page.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
          published,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setMetaError(data?.error ?? "Failed to save");
        return;
      }
    } catch {
      setMetaError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full max-w-md px-3 py-2 border border-charcoal/20 rounded text-charcoal bg-ivory font-sans text-sm";
  const labelClass = "block text-xs uppercase tracking-wider text-charcoal/70 mt-3 mb-1";

  return (
    <div className="space-y-10">
      <Heading as="h1" level={2} className="text-charcoal">
        Edit: {page.slug}
      </Heading>

      {/* Page meta form */}
      <div className="border border-charcoal/20 rounded-lg p-6 bg-ivory">
        <Heading as="h2" level={4} className="text-charcoal mb-4">
          Page settings
        </Heading>
        <label className={labelClass}>Title</label>
        <input
          type="text"
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label className={labelClass}>SEO Title</label>
        <input
          type="text"
          className={inputClass}
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
        />
        <label className={labelClass}>SEO Description</label>
        <textarea
          className={inputClass}
          rows={2}
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
        />
        <label className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-charcoal/80">Published</span>
        </label>
        <div className="mt-4 flex items-center gap-4">
          <Button type="button" variant="primary" onClick={saveMeta} disabled={saving}>
            {saving ? "Saving…" : "Save page"}
          </Button>
          {metaError && (
            <Text variant="body" className="text-red-600">
              {metaError}
            </Text>
          )}
        </div>
      </div>

      {/* Blocks editor */}
      <div className="border border-charcoal/20 rounded-lg p-6 bg-stone/30">
        <PageBlocksEditor slug={page.slug} initialBlocks={mapBlocks(page.blocks)} />
      </div>
    </div>
  );
}
