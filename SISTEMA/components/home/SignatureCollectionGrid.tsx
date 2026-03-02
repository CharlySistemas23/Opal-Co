"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Container, RevealOnScroll, Heading } from "@/components/ui";
const placeholderProducts = [
  { id: "1", handle: "radiance-ring", title: "Radiance Ring", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80" },
  { id: "2", handle: "luminance-necklace", title: "Luminance Necklace", image: "https://images.unsplash.com/photo-1617038443407-8a8f3981ff63?w=1200&q=80" },
  { id: "3", handle: "serenity-earrings", title: "Serenity Earrings", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&q=80" },
  { id: "4", handle: "essence-bracelet", title: "Essence Bracelet", image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1200&q=80" },
];

interface GridProduct {
  id: string;
  handle: string;
  title: string;
  images?: Array<{ url?: string }>;
}

function toGridProduct(p: GridProduct) {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    image: p.images?.[0]?.url ?? "",
  };
}

interface SignatureCollectionGridProps {
  products?: GridProduct[];
}

export function SignatureCollectionGrid({ products = [] }: SignatureCollectionGridProps) {
  const items = products.length > 0 ? products.map(toGridProduct) : placeholderProducts;
  return (
    <section className="py-30 md:py-40 bg-ivory">
      <Container>
        <RevealOnScroll>
          <Heading as="h2" level={2} className="mb-20 text-center text-charcoal">
            Signature Collection
          </Heading>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {items.map((product, index) => (
            <RevealOnScroll key={product.id} delay={index * 0.1}>
              <Link href={`/products/${product.handle}`} className="group block bg-ivory">
                <motion.div
                  className="relative aspect-[4/5] overflow-hidden"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                >
                  <Image
                    src={product.image || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80"}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/5 transition-colors duration-base" />
                </motion.div>
                <div className="py-8 px-6">
                  <span className="font-sans text-sm uppercase tracking-[0.2em] text-charcoal">
                    {product.title}
                  </span>
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </Container>
    </section>
  );
}
