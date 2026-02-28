"use client";

import Link from "next/link";
import { Container, Heading, Text } from "@/components/ui";

interface HighJewelryPiece {
  id: string;
  handle: string;
  title: string;
  material?: string;
  image: string;
}

interface HighJewelryGridProps {
  pieces: HighJewelryPiece[];
}

export function HighJewelryGrid({ pieces }: HighJewelryGridProps) {
  return (
    <section className="py-30 md:py-40 bg-charcoal text-ivory">
      <Container>
        <div className="mb-20">
          <Heading as="h1" level={2} className="text-ivory">
            High Jewelry
          </Heading>
          <Text variant="body" className="mt-6 text-ivory/80 max-w-xl">
            One-of-a-kind creations. Master craftsmanship. Timeless design.
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          {pieces.map((piece) => (
            <div key={piece.id}>
              <Link href={`/products/${piece.handle}`} className="group block">
                <div className="relative w-full aspect-[4/5] overflow-hidden mb-8 bg-charcoal/30">
                  <img
                    src={piece.image}
                    alt={piece.title}
                    width={600}
                    height={750}
                    className="w-full h-full object-cover object-center transition-transform duration-base ease-luxury group-hover:scale-[1.02]"
                  />
                </div>
                <Heading as="h2" level={4} className="text-ivory">
                  {piece.title}
                </Heading>
                {piece.material && (
                  <Text variant="small" className="text-ivory/60 mt-2">
                    {piece.material}
                  </Text>
                )}
                </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
