import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";
import { DEFAULT_SITE_TEXT } from "@/lib/constants/siteText";

export { DEFAULT_SITE_TEXT };
export type SiteTextMap = Record<string, string>;

export async function getSiteTextMap(): Promise<SiteTextMap> {
  if (!databaseConfigured() || !db) {
    return { ...DEFAULT_SITE_TEXT };
  }
  try {
    const rows = await db.siteSetting.findMany();
    const map: SiteTextMap = { ...DEFAULT_SITE_TEXT };
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return map;
  } catch {
    return { ...DEFAULT_SITE_TEXT };
  }
}

export async function updateSiteText(
  items: Array<{ key: string; value: string }>
): Promise<void> {
  if (!databaseConfigured() || !db) return;
  for (const { key, value } of items) {
    await db.siteSetting.upsert({
      where: { key },
      create: { key, value: value ?? "" },
      update: { value: value ?? "" },
    });
  }
  revalidateTag("site:text");
}
