"use client";

import Image from "next/image";
import { RevealOnScroll, Heading, Text } from "@/components/ui";
import { Container } from "@/components/ui";
import type { CraftBlockData } from "@/lib/blocks/types";

interface CraftBlockProps {
  data: CraftBlockData;
}

export function CraftBlock({ data }: CraftBlockProps) {
  const imageUrl =
    data.imageUrl || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80";

  return (
    <section className="py-30 md:py-40 bg-ivory">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <RevealOnScroll>
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={imageUrl}
                alt={data.heading || "Craft"}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized
              />
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div>
              <Heading as="h2" level={2} className="text-charcoal mb-8">
                {data.heading || "Material Depth"}
              </Heading>
              <Text variant="large" className="text-charcoal/90 mb-8">
                {data.body || ""}
              </Text>
            </div>
          </RevealOnScroll>
        </div>
      </Container>
    </section>
  );
}
