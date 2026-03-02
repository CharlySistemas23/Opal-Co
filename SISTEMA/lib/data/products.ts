import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";

export async function getProducts(first = 50) {
  if (!databaseConfigured() || !db) return [];
  try {
    const products = await db.product.findMany({
      where: { published: true },
      orderBy: { updatedAt: "desc" },
      take: first,
      include: {
        images: {
          orderBy: { order: "asc" },
          include: { mediaAsset: true },
        },
        variants: { where: { active: true } },
      },
    });
    return products;
  } catch {
    return [];
  }
}

export async function getProductByHandle(handle: string) {
  if (!databaseConfigured() || !db) return null;
  try {
    const product = await db.product.findUnique({
      where: { handle, published: true },
      include: {
        images: {
          orderBy: { order: "asc" },
          include: { mediaAsset: true },
        },
        variants: { where: { active: true } },
      },
    });
    return product;
  } catch {
    return null;
  }
}

export async function getProductById(id: string) {
  if (!databaseConfigured() || !db) return null;
  try {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: "asc" },
          include: { mediaAsset: true },
        },
        variants: true,
      },
    });
    return product;
  } catch {
    return null;
  }
}

export async function getAllProductsForAdmin(limit = 100) {
  if (!databaseConfigured() || !db) return [];
  try {
    const products = await db.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: {
        id: true,
        handle: true,
        title: true,
        published: true,
        updatedAt: true,
      },
    });
    return products;
  } catch {
    return [];
  }
}
