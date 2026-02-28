"use client";

import { useState, useEffect, useCallback } from "react";
import { Text } from "@/components/ui";
import { MediaGrid, type MediaAssetItem } from "./MediaGrid";

interface MediaSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAssetItem) => void;
}

export function MediaSelectModal({ open, onClose, onSelect }: MediaSelectModalProps) {
  const [assets, setAssets] = useState<MediaAssetItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media", { credentials: "include" });
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
  }, []);

  useEffect(() => {
    if (open) fetchAssets();
  }, [open, fetchAssets]);

  const handleSelect = (asset: MediaAssetItem) => {
    onSelect(asset);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50"
      onClick={onClose}
    >
      <div
        className="bg-ivory rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-charcoal/10 flex justify-between items-center">
          <Text variant="body" className="font-medium">
            Select media
          </Text>
          <button
            type="button"
            onClick={onClose}
            className="text-charcoal/70 hover:text-charcoal text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-4">
          {loading ? (
            <Text variant="body" muted>
              Loading…
            </Text>
          ) : (
            <MediaGrid
              assets={assets}
              selectMode
              onSelect={handleSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
}
