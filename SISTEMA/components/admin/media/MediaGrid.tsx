"use client";

import { Text } from "@/components/ui";

export interface MediaAssetItem {
  id: string;
  publicId: string;
  url: string;
  folder: string | null;
  tags: string[];
  alt: string | null;
  createdAt: string;
}

interface MediaGridProps {
  assets: MediaAssetItem[];
  selectMode?: boolean;
  onSelect?: (asset: MediaAssetItem) => void;
  onCopyUrl?: (asset: MediaAssetItem) => void;
  onDelete?: (asset: MediaAssetItem) => void;
}

export function MediaGrid({
  assets,
  selectMode = false,
  onSelect,
  onCopyUrl,
  onDelete,
}: MediaGridProps) {
  if (assets.length === 0) {
    return (
      <Text variant="body" muted>
        No assets found.
      </Text>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="group border border-charcoal/10 rounded-lg overflow-hidden bg-ivory"
        >
          <div className="aspect-square relative bg-charcoal/5">
            <img
              src={asset.url}
              alt={asset.alt ?? asset.publicId}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-2">
            <p className="text-xs text-charcoal/80 truncate" title={asset.publicId}>
              {asset.publicId}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectMode && onSelect && (
                <button
                  type="button"
                  onClick={() => onSelect(asset)}
                  className="text-xs px-2 py-1 border border-charcoal/20 rounded hover:bg-charcoal/5"
                >
                  Select
                </button>
              )}
              {onCopyUrl && (
                <button
                  type="button"
                  onClick={() => onCopyUrl(asset)}
                  className="text-xs px-2 py-1 border border-charcoal/20 rounded hover:bg-charcoal/5"
                >
                  Copy URL
                </button>
              )}
              {onDelete && !selectMode && (
                <button
                  type="button"
                  onClick={() => onDelete(asset)}
                  className="text-xs px-2 py-1 text-red-600 hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
