import Link from "next/link";
import { Container, Heading, Text } from "@/components/ui";
import { getPageBySlug } from "@/lib/data/pages";

export const metadata = {
  title: "FAQ",
  description: "Frequently asked questions about OPAL & CO jewelry, shipping, and care.",
};

export default async function FaqPage() {
  const page = await getPageBySlug("faq");
  const faqBlock = page?.blocks?.find((b) => b.type === "FAQ_LIST");
  const data = (faqBlock?.dataJson ?? {}) as { items?: Array<{ question: string; answer: string; slug?: string }> };
  const items = data.items ?? [];

  return (
    <div className="min-h-screen py-20 md:py-30">
      <section className="py-24 md:py-32 bg-stone">
        <Container className="text-center">
          <Heading as="h1" level={1} className="text-charcoal mb-6 tracking-[0.15em] uppercase">
            FAQ
          </Heading>
          <Text variant="large" muted className="max-w-xl mx-auto">
            Common questions about our pieces, shipping, and care.
          </Text>
        </Container>
      </section>
      <div className="py-20 md:py-30">
        <Container className="max-w-2xl">
          {items.length === 0 ? (
            <p className="text-charcoal/70">No FAQ items yet. Add them in the admin.</p>
          ) : (
            <ul className="space-y-8">
              {items.map((item, idx) => (
                <li key={idx}>
                  <Link href={`/faq/${item.slug ?? `item-${idx}`}`} className="block group">
                    <Heading as="h2" level={4} className="text-charcoal group-hover:text-champagne transition-colors">
                      {item.question}
                    </Heading>
                    <Text variant="small" muted className="mt-2 line-clamp-2">
                      {item.answer}
                    </Text>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </div>
    </div>
  );
}
