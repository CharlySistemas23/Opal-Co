"use client";

import { useState } from "react";
import { Text } from "@/components/ui";

interface FilterOption {
  value: string;
  label: string;
}

interface CollectionFilterProps {
  options?: FilterOption[];
  onFilter?: (value: string) => void;
  selected?: string;
}

export function CollectionFilter({ options = [], onFilter, selected: controlledSelected }: CollectionFilterProps) {
  const [internalSelected, setInternalSelected] = useState<string>("all");
  const selected = controlledSelected ?? internalSelected;

  const handleChange = (value: string) => {
    setInternalSelected(value);
    onFilter?.(value);
  };

  if (options.length === 0) return null;

  return (
    <div className="flex items-center gap-8">
      <Text variant="small" muted className="uppercase tracking-[0.2em]">
        Filter
      </Text>
      <div className="flex gap-6">
        <button
          type="button"
          onClick={() => handleChange("all")}
          className={`font-sans text-sm uppercase tracking-[0.2em] transition-colors ${
            selected === "all" ? "text-charcoal" : "text-charcoal/50 hover:text-charcoal"
          }`}
        >
          All
        </button>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleChange(opt.value)}
            className={`font-sans text-sm uppercase tracking-[0.2em] transition-colors ${
              selected === opt.value ? "text-charcoal" : "text-charcoal/50 hover:text-charcoal"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
