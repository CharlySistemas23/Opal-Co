import { revalidatePath } from "next/cache";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { requireAdminCatalog } from "@/lib/admin-api-auth";
import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminCatalog(request);
  if (auth instanceof Response) return auth;

  if (!databaseConfigured() || !db) return apiError("UNAVAILABLE", 503);

  const { id: productId } = await params;
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return apiError("NOT_FOUND", 404);

  let body: { images?: Array<{ mediaAssetId: string; order: number }> };
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", 400);
  }

  const images = body.images;
  if (!Array.isArray(images)) return apiError("INVALID_BODY", 400);

  for (const img of images) {
    if (typeof img.mediaAssetId !== "string" || !img.mediaAssetId) {
      return apiError("INVALID_MEDIA_ASSET_ID", 400);
    }
    const asset = await db.mediaAsset.findUnique({ where: { id: img.mediaAssetId } });
    if (!asset) return apiError("MEDIA_ASSET_NOT_FOUND", 400);
  }

  await db.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId } });
    if (images.length > 0) {
      await tx.productImage.createMany({
        data: images.map((img, i) => ({
          productId,
          mediaAssetId: img.mediaAssetId,
          order: typeof img.order === "number" ? img.order : i,
        })),
      });
    }
  });

  revalidatePath(`/products/${product.handle}`);
  return apiSuccess({ ok: true });
}
