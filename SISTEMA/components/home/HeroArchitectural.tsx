"use client";

import Image from "next/image";
import { ParallaxContainer, Heading } from "@/components/ui";

export function HeroArchitectural() {
  return (
    <ParallaxContainer ratio={0.9}>
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-stone">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=80"
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
            OWN YOUR RADIANCE
          </Heading>
        </div>
      </section>
    </ParallaxContainer>
  );
}
