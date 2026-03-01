import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";

export interface LegalPageData {
  id: string;
  slug: string;
  title: string;
  content: string;
}

export async function getLegalPages(): Promise<LegalPageData[]> {
  if (!databaseConfigured() || !db) return [];
  try {
    const pages = await db.legalPage.findMany({
      orderBy: { slug: "asc" },
    });
    return pages;
  } catch {
    return [];
  }
}

export async function getLegalPageBySlug(slug: string): Promise<LegalPageData | null> {
  if (!databaseConfigured() || !db) return null;
  try {
    const page = await db.legalPage.findUnique({
      where: { slug },
    });
    return page;
  } catch {
    return null;
  }
}
