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
  layout?: "horizontal" | "sidebar";
}

export function CollectionFilter({ options = [], onFilter, selected: controlledSelected, layout = "horizontal" }: CollectionFilterProps) {
  const [internalSelected, setInternalSelected] = useState<string>("all");
  const selected = controlledSelected ?? internalSelected;

  const handleChange = (value: string) => {
    setInternalSelected(value);
    onFilter?.(value);
  };

  if (options.length === 0) return null;

  const buttonClass = (isSelected: boolean) =>
    `font-sans text-sm uppercase tracking-[0.2em] transition-colors block w-full text-left ${
      isSelected ? "text-charcoal" : "text-charcoal/50 hover:text-charcoal"
    }`;

  if (layout === "sidebar") {
    return (
      <div className="flex flex-col gap-4">
        <Text variant="small" muted className="uppercase tracking-[0.2em]">
          Filter
        </Text>
        <nav className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => handleChange("all")}
            className={buttonClass(selected === "all")}
          >
            All
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleChange(opt.value)}
              className={buttonClass(selected === opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </nav>
      </div>
    );
  }

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
