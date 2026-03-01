import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";

export async function getPages() {
  if (!databaseConfigured() || !db) return [];
  try {
    const pages = await db.page.findMany({
    orderBy: { slug: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      published: true,
      updatedAt: true,
    },
  });
    return pages;
  } catch {
    return [];
  }
}

export async function getPageBySlug(slug: string) {
  if (!databaseConfigured() || !db) return null;
  try {
    const page = await db.page.findUnique({
    where: { slug },
    include: {
      blocks: {
        orderBy: { order: "asc" },
      },
    },
  });
    return page;
  } catch {
    return null;
  }
}

export async function getPageBlocks(pageId: string) {
  if (!databaseConfigured() || !db) return [];
  try {
    const blocks = await db.pageBlock.findMany({
    where: { pageId },
    orderBy: { order: "asc" },
  });
    return blocks;
  } catch {
    return [];
  }
}
