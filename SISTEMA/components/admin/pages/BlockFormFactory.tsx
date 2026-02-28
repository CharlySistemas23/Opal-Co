"use client";

import { useState } from "react";
import type { PageBlockType } from "@/lib/blocks/types";
import { MediaSelectModal } from "@/components/admin/media/MediaSelectModal";
import type { MediaAssetItem } from "@/components/admin/media/MediaGrid";

interface BlockFormFactoryProps {
  type: PageBlockType;
  data: Record<string, unknown> | null;
  onChange: (data: Record<string, unknown>) => void;
}

export function BlockFormFactory({ type, data, onChange }: BlockFormFactoryProps) {
  const d = data ?? {};
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaSelectTarget, setMediaSelectTarget] = useState<string | null>(null);

  const handleMediaSelect = (asset: MediaAssetItem) => {
    if (!mediaSelectTarget) return;
    const updates: Record<string, unknown> = { ...d };
    if (mediaSelectTarget === "hero-bg") {
      updates.backgroundMediaAssetId = asset.id;
      updates.backgroundImageUrl = asset.url;
    } else if (mediaSelectTarget === "dual-left") {
      updates.leftMediaAssetId = asset.id;
      updates.leftImageUrl = asset.url;
    } else if (mediaSelectTarget === "dual-right") {
      updates.rightMediaAssetId = asset.id;
      updates.rightImageUrl = asset.url;
    } else if (mediaSelectTarget === "craft") {
      updates.mediaAssetId = asset.id;
      updates.imageUrl = asset.url;
    } else if (mediaSelectTarget.startsWith("gallery-")) {
      const i = parseInt(mediaSelectTarget.replace("gallery-", ""), 10);
      const images = [...(Array.isArray(d.images) ? d.images : [])] as Array<Record<string, unknown>>;
      images[i] = { ...(images[i] ?? {}), mediaAssetId: asset.id, url: asset.url };
      updates.images = images;
    }
    onChange(updates);
    setMediaModalOpen(false);
    setMediaSelectTarget(null);
  };

  const MediaSelectButton = ({ target }: { target: string }) => (
    <button
      type="button"
      onClick={() => { setMediaSelectTarget(target); setMediaModalOpen(true); }}
      className="text-xs px-2 py-1 border border-charcoal/20 rounded hover:bg-charcoal/5 mt-1"
    >
      Select media
    </button>
  );
  const update = (key: string, value: unknown) => {
    onChange({ ...d, [key]: value });
  };
  const updateNested = (key: string, index: number, field: string, value: unknown) => {
    const arr = Array.isArray(d[key]) ? [...(d[key] as unknown[])] : [];
    const item = { ...(arr[index] as Record<string, unknown>), [field]: value };
    arr[index] = item;
    onChange({ ...d, [key]: arr });
  };
  const addItem = (key: string, defaultItem: Record<string, unknown>) => {
    const arr = Array.isArray(d[key]) ? [...(d[key] as unknown[])] : [];
    onChange({ ...d, [key]: [...arr, defaultItem] });
  };
  const removeItem = (key: string, index: number) => {
    const arr = Array.isArray(d[key]) ? [...(d[key] as unknown[])] : [];
    arr.splice(index, 1);
    onChange({ ...d, [key]: arr });
  };

  const inputClass =
    "w-full px-3 py-2 border border-charcoal/20 rounded text-charcoal bg-ivory font-sans text-sm";
  const labelClass = "block text-xs uppercase tracking-wider text-charcoal/70 mt-3 mb-1";

  switch (type) {
    case "HERO":
      return (
        <>
          <div className="space-y-2">
            <label className={labelClass}>Headline</label>
            <input
              type="text"
              className={inputClass}
              value={(d.headline as string) ?? ""}
              onChange={(e) => update("headline", e.target.value)}
              placeholder="Headline"
            />
            <label className={labelClass}>Subheadline</label>
            <input
              type="text"
              className={inputClass}
              value={(d.subheadline as string) ?? ""}
              onChange={(e) => update("subheadline", e.target.value)}
              placeholder="Subheadline"
            />
            <label className={labelClass}>CTA Label</label>
            <input
              type="text"
              className={inputClass}
              value={(d.ctaLabel as string) ?? ""}
              onChange={(e) => update("ctaLabel", e.target.value)}
              placeholder="CTA label"
            />
            <label className={labelClass}>CTA Href</label>
            <input
              type="text"
              className={inputClass}
              value={(d.ctaHref as string) ?? ""}
              onChange={(e) => update("ctaHref", e.target.value)}
              placeholder="/path"
            />
            <label className={labelClass}>Background Image</label>
            <div>
              <input
                type="text"
                className={inputClass}
                value={(d.backgroundImageUrl as string) ?? (d.imageUrl as string) ?? ""}
                onChange={(e) => update("backgroundImageUrl", e.target.value)}
                placeholder="URL or select media"
              />
              <MediaSelectButton target="hero-bg" />
            </div>
          </div>
          <MediaSelectModal
            open={mediaModalOpen && mediaSelectTarget === "hero-bg"}
            onClose={() => { setMediaModalOpen(false); setMediaSelectTarget(null); }}
            onSelect={handleMediaSelect}
          />
        </>
      );

    case "MANIFESTO":
      return (
        <div className="space-y-2">
          <label className={labelClass}>Headline</label>
          <input
            type="text"
            className={inputClass}
            value={(d.headline as string) ?? ""}
            onChange={(e) => update("headline", e.target.value)}
          />
          <label className={labelClass}>Body</label>
          <textarea
            className={inputClass}
            rows={4}
            value={(d.body as string) ?? ""}
            onChange={(e) => update("body", e.target.value)}
          />
        </div>
      );

    case "FEATURED_PRODUCTS":
    case "HIGH_JEWELRY": {
      const handles = (d.productHandles as string[]) ?? [];
      return (
        <div className="space-y-2">
          <label className={labelClass}>Product handles (comma-separated)</label>
          <input
            type="text"
            className={inputClass}
            value={handles.join(", ")}
            onChange={(e) =>
              update(
                "productHandles",
                e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
              )
            }
            placeholder="handle1, handle2"
          />
          <label className={labelClass}>Limit</label>
          <input
            type="number"
            className={inputClass}
            value={(d.limit as number) ?? 4}
            onChange={(e) => update("limit", parseInt(e.target.value, 10) || 4)}
            min={1}
            max={20}
          />
        </div>
      );
    }

    case "DUAL_NARRATIVE":
      return (
        <>
          <div className="space-y-4">
            <div className="border border-charcoal/10 rounded p-3">
              <label className={labelClass}>Left title</label>
              <input
                type="text"
                className={inputClass}
                value={(d.leftTitle as string) ?? ""}
                onChange={(e) => update("leftTitle", e.target.value)}
              />
              <label className={labelClass}>Left text</label>
              <textarea
                className={inputClass}
                rows={2}
                value={(d.leftText as string) ?? ""}
                onChange={(e) => update("leftText", e.target.value)}
              />
              <label className={labelClass}>Left image</label>
              <div>
                <input
                  type="text"
                  className={inputClass}
                  value={(d.leftImageUrl as string) ?? ""}
                  onChange={(e) => update("leftImageUrl", e.target.value)}
                  placeholder="URL or select media"
                />
                <MediaSelectButton target="dual-left" />
              </div>
            </div>
            <div className="border border-charcoal/10 rounded p-3">
              <label className={labelClass}>Right title</label>
              <input
                type="text"
                className={inputClass}
                value={(d.rightTitle as string) ?? ""}
                onChange={(e) => update("rightTitle", e.target.value)}
              />
              <label className={labelClass}>Right text</label>
              <textarea
                className={inputClass}
                rows={2}
                value={(d.rightText as string) ?? ""}
                onChange={(e) => update("rightText", e.target.value)}
              />
              <label className={labelClass}>Right image</label>
              <div>
                <input
                  type="text"
                  className={inputClass}
                  value={(d.rightImageUrl as string) ?? ""}
                  onChange={(e) => update("rightImageUrl", e.target.value)}
                  placeholder="URL or select media"
                />
                <MediaSelectButton target="dual-right" />
              </div>
            </div>
          </div>
          <MediaSelectModal
            open={mediaModalOpen && (mediaSelectTarget === "dual-left" || mediaSelectTarget === "dual-right")}
            onClose={() => { setMediaModalOpen(false); setMediaSelectTarget(null); }}
            onSelect={handleMediaSelect}
          />
        </>
      );

    case "CRAFT":
      return (
        <>
          <div className="space-y-2">
            <label className={labelClass}>Heading</label>
            <input
              type="text"
              className={inputClass}
              value={(d.heading as string) ?? ""}
              onChange={(e) => update("heading", e.target.value)}
            />
            <label className={labelClass}>Body</label>
            <textarea
              className={inputClass}
              rows={4}
              value={(d.body as string) ?? ""}
              onChange={(e) => update("body", e.target.value)}
            />
            <label className={labelClass}>Image</label>
            <div>
              <input
                type="text"
                className={inputClass}
                value={(d.imageUrl as string) ?? ""}
                onChange={(e) => update("imageUrl", e.target.value)}
                placeholder="URL or select media"
              />
              <MediaSelectButton target="craft" />
            </div>
          </div>
          <MediaSelectModal
            open={mediaModalOpen && mediaSelectTarget === "craft"}
            onClose={() => { setMediaModalOpen(false); setMediaSelectTarget(null); }}
            onSelect={handleMediaSelect}
          />
        </>
      );

    case "CTA":
      return (
        <div className="space-y-2">
          <label className={labelClass}>Title</label>
          <input
            type="text"
            className={inputClass}
            value={(d.title as string) ?? ""}
            onChange={(e) => update("title", e.target.value)}
          />
          <label className={labelClass}>CTA Text</label>
          <input
            type="text"
            className={inputClass}
            value={(d.ctaText as string) ?? ""}
            onChange={(e) => update("ctaText", e.target.value)}
          />
          <label className={labelClass}>CTA Href</label>
          <input
            type="text"
            className={inputClass}
            value={(d.ctaHref as string) ?? ""}
            onChange={(e) => update("ctaHref", e.target.value)}
            placeholder="/path"
          />
        </div>
      );

    case "RICH_TEXT":
      return (
        <div>
          <label className={labelClass}>Content (HTML)</label>
          <textarea
            className={inputClass}
            rows={6}
            value={(d.content as string) ?? ""}
            onChange={(e) => update("content", e.target.value)}
            placeholder="<p>...</p>"
          />
        </div>
      );

    case "GALLERY": {
      const images = (d.images as Array<{ url?: string; alt?: string; mediaAssetId?: string }>) ?? [];
      return (
        <>
          <div className="space-y-3">
            {images.map((img, i) => (
              <div key={i} className="flex flex-wrap gap-2 items-start border border-charcoal/10 rounded p-2">
                <input
                  type="text"
                  className={`${inputClass} flex-1 min-w-0`}
                  value={img?.url ?? ""}
                  onChange={(e) => updateNested("images", i, "url", e.target.value)}
                  placeholder="URL or select media"
                />
                <input
                  type="text"
                  className={`${inputClass} w-32`}
                  value={img?.alt ?? ""}
                  onChange={(e) => updateNested("images", i, "alt", e.target.value)}
                  placeholder="Alt"
                />
                <MediaSelectButton target={`gallery-${i}`} />
                <button
                  type="button"
                  onClick={() => removeItem("images", i)}
                  className="px-2 py-1 text-red-600 hover:underline text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addItem("images", { url: "", alt: "" })}
              className="text-sm text-charcoal/70 hover:text-charcoal underline"
            >
              + Add image
            </button>
          </div>
          <MediaSelectModal
            open={mediaModalOpen && mediaSelectTarget?.startsWith("gallery-") === true}
            onClose={() => { setMediaModalOpen(false); setMediaSelectTarget(null); }}
            onSelect={handleMediaSelect}
          />
        </>
      );
    }

    case "FAQ_LIST": {
      const items = (d.items as Array<{ question: string; answer: string }>) ?? [];
      return (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="border border-charcoal/10 rounded p-3">
              <label className={labelClass}>Question</label>
              <input
                type="text"
                className={inputClass}
                value={item?.question ?? ""}
                onChange={(e) => updateNested("items", i, "question", e.target.value)}
              />
              <label className={labelClass}>Answer</label>
              <textarea
                className={inputClass}
                rows={2}
                value={item?.answer ?? ""}
                onChange={(e) => updateNested("items", i, "answer", e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeItem("items", i)}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem("items", { question: "", answer: "" })}
            className="text-sm text-charcoal/70 hover:text-charcoal underline"
          >
            + Add FAQ
          </button>
        </div>
      );
    }

    default:
      return (
        <p className="text-charcoal/60 text-sm">No editor for block type &quot;{type}&quot;</p>
      );
  }
}
