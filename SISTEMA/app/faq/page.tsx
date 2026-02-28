import Link from "next/link";
import { Container, Heading, Text } from "@/components/ui";
import faqData from "@/data/mock-faq.json";

export const metadata = {
  title: "FAQ",
  description: "Frequently asked questions about OPAL & CO jewelry, shipping, and care.",
};

interface FaqItem {
  id: string;
  slug: string;
  question: string;
  answer: string;
}

export default function FaqPage() {
  const items = faqData as FaqItem[];

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
          <ul className="space-y-8">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/faq/${item.slug}`}
                  className="block group"
                >
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
        </Container>
      </div>
    </div>
  );
}
