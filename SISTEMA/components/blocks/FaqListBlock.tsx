"use client";

import { Container, Heading, Text } from "@/components/ui";
import type { FaqListBlockData } from "@/lib/blocks/types";

interface FaqListBlockProps {
  data: FaqListBlockData;
}

export function FaqListBlock({ data }: FaqListBlockProps) {
  const items = data.items ?? [];
  if (items.length === 0) return null;

  return (
    <section className="py-20 md:py-30">
      <Container className="max-w-2xl">
        <ul className="space-y-8">
          {items.map((item, idx) => (
            <li key={idx}>
              <div className="group">
                <Heading as="h2" level={4} className="text-charcoal group-hover:text-champagne transition-colors">
                  {item.question}
                </Heading>
                <Text variant="small" muted className="mt-2 line-clamp-2">
                  {item.answer}
                </Text>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
