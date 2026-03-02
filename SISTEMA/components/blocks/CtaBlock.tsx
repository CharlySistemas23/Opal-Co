"use client";

import Link from "next/link";
import { RevealOnScroll, Heading, Button } from "@/components/ui";
import { Container } from "@/components/ui";
import type { CtaBlockData } from "@/lib/blocks/types";

interface CtaBlockProps {
  data: CtaBlockData;
}

export function CtaBlock({ data }: CtaBlockProps) {
  return (
    <section className="py-16 md:py-24 bg-stone">
      <Container>
        <RevealOnScroll>
          <div className="max-w-2xl mx-auto text-center">
            <Heading as="h2" level={3} className="text-charcoal mb-4">
              {data.title || ""}
            </Heading>
            {data.ctaText && data.ctaHref && (
              <Link href={data.ctaHref}>
                <Button variant="subtle">{data.ctaText}</Button>
              </Link>
            )}
          </div>
        </RevealOnScroll>
      </Container>
    </section>
  );
}
