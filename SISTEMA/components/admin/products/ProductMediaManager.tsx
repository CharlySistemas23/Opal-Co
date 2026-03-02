"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Text } from "@/components/ui";
import { MediaSelectModal } from "@/components/admin/media/MediaSelectModal";
import type { MediaAssetItem } from "@/components/admin/media/MediaGrid";

interface ProductImage {
  id: string;
  mediaAssetId: string;
  url: string;
  alt?: string | null;
  order: number;
}

interface ProductMediaManagerProps {
  productId: string;
  images: ProductImage[];
  onSaved?: () => void;
}

function SortableImage({
  image,
  onRemove,
}: {
  image: ProductImage;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: image.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 border border-charcoal/10 rounded p-2">
      <button type="button" className="cursor-grab p-1" {...attributes} {...listeners} aria-label="Drag">
        <span className="text-charcoal/60">⋮⋮</span>
      </button>
      <div className="w-16 h-16 bg-charcoal/5 rounded overflow-hidden flex-shrink-0">
        <img src={image.url} alt={image.alt ?? ""} className="w-full h-full object-cover" />
      </div>
      <span className="text-sm truncate flex-1">{image.url.slice(0, 50)}…</span>
      <button type="button" onClick={onRemove} className="text-red-600 text-sm hover:underline">
        Remove
      </button>
    </div>
  );
}

export function ProductMediaManager({ productId, images: initialImages, onSaved }: ProductMediaManagerProps) {
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setImages((prev) => {
      const ids = prev.map((i) => i.id);
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex).map((img, i) => ({ ...img, order: i }));
    });
  }, []);

  const handleSelect = useCallback((asset: MediaAssetItem) => {
    setImages((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, mediaAssetId: asset.id, url: asset.url, alt: asset.alt, order: prev.length },
    ]);
    setModalOpen(false);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: images.map((img, i) => ({ mediaAssetId: img.mediaAssetId, order: i })),
        }),
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
    <div className="space-y-4">
      <Text variant="body" className="font-medium">Product images</Text>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={images.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {images.map((img) => (
              <SortableImage key={img.id} image={img} onRemove={() => handleRemove(img.id)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="text-sm px-4 py-2 border border-charcoal/20 rounded hover:bg-charcoal/5"
        >
          + Add from media library
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="text-sm px-4 py-2 bg-charcoal text-ivory rounded hover:bg-charcoal/90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save images"}
        </button>
      </div>
      {error && <Text variant="body" className="text-red-600">{error}</Text>}
      <MediaSelectModal open={modalOpen} onClose={() => setModalOpen(false)} onSelect={handleSelect} />
    </div>
  );
}
