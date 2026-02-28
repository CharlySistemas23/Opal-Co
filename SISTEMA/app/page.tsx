import {
  HeroArchitectural,
  ManifestoBlock,
  SignatureCollectionGrid,
  DualNarrativeSection,
  HighJewelrySection,
  CraftSection,
  FeaturedJournalSection,
  PrivateClientsCTA,
  NewsletterSection,
} from "@/components/home";
import { getCachedHomeData } from "@/lib/data/cached";

export default async function Home() {
  const { products, highJewelryCollection, journalEntries } =
    await getCachedHomeData();
  const highJewelryPieces =
    highJewelryCollection?.products.map((p) => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      material: p.productType || undefined,
      image: p.image?.url ?? "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80",
    })) ?? undefined;
  return (
    <>
      <HeroArchitectural />
      <ManifestoBlock />
      <SignatureCollectionGrid products={products} />
      <DualNarrativeSection />
      <HighJewelrySection pieces={highJewelryPieces} />
      <CraftSection />
      <FeaturedJournalSection entry={journalEntries[0] ?? null} />
      <PrivateClientsCTA />
      <NewsletterSection />
    </>
  );
}
