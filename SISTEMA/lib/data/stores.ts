import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";

export interface PublicStore {
  id: string;
  slug: string;
  name: string;
  address: string;
  city: string;
  country: string;
  mapUrl: string | null;
  description: string | null;
}

export async function getStores(): Promise<PublicStore[]> {
  if (!databaseConfigured() || !db) return [];
  try {
    const stores = await db.store.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        address: true,
        city: true,
        country: true,
        mapUrl: true,
        description: true,
      },
    });
    return stores;
  } catch {
    return [];
  }
}

export async function getStoreBySlug(slug: string): Promise<PublicStore | null> {
  if (!databaseConfigured() || !db) return null;
  try {
    const store = await db.store.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        address: true,
        city: true,
        country: true,
        mapUrl: true,
        description: true,
      },
    });
    return store;
  } catch {
    return null;
  }
}
