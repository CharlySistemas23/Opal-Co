import { notFound } from "next/navigation";
import Link from "next/link";
import { Container, Heading, Text, Button } from "@/components/ui";
import faqData from "@/data/mock-faq.json";

interface FaqItem {
  id: string;
  slug: string;
  question: string;
  answer: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const items = faqData as FaqItem[];
  const item = items.find((i) => i.slug === slug);
  if (!item) return { title: "FAQ" };
  return {
    title: `${item.question} — FAQ`,
    description: item.answer.slice(0, 160),
  };
}

export default async function FaqSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const items = faqData as FaqItem[];
  const item = items.find((i) => i.slug === slug);
  if (!item) notFound();

  return (
    <div className="min-h-screen py-20 md:py-30">
      <Container className="max-w-2xl">
        <Heading as="h1" level={2} className="text-charcoal mb-8">
          {item.question}
        </Heading>
        <Text variant="body" className="mb-12">
          {item.answer}
        </Text>
        <Link href="/faq">
          <Button variant="subtle">Back to FAQ</Button>
        </Link>
      </Container>
    </div>
  );
}
