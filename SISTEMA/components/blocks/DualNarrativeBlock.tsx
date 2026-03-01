"use client";

import Image from "next/image";
import Link from "next/link";
import { RevealOnScroll, Heading, Text } from "@/components/ui";
import { Container } from "@/components/ui";
import type { DualNarrativeBlockData } from "@/lib/blocks/types";

interface DualNarrativeBlockProps {
  data: DualNarrativeBlockData;
}

export function DualNarrativeBlock({ data }: DualNarrativeBlockProps) {
  const leftImage = data.leftImageUrl || "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80";
  const rightImage = data.rightImageUrl || "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80";

  return (
    <section className="py-30 md:py-40 bg-stone">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <RevealOnScroll delay={0}>
            <Link href="/collections/for-herself" className="group block bg-stone">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={leftImage}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-base ease-luxury group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />
              </div>
              <div className="py-16 px-8 md:px-12">
                <Heading as="h3" level={3} className="mb-6 text-charcoal">
                  {data.leftTitle || "For Herself"}
                </Heading>
                <Text variant="body" muted className="max-w-md">
                  {data.leftText || ""}
                </Text>
              </div>
            </Link>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <Link href="/collections/for-her" className="group block bg-stone">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={rightImage}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-base ease-luxury group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />
              </div>
              <div className="py-16 px-8 md:px-12">
                <Heading as="h3" level={3} className="mb-6 text-charcoal">
                  {data.rightTitle || "For Her"}
                </Heading>
                <Text variant="body" muted className="max-w-md">
                  {data.rightText || ""}
                </Text>
              </div>
            </Link>
          </RevealOnScroll>
        </div>
      </Container>
    </section>
  );
}
