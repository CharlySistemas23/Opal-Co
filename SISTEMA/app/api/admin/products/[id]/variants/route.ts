import { revalidatePath } from "next/cache";
import { Prisma } from "@/lib/generated/prisma/client";
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

  let body: { variants?: Array<{
    id?: string;
    sku: string;
    title: string;
    priceCents: number;
    currency?: string;
    attributesJson?: object;
    active?: boolean;
  }> };
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", 400);
  }

  const variants = body.variants;
  if (!Array.isArray(variants)) return apiError("INVALID_BODY", 400);

  for (const v of variants) {
    if (typeof v.sku !== "string" || !v.sku.trim()) return apiError("INVALID_SKU", 400);
    if (typeof v.title !== "string" || !v.title.trim()) return apiError("INVALID_TITLE", 400);
    if (typeof v.priceCents !== "number" || v.priceCents < 0) return apiError("INVALID_PRICE", 400);
  }

  const skus = variants.map((v) => v.sku.trim().toUpperCase());
  if (new Set(skus).size !== skus.length) return apiError("DUPLICATE_SKU", 400);

  for (const sku of skus) {
    const existing = await db.variant.findFirst({
      where: { sku: { equals: sku, mode: "insensitive" } },
      include: { product: true },
    });
    if (existing && existing.productId !== productId) {
      return apiError("DUPLICATE_SKU", 400);
    }
  }

  await db.$transaction(async (tx) => {
    const existing = await tx.variant.findMany({ where: { productId } });
    const toDelete = existing.filter((e) => !variants.some((v) => v.id === e.id));
    for (const v of toDelete) {
      await tx.variant.delete({ where: { id: v.id } });
    }
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i]!;
      const sku = v.sku.trim();
      const data = {
        productId,
        sku,
        title: v.title.trim(),
        priceCents: Math.round(v.priceCents),
        currency: v.currency ?? "USD",
        attributesJson: v.attributesJson ?? Prisma.JsonNull,
        active: v.active !== false,
      };
      const existingVariant = existing.find((e) => e.id === v.id);
      if (existingVariant && existingVariant.productId === productId) {
        await tx.variant.update({ where: { id: v.id! }, data });
      } else {
        await tx.variant.create({ data });
      }
    }
  });

  revalidatePath(`/products/${product.handle}`);
  return apiSuccess({ ok: true });
}
