"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

interface ProductGalleryProps {
  images: Array<{ url: string; altText: string | null }>;
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const displayImages = images.length > 0 ? images : [{ url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80", altText: null }];

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const };

  return (
    <div className="relative aspect-square w-full overflow-hidden">
      <div
        className="relative w-full h-full overflow-hidden cursor-zoom-in"
        onMouseEnter={() => !reducedMotion && setZoom(true)}
        onMouseLeave={() => setZoom(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              scale: zoom ? 1.1 : 1,
            }}
            exit={{ opacity: 0 }}
            transition={transition}
            className="absolute inset-0"
          >
            <Image
              src={displayImages[activeIndex]?.url || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80"}
              alt={displayImages[activeIndex]?.altText || title}
              fill
              className="object-cover"
              sizes="70vw"
              priority
              unoptimized
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {displayImages.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
          {displayImages.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-1 w-8 transition-colors duration-fast ${
                index === activeIndex ? "bg-charcoal" : "bg-charcoal/30"
              }`}
              aria-label={`View image ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
