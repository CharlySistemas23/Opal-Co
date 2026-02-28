"use client";

import { useState, useMemo } from "react";
import { Container, Text } from "@/components/ui";
import { CollectionGrid } from "./CollectionGrid";
import { CollectionFilter } from "./CollectionFilter";

interface FilterOption {
  value: string;
  label: string;
}

interface CollectionProduct {
  id: string;
  handle: string;
  title: string;
  image?: { url: string; altText: string | null };
  productType?: string;
}

interface CollectionWithFilterProps {
  title: string;
  description?: string;
  products: CollectionProduct[];
  filterOptions: FilterOption[];
  columns?: 2 | 3;
}

function matchesFilter(product: CollectionProduct, filterValue: string): boolean {
  if (filterValue === "all") return true;
  const t = product.title.toLowerCase();
  const type = (product.productType ?? "").toLowerCase();
  const kw = filterValue.toLowerCase();
  const keywords: Record<string, string[]> = {
    rings: ["ring"],
    necklaces: ["necklace"],
    earrings: ["earring", "earrings"],
    bracelets: ["bracelet", "bracelets"],
  };
  const terms = keywords[kw] ?? [kw];
  const searchIn = `${t} ${type}`;
  return terms.some((term) => searchIn.includes(term));
}

export function CollectionWithFilter({
  title,
  description,
  products,
  filterOptions,
  columns = 3,
}: CollectionWithFilterProps) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(
    () => (filter === "all" ? products : products.filter((p) => matchesFilter(p, filter))),
    [products, filter],
  );

  return (
    <div className="min-h-screen py-20 md:py-30">
      <Container className="mb-12">
        {description && (
          <Text variant="body" muted className="mb-8 max-w-2xl">
            {description}
          </Text>
        )}
        <CollectionFilter options={filterOptions} onFilter={setFilter} selected={filter} />
      </Container>
      {filtered.length === 0 ? (
        <Container>
          <div className="py-20 text-center">
            <p className="font-sans text-charcoal/80 mb-6">No results for this filter.</p>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="font-sans text-sm uppercase tracking-[0.2em] text-charcoal hover:text-champagne transition-colors underline"
            >
              Reset filters
            </button>
          </div>
        </Container>
      ) : (
        <CollectionGrid title={title} products={filtered} columns={columns} />
      )}
    </div>
  );
}
