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
  filterLayout?: "horizontal" | "sidebar";
  columns?: 2 | 3;
}

function matchesFilter(product: CollectionProduct, filterValue: string): boolean {
  if (filterValue === "all") return true;
  const t = product.title.toLowerCase();
  const type = (product.productType ?? "").toLowerCase();
  const kw = filterValue.toLowerCase();
  const searchIn = `${t} ${type}`;
  const terms = kw.split(/[\s-_]+/).filter(Boolean);
  return terms.some((term) => searchIn.includes(term)) || searchIn.includes(kw);
}

export function CollectionWithFilter({
  title,
  description,
  products,
  filterOptions,
  filterLayout = "horizontal",
  columns = 3,
}: CollectionWithFilterProps) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(
    () => (filter === "all" ? products : products.filter((p) => matchesFilter(p, filter))),
    [products, filter],
  );

  const filterBlock = (
    <div className={filterLayout === "sidebar" ? "mb-0" : "mb-12"}>
      {description && filterLayout === "horizontal" && (
        <Text variant="body" muted className="mb-8 max-w-2xl">
          {description}
        </Text>
      )}
      <CollectionFilter options={filterOptions} onFilter={setFilter} selected={filter} layout={filterLayout} />
    </div>
  );

  if (filterLayout === "sidebar") {
    return (
      <div className="min-h-screen py-20 md:py-30">
        <Container>
          {description && (
            <Text variant="body" muted className="mb-8 max-w-2xl">
              {description}
            </Text>
          )}
          <div className="flex flex-col lg:flex-row gap-12">
            <aside className="lg:w-56 shrink-0">
              {filterBlock}
            </aside>
            <div className="flex-1 min-w-0">
              {filtered.length === 0 ? (
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
              ) : (
                <CollectionGrid title={title} products={filtered} columns={columns} />
              )}
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 md:py-30">
      <Container className="mb-12">
        {filterBlock}
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
