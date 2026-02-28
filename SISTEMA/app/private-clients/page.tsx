import Image from "next/image";
import Link from "next/link";
import { Container, Section, Heading, Text, Button, RevealOnScroll } from "@/components/ui";

export const metadata = {
  title: "Private Clients",
  description: "Bespoke commissions. Private viewing. Concierge service. A relationship built on discretion.",
};

const services = [
  {
    title: "Bespoke Commissions",
    description: "One-of-a-kind pieces conceived for you. We work from concept to completion, guided by your vision. From initial sketches to the final creation, your piece is crafted exclusively in our atelier—with no limits on stone, metal, or design.",
  },
  {
    title: "Private Viewing",
    description: "By appointment only. An intimate setting to explore our collections without distraction. Reserve the space for yourself or a small group. We curate pieces in advance and ensure undivided attention to your preferences.",
  },
  {
    title: "Concierge Service",
    description: "Dedicated support for selection, sizing, and care. A single point of contact throughout. Whether you need resizing, restyling, or advice on caring for your pieces, we are available to assist at every step.",
  },
];

export default function PrivateClientsPage() {
  return (
    <>
      <section className="relative h-[50vh] min-h-[360px] flex items-center justify-center overflow-hidden bg-stone">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1920&q=80"
            alt=""
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-charcoal/50" />
        </div>
        <div className="relative z-10 text-center">
          <Heading
            as="h1"
            level={1}
            className="text-ivory tracking-[0.15em] uppercase font-medium"
          >
            Private Clients
          </Heading>
        </div>
      </section>

      <Section background="ivory" spacing="default">
        <Container>
          <div className="max-w-2xl mx-auto text-center mb-20">
            <RevealOnScroll>
              <Text variant="large" className="text-charcoal/90 mb-8">
                For those who seek the exceptional. Our Private Client program
                offers exclusive access, bespoke creation, and a relationship
                built on discretion and craftsmanship.
              </Text>
              <Text variant="body" muted>
                Whether commissioning a unique piece or exploring our archives,
                we are here to guide you.
              </Text>
            </RevealOnScroll>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 mb-24">
            {services.map((item, index) => (
              <RevealOnScroll key={item.title} delay={index * 0.1}>
                <div className="text-center md:text-left">
                  <Heading as="h2" level={4} className="text-charcoal mb-4">
                    {item.title}
                  </Heading>
                  <Text variant="body" muted>
                    {item.description}
                  </Text>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          <RevealOnScroll>
            <div className="max-w-xl mx-auto text-center border-t border-charcoal/10 pt-16">
              <Text variant="body" muted className="mb-8">
                To begin a conversation, please reach out. We will respond within
                twenty-four hours.
              </Text>
              <Link href="/contact">
                <Button variant="subtle">Inquire</Button>
              </Link>
            </div>
          </RevealOnScroll>
        </Container>
      </Section>
    </>
  );
}
