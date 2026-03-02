import Image from "next/image";
import Link from "next/link";
import { Container, Heading, Text } from "@/components/ui";
import { getCollectionsForPublic } from "@/lib/data/catalog";
import { getSiteTextMap } from "@/lib/data/siteText";

const placeholderCollections = [
  { id: "1", handle: "signature", title: "Signature Collection", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80" },
  { id: "2", handle: "for-herself", title: "For Herself", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80" },
  { id: "3", handle: "for-her", title: "For Her", image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80" },
  { id: "4", handle: "high-jewelry", title: "High Jewelry", image: "https://images.unsplash.com/photo-1558858728-f4921d58d3d5?w=1200&q=80" },
];

export default async function CollectionsPage() {
  const [publicCollections, siteText] = await Promise.all([
    getCollectionsForPublic(),
    getSiteTextMap(),
  ]);
  const pageTitle = siteText.collections_page_title || "Collections";
  const pageSubtitle = siteText.collections_page_subtitle || "Explore our curated collections. Each piece reflects our commitment to craft and material.";

  const collections = publicCollections.length > 0
    ? publicCollections.map((c) => ({
        id: c.id,
        handle: c.handle,
        title: c.title,
        image: c.image ?? "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80",
      }))
    : placeholderCollections;

  return (
    <div className="min-h-screen py-20 md:py-30">
      <Container>
        <Heading as="h1" level={2} className="mb-6 text-charcoal">
          {pageTitle}
        </Heading>
        <Text variant="body" muted className="mb-20 max-w-2xl">
          {pageSubtitle}
        </Text>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.handle}`}
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden mb-6 min-h-0">
                <Image
                  src={collection.image}
                  alt={collection.title}
                  fill
                  className="object-cover object-center transition-transform duration-base ease-luxury group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />
              </div>
              <span className="font-serif text-2xl md:text-3xl text-charcoal group-hover:text-champagne transition-colors">
                {collection.title}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
