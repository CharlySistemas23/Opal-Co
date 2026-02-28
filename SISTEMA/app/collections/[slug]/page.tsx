import { Metadata } from "next";
import { CollectionWithFilter } from "@/components/collection";
import { getCollectionForPublic } from "@/lib/data/catalog";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

const placeholderProducts = [
  { id: "1", handle: "radiance-ring", title: "Radiance Ring", image: { url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80", altText: "Radiance Ring" } },
  { id: "2", handle: "luminance-necklace", title: "Luminance Necklace", image: { url: "https://images.unsplash.com/photo-1617038443407-8a8f3981ff63?w=1200&q=80", altText: "Luminance Necklace" } },
  { id: "3", handle: "serenity-earrings", title: "Serenity Earrings", image: { url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&q=80", altText: "Serenity Earrings" } },
  { id: "4", handle: "essence-bracelet", title: "Essence Bracelet", image: { url: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1200&q=80", altText: "Essence Bracelet" } },
];

const filterOptions = [
  { value: "rings", label: "Rings" },
  { value: "necklaces", label: "Necklaces" },
  { value: "earrings", label: "Earrings" },
  { value: "bracelets", label: "Bracelets" },
];

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionForPublic(slug);
  const title = collection?.title ?? slug.replace(/-/g, " ");
  return {
    title: `${title} — Collections`,
    description: collection?.description ?? `Explore ${title} at OPAL & CO.`,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollectionForPublic(slug);
  const title = collection?.title ?? slug.replace(/-/g, " ");
  const products = collection?.products.map((p) => ({
    id: p.id,
    handle: p.handle,
    title: p.title,
    productType: p.productType ?? undefined,
    image: p.image ? { url: p.image.url, altText: p.image.altText } : undefined,
  })) ?? placeholderProducts;

  return (
    <CollectionWithFilter
      title={title}
      description={collection?.description ?? undefined}
      products={products}
      filterOptions={filterOptions}
      columns={3}
    />
  );
}
