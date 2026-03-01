"use client";

import { RevealOnScroll } from "@/components/ui";
import { Container } from "@/components/ui";
import type { RichTextBlockData } from "@/lib/blocks/types";

interface RichTextBlockProps {
  data: RichTextBlockData;
}

export function RichTextBlock({ data }: RichTextBlockProps) {
  const content = data.content;
  if (!content || typeof content !== "string") return null;

  return (
    <section className="py-20 md:py-30 bg-ivory">
      <Container>
        <RevealOnScroll>
          <div
            className="prose prose-lg max-w-none text-charcoal prose-headings:text-charcoal prose-p:text-charcoal/90"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </RevealOnScroll>
      </Container>
    </section>
  );
}
