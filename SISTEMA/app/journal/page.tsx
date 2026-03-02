import Image from "next/image";
import Link from "next/link";
import { getJournalEntries } from "@/lib/sanity";
import { getSiteTextMap } from "@/lib/data/siteText";
import { Container, Heading, Text, RevealOnScroll } from "@/components/ui";

const placeholderEntries = [
  {
    _id: "1",
    title: "The Art of Patience",
    slug: { current: "the-art-of-patience" },
    excerpt: "Master craftsmanship demands time. We take ours.",
    publishedAt: "2024-01-15",
    mainImage: { asset: { url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80" } },
  },
  {
    _id: "2",
    title: "Material Truth",
    slug: { current: "material-truth" },
    excerpt: "Every stone has a story. Every metal a lineage.",
    publishedAt: "2024-01-08",
    mainImage: { asset: { url: "https://images.unsplash.com/photo-1558858728-f4921d58d3d5?w=1200&q=80" } },
  },
  {
    _id: "3",
    title: "In the Atelier",
    slug: { current: "in-the-atelier" },
    excerpt: "A glimpse behind the craft. Hands that shape light.",
    publishedAt: "2024-01-01",
    mainImage: { asset: { url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80" } },
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const metadata = {
  title: "Journal",
  description: "Stories on craft, material, and the art of jewelry.",
};

export default async function JournalPage() {
  const [entries, siteText] = await Promise.all([
    getJournalEntries(),
    getSiteTextMap(),
  ]);
  const items = entries.length > 0 ? entries : placeholderEntries;
  const heroTitle = siteText.journal_hero_title || "Journal";
  const heroSubtitle = siteText.journal_hero_subtitle || "Stories on craft, material, and the art of jewelry.";

  return (
    <div className="min-h-screen">
      <section className="relative py-24 md:py-32 bg-stone">
        <Container className="text-center">
          <Heading as="h1" level={1} className="text-charcoal mb-6 tracking-[0.15em] uppercase">
            {heroTitle}
          </Heading>
          <Text variant="large" muted className="max-w-xl mx-auto">
            {heroSubtitle}
          </Text>
        </Container>
      </section>
      <div className="py-20 md:py-30">
        <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {items.map((entry, index) => (
            <RevealOnScroll key={entry._id} delay={index * 0.1}>
              <Link
                href={`/journal/${entry.slug?.current ?? ""}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden mb-6 min-h-0">
                  <Image
                    src={
                      (entry.mainImage as { asset?: { url?: string } })?.asset
                        ?.url ?? "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80"
                    }
                    alt={entry.title ?? ""}
                    fill
                    className="object-cover object-center transition-transform duration-base ease-luxury group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                </div>
                <Text
                  variant="small"
                  muted
                  className="font-sans uppercase tracking-[0.2em] mb-2"
                >
                  {entry.publishedAt ? formatDate(entry.publishedAt) : ""}
                </Text>
                <Heading as="h2" level={4} className="text-charcoal group-hover:text-champagne transition-colors">
                  {entry.title}
                </Heading>
                {entry.excerpt && (
                  <Text variant="small" muted className="mt-2">
                    {entry.excerpt}
                  </Text>
                )}
              </Link>
            </RevealOnScroll>
          ))}
        </div>
        </Container>
      </div>
    </div>
  );
}
