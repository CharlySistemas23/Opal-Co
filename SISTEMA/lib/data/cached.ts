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
  homePage: Awaited<ReturnType<typeof getPageBySlug>>;
}

async function fetchHomeData(): Promise<CachedHomeData> {
  const [products, highJewelryCollection, journalEntries, homePage] = await Promise.all([
    getProductsForPublic(4),
    getCollectionForPublic("high-jewelry", 4),
    getJournalEntries(),
    getPageBySlug("home"),
  ]);
  return { products, highJewelryCollection, journalEntries, homePage };
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
