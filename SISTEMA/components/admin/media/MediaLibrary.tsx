"use client";

import { useState, useEffect, useCallback } from "react";
import { Heading, Text } from "@/components/ui";
import { CloudinaryUploader } from "./CloudinaryUploader";
import { MediaGrid, type MediaAssetItem } from "./MediaGrid";
export function MediaLibrary() {
  const [assets, setAssets] = useState<MediaAssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState("");
  const [q, setQ] = useState("");
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (folder) params.set("folder", folder);
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/admin/media?${params}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok && Array.isArray(data.assets)) {
        setAssets(data.assets);
      } else {
        setAssets([]);
      }
    } catch {
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [folder, q]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleCopyUrl = useCallback((asset: MediaAssetItem) => {
    navigator.clipboard.writeText(asset.url);
  }, []);

  const handleDelete = useCallback(
    async (asset: MediaAssetItem) => {
      if (!confirm("Delete this asset?")) return;
      const res = await fetch(`/api/admin/media/${asset.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchAssets();
    },
    [fetchAssets]
  );

  return (
    <div className="space-y-6">
      <Heading as="h1" level={2} className="text-charcoal">
        Media Library
      </Heading>

      <CloudinaryUploader folder="opal" onUploaded={fetchAssets} />

      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          placeholder="Filter by folder"
          className="px-3 py-2 border border-charcoal/20 rounded text-sm w-40"
        />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by publicId or alt"
          className="px-3 py-2 border border-charcoal/20 rounded text-sm w-48"
        />
      </div>

      {loading ? (
        <Text variant="body" muted>
          Loading…
        </Text>
      ) : (
        <MediaGrid
          assets={assets}
          onCopyUrl={handleCopyUrl}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
