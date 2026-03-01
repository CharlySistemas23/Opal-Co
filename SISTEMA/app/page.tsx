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
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { getCachedHomeData } from "@/lib/data/cached";

export default async function Home() {
  const { products, highJewelryCollection, journalEntries, homePage } =
    await getCachedHomeData();

  const productsGrid = products.map((p) => ({
    id: p.id,
    handle: p.handle,
    title: p.title,
    material: p.material,
    image: p.images[0]?.url ?? "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80",
  }));

  const highJewelryPieces =
    highJewelryCollection?.products.map((p) => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      material: p.productType ?? undefined,
      image: p.image?.url ?? "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80",
    })) ?? productsGrid;

  const blocks = homePage?.blocks ?? [];
  const useBlockRenderer = blocks.length > 0;

  return (
    <>
      {useBlockRenderer ? (
        <BlockRenderer
          blocks={blocks.map((b) => ({
            id: b.id,
            type: b.type,
            order: b.order,
            visible: b.visible,
            dataJson: b.dataJson,
          }))}
          products={productsGrid}
          highJewelryPieces={highJewelryPieces}
        />
      ) : (
        <>
          <HeroArchitectural />
          <ManifestoBlock />
          <SignatureCollectionGrid products={products} />
          <DualNarrativeSection />
          <HighJewelrySection pieces={highJewelryPieces} />
          <CraftSection />
          <PrivateClientsCTA />
        </>
      )}
      <FeaturedJournalSection entry={journalEntries[0] ?? null} />
      <NewsletterSection />
    </>
  );
}
