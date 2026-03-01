import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";

export interface MediaAssetFilters {
  folder?: string;
  tags?: string[];
  q?: string;
}

export async function getMediaAssets(filters?: MediaAssetFilters) {
  if (!databaseConfigured() || !db) return [];
  try {
    const where: Record<string, unknown> = {};
    if (filters?.folder) {
      where.folder = filters.folder;
    }
    if (filters?.tags?.length) {
      where.tags = { hasEvery: filters.tags };
    }
    if (filters?.q?.trim()) {
      const q = filters.q.trim();
      where.OR = [
        { publicId: { contains: q, mode: "insensitive" } },
        { alt: { contains: q, mode: "insensitive" } },
      ];
    }
    const assets = await db.mediaAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        publicId: true,
        url: true,
        folder: true,
        tags: true,
        alt: true,
        createdAt: true,
      },
    });
    return assets;
  } catch {
    return [];
  }
}

export async function getMediaAssetById(id: string) {
  if (!databaseConfigured() || !db) return null;
  try {
    const asset = await db.mediaAsset.findUnique({
      where: { id },
      select: { id: true, url: true, alt: true },
    });
    return asset;
  } catch {
    return null;
  }
}
