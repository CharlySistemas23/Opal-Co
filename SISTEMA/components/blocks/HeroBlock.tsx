"use client";

import Image from "next/image";
import Link from "next/link";
import { ParallaxContainer, Heading, Button } from "@/components/ui";
import type { HeroBlockData } from "@/lib/blocks/types";

interface HeroBlockProps {
  data: HeroBlockData;
}

export function HeroBlock({ data }: HeroBlockProps) {
  const imageUrl =
    data.backgroundImageUrl || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=80";

  return (
    <ParallaxContainer ratio={0.9}>
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-stone">
        <div className="absolute inset-0 z-0">
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-charcoal/30" />
        </div>

        <div className="relative z-10 text-center">
          <Heading
            as="h1"
            level={1}
            className="text-ivory tracking-[0.15em] uppercase font-medium"
          >
            {data.headline || "Welcome"}
          </Heading>
          {data.subheadline && (
            <p className="mt-6 text-ivory/90 font-sans text-lg max-w-xl mx-auto">
              {data.subheadline}
            </p>
          )}
          {data.ctaLabel && data.ctaHref && (
            <Link href={data.ctaHref} className="mt-10 inline-block">
              <Button variant="primary">{data.ctaLabel}</Button>
            </Link>
          )}
        </div>
      </section>
    </ParallaxContainer>
  );
}
