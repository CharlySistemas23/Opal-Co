"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Container, Heading, Text } from "@/components/ui";

interface HighJewelryPiece {
  id: string;
  handle: string;
  title: string;
  material?: string;
  image: string;
}

const placeholderPieces: HighJewelryPiece[] = [
  { id: "1", handle: "radiance-ring", title: "Radiance Ring", material: "18K Gold, Diamonds", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80" },
  { id: "2", handle: "luminance-necklace", title: "Luminance Necklace", material: "Platinum, Sapphires", image: "https://images.unsplash.com/photo-1617038443407-8a8f3981ff63?w=1200&q=80" },
];

interface HighJewelrySectionProps {
  pieces?: HighJewelryPiece[];
}

export function HighJewelrySection({ pieces = placeholderPieces }: HighJewelrySectionProps) {
  const displayPieces = pieces.slice(0, 2);
  return (
    <section className="py-30 md:py-40 bg-charcoal text-ivory">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="mb-20"
        >
          <Heading as="h2" level={2} className="text-ivory">
            High Jewelry
          </Heading>
          <Text variant="body" className="mt-6 text-ivory/80 max-w-xl">
            One-of-a-kind creations. Master craftsmanship. Timeless design.
          </Text>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          {displayPieces.map((piece, index) => (
            <motion.div
              key={piece.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                duration: 0.7,
                delay: 0.15 + index * 0.1,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <Link href={`/products/${piece.handle}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden mb-8 min-h-0 bg-charcoal/50">
                  <img
                    src={piece.image}
                    alt={piece.title}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-base ease-luxury group-hover:scale-[1.02]"
                  />
                </div>
                <Heading as="h3" level={4} className="text-ivory">
                  {piece.title}
                </Heading>
                <Text variant="small" className="text-ivory/60 mt-2">
                  {piece.material}
                </Text>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link
            href="/high-jewelry"
            className="inline-flex items-center justify-center px-8 py-4 font-sans text-sm uppercase tracking-[0.2em] border border-ivory/40 text-ivory hover:border-ivory hover:bg-ivory/10 transition-all duration-fast"
          >
            View All
          </Link>
        </div>
      </Container>
    </section>
  );
}
