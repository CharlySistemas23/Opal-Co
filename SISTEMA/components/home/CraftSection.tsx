"use client";

import Image from "next/image";
import { RevealOnScroll, Heading, Text } from "@/components/ui";
import { Container } from "@/components/ui";

export function CraftSection() {
  return (
    <section className="py-30 md:py-40 bg-ivory">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <RevealOnScroll>
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80"
                alt="Craft detail"
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
                Material Depth
              </Heading>
              <Text variant="large" className="text-charcoal/90 mb-8">
                Every piece begins with the material. Gold that carries warmth. Stones that hold
                light. Metal shaped by hand.
              </Text>
              <Text variant="body" muted>
                We source only what meets our standards. No compromise. No shortcut.
              </Text>
            </div>
          </RevealOnScroll>
        </div>
      </Container>
    </section>
  );
}
