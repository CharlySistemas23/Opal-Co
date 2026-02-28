import Image from "next/image";
import Link from "next/link";
import { Container, Section, Heading, Text, Button, RevealOnScroll } from "@/components/ui";
import { getCachedTheHouseData } from "@/lib/data/cached";

export const metadata = {
  title: "The House",
  description: "Our story. Our craft. Our commitment.",
};

export default async function TheHousePage() {
  await getCachedTheHouseData();
  return (
    <>
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-stone">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=80"
            alt=""
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-charcoal/40" />
        </div>
        <div className="relative z-10 text-center">
          <Heading
            as="h1"
            level={1}
            className="text-ivory tracking-[0.15em] uppercase font-medium"
          >
            The House
          </Heading>
        </div>
      </section>

      <Section background="ivory" spacing="default">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <RevealOnScroll>
              <div className="relative aspect-[4/3] overflow-hidden min-h-0">
                <Image
                  src="https://images.unsplash.com/photo-1558858728-f4921d58d3d5?w=1200&q=80"
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized
                />
              </div>
            </RevealOnScroll>
            <RevealOnScroll>
              <div>
                <Heading as="h2" level={2} className="text-charcoal mb-8">
                  Origin
                </Heading>
                <Text variant="large" className="text-charcoal/90 mb-8">
                  OPAL & CO was founded in 2018 on a simple belief: jewelry should carry weight
                  without demanding attention. Each piece is conceived for those who
                  understand that true luxury speaks in silence.
                </Text>
                <Text variant="body" muted>
                  We work with master craftspeople. We choose materials with care.
                  We take time.
                </Text>
              </div>
            </RevealOnScroll>
          </div>
        </Container>
      </Section>

      <Section background="stone" spacing="default">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <RevealOnScroll>
              <div className="order-2 lg:order-1">
                <Heading as="h2" level={2} className="text-charcoal mb-8">
                  Craft
                </Heading>
                <Text variant="large" className="text-charcoal/90 mb-8">
                  Every piece is made by hand. No assembly lines. No shortcuts.
                  The process is as important as the result.
                </Text>
                <Text variant="body" muted>
                  Our ateliers work in small batches. Each creation is signed.
                  Each is traceable.
                </Text>
              </div>
            </RevealOnScroll>
            <RevealOnScroll>
              <div className="relative aspect-[4/3] overflow-hidden order-1 lg:order-2 min-h-0">
                <Image
                  src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80"
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized
                />
              </div>
            </RevealOnScroll>
          </div>
        </Container>
      </Section>

      <Section background="ivory" spacing="default">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <RevealOnScroll>
              <div className="relative aspect-[4/3] overflow-hidden min-h-0">
                <Image
                  src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80"
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized
                />
              </div>
            </RevealOnScroll>
            <RevealOnScroll>
              <div>
                <Heading as="h2" level={2} className="text-charcoal mb-8">
                  Materials
                </Heading>
                <Text variant="large" className="text-charcoal/90 mb-8">
                  Gold. Platinum. Diamonds. Sapphires. Pearls. We source only what
                  meets our standards. No compromise on purity, cut, or provenance.
                </Text>
                <Text variant="body" muted>
                  Every stone is traceable. Every metal is refined. Nothing is
                  left to chance.
                </Text>
              </div>
            </RevealOnScroll>
          </div>
        </Container>
      </Section>

      <Section background="stone" spacing="default">
        <Container>
          <RevealOnScroll>
            <div className="max-w-2xl mx-auto text-center mb-20">
              <Heading as="h2" level={3} className="text-charcoal mb-8">
                Our Values
              </Heading>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left md:text-center">
                <div>
                  <Text variant="small" className="font-sans uppercase tracking-[0.2em] text-charcoal/80 mb-2">Craft</Text>
                  <Text variant="body" muted className="text-sm">Handmade. No shortcuts.</Text>
                </div>
                <div>
                  <Text variant="small" className="font-sans uppercase tracking-[0.2em] text-charcoal/80 mb-2">Material</Text>
                  <Text variant="body" muted className="text-sm">Only what meets our standards.</Text>
                </div>
                <div>
                  <Text variant="small" className="font-sans uppercase tracking-[0.2em] text-charcoal/80 mb-2">Traceability</Text>
                  <Text variant="body" muted className="text-sm">Every stone, every metal.</Text>
                </div>
                <div>
                  <Text variant="small" className="font-sans uppercase tracking-[0.2em] text-charcoal/80 mb-2">Discretion</Text>
                  <Text variant="body" muted className="text-sm">A relationship built on trust.</Text>
                </div>
              </div>
            </div>
          </RevealOnScroll>
          <RevealOnScroll>
            <div className="max-w-2xl mx-auto text-center">
              <Heading as="h2" level={3} className="text-charcoal mb-8">
                Private Clients
              </Heading>
              <Text variant="body" muted className="mb-12">
                Bespoke commissions. Exclusive access. A relationship built on
                discretion and craftsmanship.
              </Text>
              <Link href="/private-clients">
                <Button variant="subtle">Inquire</Button>
              </Link>
            </div>
          </RevealOnScroll>
        </Container>
      </Section>
    </>
  );
}
