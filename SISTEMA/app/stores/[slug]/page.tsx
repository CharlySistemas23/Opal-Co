import { notFound } from "next/navigation";
import Link from "next/link";
import { Container, Heading, Text, Button } from "@/components/ui";
import storesData from "@/data/mock-stores.json";

interface Store {
  id: string;
  slug: string;
  name: string;
  address: string;
  city: string;
  country: string;
  mapUrl?: string | null;
  description?: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const stores = storesData as Store[];
  const store = stores.find((s) => s.slug === slug);
  if (!store) return { title: "Store not found" };
  return {
    title: `${store.name} — Stores`,
    description: store.description ?? `OPAL & CO ${store.name}. ${store.address}.`,
  };
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const stores = storesData as Store[];
  const store = stores.find((s) => s.slug === slug);
  if (!store) notFound();

  return (
    <div className="min-h-screen py-20 md:py-30">
      <Container className="max-w-2xl">
        <Heading as="h1" level={2} className="text-charcoal mb-8">
          {store.name}
        </Heading>
        <Text variant="body" muted className="mb-6">
          {store.address}
        </Text>
        <Text variant="body" muted className="mb-8">
          {store.city}, {store.country}
        </Text>
        {store.description && (
          <Text variant="body" className="mb-8">
            {store.description}
          </Text>
        )}
        {store.mapUrl ? (
          <a
            href={store.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-sans text-sm uppercase tracking-[0.2em] text-charcoal hover:text-champagne transition-colors"
          >
            Open in Maps
          </a>
        ) : (
          <p className="font-sans text-sm text-charcoal/70">
            By appointment only. <Link href="/contact" className="underline hover:text-champagne">Contact us</Link> to schedule a visit.
          </p>
        )}
        <div className="mt-12">
          <Link href="/stores">
            <Button variant="subtle">Back to stores</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
