import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";

export async function getCollections() {
  if (!databaseConfigured() || !db) return [];
  try {
    const collections = await db.collection.findMany({
      where: { published: true },
      orderBy: { title: "asc" },
      include: {
        productCollections: {
          orderBy: { order: "asc" },
          take: 1,
          include: {
            product: {
              include: {
                images: {
                  orderBy: { order: "asc" },
                  take: 1,
                  include: { mediaAsset: true },
                },
              },
            },
          },
        },
      },
    });
    return collections;
  } catch {
    return [];
  }
}

export async function getCollectionBySlug(slug: string, productLimit = 50) {
  if (!databaseConfigured() || !db) return null;
  try {
    const collection = await db.collection.findUnique({
      where: { slug, published: true },
      include: {
        productCollections: {
          orderBy: { order: "asc" },
          take: productLimit,
          include: {
            product: {
              include: {
                images: {
                  orderBy: { order: "asc" },
                  include: { mediaAsset: true },
                },
                variants: { where: { active: true }, take: 1 },
              },
            },
          },
        },
      },
    });
    return collection;
  } catch {
    return null;
  }
}

export async function getAllCollectionsForAdmin() {
  if (!databaseConfigured() || !db) return [];
  try {
    const collections = await db.collection.findMany({
      orderBy: { title: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        published: true,
        updatedAt: true,
      },
    });
    return collections;
  } catch {
    return [];
  }
}

export async function getCollectionById(id: string) {
  if (!databaseConfigured() || !db) return null;
  try {
    const collection = await db.collection.findUnique({
      where: { id },
      include: {
        productCollections: {
          orderBy: { order: "asc" },
          include: { product: { select: { id: true, handle: true, title: true } } },
        },
      },
    });
    return collection;
  } catch {
    return null;
  }
}
