"use client";

import { useState, useEffect } from "react";
import { Text } from "@/components/ui";

interface ProductPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

interface ProductItem {
  id: string;
  handle: string;
  title: string;
}

export function ProductPicker({ selectedIds, onChange }: ProductPickerProps) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/admin/products", { credentials: "include" });
        const data = await res.json();
        if (res.ok && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  if (loading) return <Text variant="body" muted>Loading…</Text>;
  if (products.length === 0) return <Text variant="body" muted>No products. Create products first.</Text>;

  return (
    <div className="flex flex-wrap gap-2">
      {products.map((p) => (
        <label key={p.id} className="flex items-center gap-2 px-3 py-2 border border-charcoal/20 rounded cursor-pointer hover:bg-charcoal/5">
          <input
            type="checkbox"
            checked={selectedIds.includes(p.id)}
            onChange={() => toggle(p.id)}
            className="rounded"
          />
          <span className="text-sm">{p.title} ({p.handle})</span>
        </label>
      ))}
    </div>
  );
}
