import { revalidateTag } from "next/cache";
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

  const { id: collectionId } = await params;
  const collection = await db.collection.findUnique({ where: { id: collectionId } });
  if (!collection) return apiError("NOT_FOUND", 404);

  let body: { productIds?: string[] };
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", 400);
  }

  const productIds = Array.isArray(body.productIds) ? body.productIds : [];

  for (const productId of productIds) {
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) return apiError("PRODUCT_NOT_FOUND", 400);
  }

  await db.$transaction(async (tx) => {
    await tx.productCollection.deleteMany({ where: { collectionId } });
    if (productIds.length > 0) {
      await tx.productCollection.createMany({
        data: productIds.map((productId, i) => ({
          productId,
          collectionId,
          order: i,
        })),
      });
    }
  });

  revalidateTag("page:home");
  return apiSuccess({ ok: true });
}
