"use client";

import Image from "next/image";
import Link from "next/link";
import { RevealOnScroll, Heading, Text } from "@/components/ui";
import { Container } from "@/components/ui";

const narratives = [
  {
    title: "For Herself",
    copy: "For the woman who chooses her own radiance. Pieces that mark milestones she defines.",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80",
    href: "/collections/for-herself",
  },
  {
    title: "For Her",
    copy: "For the discerning gift. When only exceptional will do.",
    image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80",
    href: "/collections/for-her",
  },
];

export function DualNarrativeSection() {
  return (
    <section className="py-30 md:py-40 bg-stone">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {narratives.map((item, index) => (
            <RevealOnScroll key={item.title} delay={index * 0.1}>
              <Link href={item.href} className="group block bg-stone">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-base ease-luxury group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                  />
                </div>
                <div className="py-16 px-8 md:px-12">
                  <Heading as="h3" level={3} className="mb-6 text-charcoal">
                    {item.title}
                  </Heading>
                  <Text variant="body" muted className="max-w-md">
                    {item.copy}
                  </Text>
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </Container>
    </section>
  );
}
