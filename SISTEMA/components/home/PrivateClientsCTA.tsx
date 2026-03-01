"use client";

import Link from "next/link";
import { RevealOnScroll, Heading, Text, Button } from "@/components/ui";
import { Container } from "@/components/ui";

export function PrivateClientsCTA() {
  return (
    <section className="py-16 md:py-24 bg-stone">
      <Container>
        <RevealOnScroll>
          <div className="max-w-2xl mx-auto text-center">
            <Heading as="h2" level={3} className="text-charcoal mb-4">
              Private Clients
            </Heading>
            <Text variant="body" muted className="mb-8">
              Bespoke commissions. Exclusive access. A relationship built on discretion and
              craftsmanship.
            </Text>
            <Link href="/private-clients">
              <Button variant="subtle">Inquire</Button>
            </Link>
          </div>
        </RevealOnScroll>
      </Container>
    </section>
  );
}
