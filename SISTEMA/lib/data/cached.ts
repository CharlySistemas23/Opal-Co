import { unstable_cache } from "next/cache";
import {
  getProductsForPublic,
  getCollectionForPublic,
  type PublicProduct,
  type PublicCollection,
} from "@/lib/data/catalog";
import { getJournalEntries, type JournalEntry } from "@/lib/sanity";
import { getPageBySlug } from "@/lib/data/pages";

export interface CachedHomeData {
  products: PublicProduct[];
  highJewelryCollection: PublicCollection | null;
  journalEntries: JournalEntry[];
}

async function fetchHomeData(): Promise<CachedHomeData> {
  const [products, highJewelryCollection, journalEntries] = await Promise.all([
    getProductsForPublic(4),
    getCollectionForPublic("high-jewelry", 4),
    getJournalEntries(),
  ]);
  return { products, highJewelryCollection, journalEntries };
}

export async function getCachedHomeData(): Promise<CachedHomeData> {
  return unstable_cache(fetchHomeData, ["home-page-data"], {
    tags: ["page:home"],
  })();
}

export async function getCachedTheHouseData() {
  return unstable_cache(
    async () => getPageBySlug("the-house"),
    ["the-house-page-data"],
    { tags: ["page:the-house"] }
  )();
}
