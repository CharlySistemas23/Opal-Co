"use client";

import { useState } from "react";
import Link from "next/link";
import { Heading, Text, Button } from "@/components/ui";
import { formatPrice } from "@/utils/formatPrice";
import { useCart } from "@/hooks/useCart";

interface ProductInfoProps {
  title: string;
  material?: string;
  price: string;
  currencyCode: string;
  description?: string;
  careText?: string | null;
  detailsText?: string | null;
  variantId?: string;
  /** When true, show "By inquiry" and link to appointments instead of Add to Bag */
  byInquiry?: boolean;
}

const DEFAULT_DETAILS = "Handcrafted with precision. Each piece is unique.";
const DEFAULT_CARE = "Store in a soft pouch. Avoid contact with chemicals.";

export function ProductInfo({
  title,
  material,
  price,
  currencyCode,
  description,
  careText,
  detailsText,
  variantId,
  byInquiry = false,
}: ProductInfoProps) {
  const collapsibleSections = [
    { id: "details", title: "Details", content: detailsText?.trim() || DEFAULT_DETAILS },
    { id: "care", title: "Care", content: careText?.trim() || DEFAULT_CARE },
  ];
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { addItem, isCartAvailable } = useCart();

  const handleAddToBag = async () => {
    if (!isCartAvailable || byInquiry) return;
    await addItem({
      variantId: variantId ?? "",
      title,
      quantity: 1,
      price,
      image: undefined,
    });
  };

  return (
    <div className="flex flex-col">
      <Heading as="h1" level={2} className="text-charcoal mb-4">
        {title}
      </Heading>

      {material && (
        <Text variant="small" muted className="mb-4">
          {material}
        </Text>
      )}

      <Text variant="large" className="mb-8">
        {byInquiry ? "By inquiry" : formatPrice(price, currencyCode)}
      </Text>

      {description && (
        <Text variant="body" muted className="mb-8">
          {description}
        </Text>
      )}

      {byInquiry ? (
        <Link href="/appointments" className="inline-block mb-16">
          <Button variant="primary" className="w-full md:w-auto">
            Inquire
          </Button>
        </Link>
      ) : (
        <Button
          variant="primary"
          className="w-full md:w-auto mb-16"
          onClick={handleAddToBag}
          disabled={!isCartAvailable}
        >
          {isCartAvailable ? "Add to Bag" : "Contact us to purchase"}
        </Button>
      )}

      {/* Mobile sticky CTA - visible only on small screens */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-ivory/95 backdrop-blur-sm border-t border-charcoal/10 py-4 px-4"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center justify-between gap-4 max-w-xl mx-auto">
          <span className="font-sans text-sm text-charcoal">
            {byInquiry ? "By inquiry" : formatPrice(price, currencyCode)}
          </span>
          {byInquiry ? (
            <Link href="/appointments" className="flex-1 max-w-[200px]">
              <Button variant="primary" className="w-full">
                Inquire
              </Button>
            </Link>
          ) : (
            <Button
              variant="primary"
              className="flex-1 max-w-[200px]"
              onClick={handleAddToBag}
              disabled={!isCartAvailable}
            >
              {isCartAvailable ? "Add to Bag" : "Contact us"}
            </Button>
          )}
        </div>
      </div>

      <div className="border-t border-charcoal/15" role="region" aria-label="Product details">
        {collapsibleSections.map((section) => {
          const isExpanded = expandedId === section.id;
          const contentId = `accordion-${section.id}`;
          return (
            <div key={section.id} className="border-b border-charcoal/10">
              <button
                type="button"
                onClick={() =>
                  setExpandedId(isExpanded ? null : section.id)
                }
                aria-expanded={isExpanded}
                aria-controls={contentId}
                id={`accordion-${section.id}-button`}
                className="w-full py-6 flex items-center justify-between font-sans text-sm uppercase tracking-[0.2em] text-charcoal hover:text-champagne transition-colors"
              >
                {section.title}
                <span className="text-lg" aria-hidden>{isExpanded ? "−" : "+"}</span>
              </button>
              <div
                id={contentId}
                role="region"
                aria-labelledby={`accordion-${section.id}-button`}
                hidden={!isExpanded}
                className={isExpanded ? "pb-6" : "hidden"}
              >
                <Text variant="small" muted>
                  {section.content}
                </Text>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
