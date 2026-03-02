import Image from "next/image";
import { getCollectionForPublic } from "@/lib/data/catalog";
import { getSiteTextMap } from "@/lib/data/siteText";
import { HighJewelryGrid } from "@/components/home/HighJewelryGrid";
import { Heading } from "@/components/ui";

const placeholderPieces = [
  {
    id: "1",
    handle: "radiance-ring",
    title: "Radiance Ring",
    material: "18K Gold, Diamonds",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80",
  },
  {
    id: "2",
    handle: "luminance-necklace",
    title: "Luminance Necklace",
    material: "Platinum, Sapphires",
    image: "https://images.unsplash.com/photo-1617038443407-8a8f3981ff63?w=1200&q=80",
  },
];

export const metadata = {
  title: "High Jewelry",
  description: "One-of-a-kind creations. Master craftsmanship. Timeless design.",
};

export default async function HighJewelryPage() {
  const [collection, siteText] = await Promise.all([
    getCollectionForPublic("high-jewelry"),
    getSiteTextMap(),
  ]);
  const heroTitle = siteText.high_jewelry_hero_title || "High Jewelry";
  const heroImageUrl = siteText.high_jewelry_hero_image_url || "https://images.unsplash.com/photo-1558858728-f4921d58d3d5?w=1920&q=80";

  const pieces =
    collection?.products.map((p) => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      material: p.productType || undefined,
      image: p.image?.url ?? "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80",
    })) ?? placeholderPieces;

  return (
    <>
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-stone">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImageUrl}
            alt=""
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-charcoal/40" />
        </div>
        <div className="relative z-10 text-center">
          <Heading
            as="h1"
            level={1}
            className="text-ivory tracking-[0.15em] uppercase font-medium"
          >
            {heroTitle}
          </Heading>
        </div>
      </section>
      <HighJewelryGrid pieces={pieces} />
    </>
  );
}
