import { RevealOnScroll, Heading, Text } from "@/components/ui";
import { Container } from "@/components/ui";
import { getManifestoBlock } from "@/lib/sanity";

const defaultManifesto =
  "Jewelry that speaks in silence. Crafted for those who understand that true luxury needs no announcement.";

export async function ManifestoBlock() {
  const block = await getManifestoBlock();
  const headline = block?.headline ?? "The Manifesto";
  const body = block?.body ?? defaultManifesto;

  return (
    <section className="py-30 md:py-40">
      <Container>
        <RevealOnScroll>
          <div className="max-w-[900px] mx-auto text-center">
            <Heading as="h2" level={2} className="mb-12 text-charcoal">
              {headline}
            </Heading>
            <Text variant="large" className="font-serif text-2xl md:text-3xl text-charcoal/90">
              {body}
            </Text>
          </div>
        </RevealOnScroll>
      </Container>
    </section>
  );
}
