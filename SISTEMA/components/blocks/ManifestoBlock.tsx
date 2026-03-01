"use client";

import { RevealOnScroll, Heading, Text } from "@/components/ui";
import { Container } from "@/components/ui";
import type { ManifestoBlockData } from "@/lib/blocks/types";

interface ManifestoBlockProps {
  data: ManifestoBlockData;
}

export function ManifestoBlock({ data }: ManifestoBlockProps) {
  const headline = data.headline || "The Manifesto";
  const body = data.body || "";

  if (!body) return null;

  return (
    <section className="py-30 md:py-40">
      <Container>
        <RevealOnScroll>
          <div className="max-w-[900px] mx-auto text-center">
            <Heading as="h2" level={2} className="mb-12 text-charcoal">
              {headline}
            </Heading>
            <Text variant="large" className="font-serif text-2xl md:text-3xl text-charcoal/90">
              {body}
            </Text>
          </div>
        </RevealOnScroll>
      </Container>
    </section>
  );
}
