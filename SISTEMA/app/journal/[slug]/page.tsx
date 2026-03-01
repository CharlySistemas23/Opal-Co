import Image from "next/image";
import { notFound } from "next/navigation";
import { getJournalEntryBySlug } from "@/lib/sanity";
import { Container, Heading, Text } from "@/components/ui";

const PLACEHOLDER_ENTRIES: Record<
  string,
  { title: string; body: string; publishedAt: string; mainImage: { asset: { url: string } } }
> = {
  "the-art-of-patience": {
    title: "The Art of Patience",
    body: "Master craftsmanship demands time. We take ours. In an age of haste, we choose to slow down. Every piece that leaves our atelier has been considered, refined, and signed.",
    publishedAt: "2024-01-15T00:00:00.000Z",
    mainImage: { asset: { url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80" } },
  },
  "material-truth": {
    title: "Material Truth",
    body: "Every stone has a story. Every metal a lineage. We trace each element to its source. Diamonds from conflict-free mines. Gold refined to our specifications. Platinum that carries its weight.",
    publishedAt: "2024-01-08T00:00:00.000Z",
    mainImage: { asset: { url: "https://images.unsplash.com/photo-1558858728-f4921d58d3d5?w=1200&q=80" } },
  },
  "in-the-atelier": {
    title: "In the Atelier",
    body: "A glimpse behind the craft. Hands that shape light. Our artisans work in silence. Each gesture is deliberate. Each piece emerges over weeks, sometimes months.",
    publishedAt: "2024-01-01T00:00:00.000Z",
    mainImage: { asset: { url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80" } },
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface JournalEntryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: JournalEntryPageProps) {
  const { slug } = await params;
  const entry = (await getJournalEntryBySlug(slug)) ?? PLACEHOLDER_ENTRIES[slug];
  return {
    title: (entry as { title?: string }).title ?? "Journal",
    description: (entry as { body?: string })?.body?.slice(0, 160) ?? undefined,
  };
}

export default async function JournalEntryPage({ params }: JournalEntryPageProps) {
  const { slug } = await params;
  const entry = (await getJournalEntryBySlug(slug)) ?? PLACEHOLDER_ENTRIES[slug] ?? null;

  if (!entry) notFound();

  const entryData = entry as {
    title?: string;
    body?: string;
    publishedAt?: string;
    mainImage?: { asset?: { url?: string } };
  };

  const imageUrl = entryData.mainImage?.asset?.url ?? "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80";
  const body = entryData.body;
  const isPortableText = Array.isArray(body);

  return (
    <div className="min-h-screen py-20 md:py-30">
      <Container className="max-w-3xl">
        <Text
          variant="small"
          muted
          className="font-sans uppercase tracking-[0.2em] mb-6"
        >
          {entryData.publishedAt ? formatDate(entryData.publishedAt) : ""}
        </Text>
        <Heading as="h1" level={2} className="mb-12 text-charcoal">
          {entryData.title}
        </Heading>
        <div className="relative aspect-[16/10] overflow-hidden mb-16 min-h-0">
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 896px"
            unoptimized
          />
        </div>
        <div className="prose prose-charcoal max-w-none">
          {isPortableText ? (
            <p className="font-sans text-lg text-charcoal/90 leading-relaxed">
              {((body as unknown[]) ?? [])
                .filter((b) => b && typeof b === "object" && "children" in b)
                .flatMap((b) => (b as { children?: { text?: string }[] }).children?.map((c) => c.text) ?? [])
                .join(" ")}
            </p>
          ) : (
            <Text variant="large" className="text-charcoal/90 leading-relaxed whitespace-pre-line">
              {typeof body === "string" ? body : ""}
            </Text>
          )}
        </div>
      </Container>
    </div>
  );
}
