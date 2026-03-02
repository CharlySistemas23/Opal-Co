import { getMediaAssetById } from "@/lib/data/media";

export async function resolveMediaUrl(
  mediaAssetId: string | null,
  fallbackUrl?: string
): Promise<string | null> {
  if (!mediaAssetId) return fallbackUrl ?? null;
  const asset = await getMediaAssetById(mediaAssetId);
  return asset?.url ?? fallbackUrl ?? null;
}
