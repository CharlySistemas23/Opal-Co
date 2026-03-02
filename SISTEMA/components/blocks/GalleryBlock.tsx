"use client";

import Image from "next/image";
import { RevealOnScroll } from "@/components/ui";
import { Container } from "@/components/ui";
import type { GalleryBlockData } from "@/lib/blocks/types";

interface GalleryBlockProps {
  data: Record<string, unknown>;
}

export function GalleryBlock({ data }: GalleryBlockProps) {
  const galleryData = (data ?? {}) as unknown as GalleryBlockData;
  const images = galleryData.images ?? [];
  if (images.length === 0) return null;

  return (
    <section className="py-30 md:py-40 bg-ivory">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {images.map((img, idx) => {
            const url = (img as { url?: string; mediaAssetId?: string }).url;
            if (!url) return null;
            return (
              <RevealOnScroll key={idx} delay={idx * 0.05}>
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={url}
                    alt={(img as { alt?: string }).alt ?? ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
