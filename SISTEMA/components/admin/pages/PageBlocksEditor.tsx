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
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Heading, Text } from "@/components/ui";
import { BlockFormFactory } from "./BlockFormFactory";
import { BLOCK_DATA_DEFAULTS, PAGE_BLOCK_TYPES, type PageBlockType } from "@/lib/blocks/types";

export interface EditorBlock {
  id: string;
  type: PageBlockType;
  order: number;
  visible: boolean;
  dataJson: Record<string, unknown> | null;
}

interface PageBlocksEditorProps {
  slug: string;
  initialBlocks: EditorBlock[];
}

function SortableBlockItem({
  block,
  onUpdate,
  onDelete,
}: {
  block: EditorBlock;
  onUpdate: (id: string, updates: Partial<EditorBlock>) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-charcoal/20 rounded-lg p-4 bg-ivory mb-4 ${
        isDragging ? "opacity-50 shadow-lg" : ""
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing p-1 text-charcoal/60 hover:text-charcoal"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </button>
        <span className="font-sans text-sm font-medium uppercase tracking-wider text-charcoal/80">
          {block.type.replace(/_/g, " ")}
        </span>
        <label className="flex items-center gap-2 ml-auto">
          <input
            type="checkbox"
            checked={block.visible}
            onChange={(e) => onUpdate(block.id, { visible: e.target.checked })}
            className="rounded"
          />
          <span className="text-xs text-charcoal/70">Visible</span>
        </label>
        <button
          type="button"
          onClick={() => onDelete(block.id)}
          className="text-red-600 hover:underline text-sm ml-2"
        >
          Delete
        </button>
      </div>
      <BlockFormFactory
        type={block.type}
        data={block.dataJson}
        onChange={(data) => onUpdate(block.id, { dataJson: data })}
      />
    </div>
  );
}

export function PageBlocksEditor({ slug, initialBlocks }: PageBlocksEditorProps) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(initialBlocks);
  const [saving, setSaving] = useState(false);
  const [showAddSelector, setShowAddSelector] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setBlocks((prev) => {
      const ids = prev.map((b) => b.id);
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered.map((b, i) => ({ ...b, order: i }));
    });
  }, []);

  const updateBlock = useCallback((id: string, updates: Partial<EditorBlock>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setBlocks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      return next.map((b, i) => ({ ...b, order: i }));
    });
  }, []);

  const addBlock = useCallback((type: PageBlockType) => {
    const defaults = BLOCK_DATA_DEFAULTS[type] as Record<string, unknown>;
    const newBlock: EditorBlock = {
      id: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      order: blocks.length,
      visible: true,
      dataJson: defaults ? { ...defaults } : {},
    };
    setBlocks((prev) => [...prev, newBlock]);
    setShowAddSelector(false);
  }, [blocks.length]);

  const saveBlocks = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        blocks: blocks.map((b, i) => ({
          type: b.type,
          order: i,
          visible: b.visible,
          dataJson: b.dataJson ?? {},
        })),
      };
      const res = await fetch(`/api/admin/pages/${slug}/blocks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Failed to save");
        return;
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }, [blocks, slug]);

  const blockIds = blocks.map((b) => b.id);

  return (
    <div>
      <Heading as="h2" level={4} className="text-charcoal mb-4">
        Page blocks
      </Heading>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blockIds}
          strategy={verticalListSortingStrategy}
        >
          {blocks.map((block) => (
            <SortableBlockItem
              key={block.id}
              block={block}
              onUpdate={updateBlock}
              onDelete={deleteBlock}
            />
          ))}
        </SortableContext>
      </DndContext>

      {!showAddSelector ? (
        <div className="flex gap-2 mt-4">
          <Button
            type="button"
            variant="subtle"
            onClick={() => setShowAddSelector(true)}
          >
            + Add block
          </Button>
        </div>
      ) : (
        <div className="mt-4 p-4 border border-charcoal/20 rounded-lg bg-ivory/50">
          <Text variant="body" className="mb-3">
            Select block type:
          </Text>
          <div className="flex flex-wrap gap-2">
            {PAGE_BLOCK_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => addBlock(t)}
                className="px-3 py-1.5 text-sm border border-charcoal/30 rounded hover:bg-charcoal/5 uppercase tracking-wider"
              >
                {t.replace(/_/g, " ")}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowAddSelector(false)}
              className="px-3 py-1.5 text-sm text-charcoal/60 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <Button
          type="button"
          variant="primary"
          onClick={saveBlocks}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save blocks"}
        </Button>
        {error && (
          <Text variant="body" className="text-red-600">
            {error}
          </Text>
        )}
      </div>
    </div>
  );
}
