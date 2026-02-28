import Image from "next/image";
import Link from "next/link";
import { RevealOnScroll, Heading, Text, Button } from "@/components/ui";
import { Container } from "@/components/ui";

interface FeaturedJournalEntry {
  _id: string;
  title?: string;
  slug?: { current: string };
  excerpt?: string;
  publishedAt?: string;
  mainImage?: { asset?: { url?: string } };
}

interface FeaturedJournalSectionProps {
  entry: FeaturedJournalEntry | null;
}

const placeholderEntry: FeaturedJournalEntry = {
  _id: "1",
  title: "The Art of Patience",
  slug: { current: "the-art-of-patience" },
  excerpt: "Master craftsmanship demands time. We take ours.",
  publishedAt: "2024-01-15",
  mainImage: { asset: { url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80" } },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function FeaturedJournalSection({ entry }: FeaturedJournalSectionProps) {
  const displayEntry = entry ?? placeholderEntry;
  const slug = displayEntry.slug?.current ?? "";
  const imageUrl =
    (displayEntry.mainImage as { asset?: { url?: string } })?.asset?.url ??
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80";

  return (
    <section className="py-30 md:py-40 bg-ivory">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <RevealOnScroll>
            <Link href={`/journal/${slug}`} className="block group">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={displayEntry.title ?? ""}
                  fill
                  className="object-cover transition-transform duration-base ease-luxury group-hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized
                />
              </div>
            </Link>
          </RevealOnScroll>

          <RevealOnScroll>
            <div>
              <Text
                variant="small"
                muted
                className="font-sans uppercase tracking-[0.2em] mb-4"
              >
                {displayEntry.publishedAt ? formatDate(displayEntry.publishedAt) : "From the Journal"}
              </Text>
              <Heading as="h2" level={2} className="text-charcoal mb-8">
                {displayEntry.title}
              </Heading>
              <Text variant="large" className="text-charcoal/90 mb-8">
                {displayEntry.excerpt}
              </Text>
              <Link href={`/journal/${slug}`}>
                <Button variant="subtle">Read More</Button>
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </Container>
    </section>
  );
}
