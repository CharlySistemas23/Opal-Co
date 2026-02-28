"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Container, Heading } from "@/components/ui";

interface CollectionProduct {
  id: string;
  handle: string;
  title: string;
  image?: { url: string; altText: string | null };
}

interface CollectionGridProps {
  title?: string;
  products: CollectionProduct[];
  columns?: 2 | 3;
}

export function CollectionGrid({
  title,
  products,
  columns = 3,
}: CollectionGridProps) {
  return (
    <Container>
      {title && (
        <Heading as="h1" level={2} className="mb-20 text-charcoal">
          {title}
        </Heading>
      )}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 ${
          columns === 3 ? "lg:grid-cols-3" : ""
        } gap-8 md:gap-12`}
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.handle}`}
            className="group block bg-ivory"
          >
            <motion.div
              className="relative aspect-[4/5] overflow-hidden min-h-0"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <Image
                src={
                  product.image?.url ||
                  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80"
                }
                alt={product.image?.altText || product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
        ))}
      </div>
    </Container>
  );
}
