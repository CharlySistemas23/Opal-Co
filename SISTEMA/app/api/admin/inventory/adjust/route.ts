import { apiError, apiSuccess } from "@/lib/apiResponse";
import { requireAdminCatalog } from "@/lib/admin-api-auth";
import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";

export async function POST(request: Request) {
  const auth = await requireAdminCatalog(request);
  if (auth instanceof Response) return auth;

  if (!databaseConfigured() || !db) return apiError("UNAVAILABLE", 503);

  let body: { branchId?: string; variantId?: string; quantity?: number; type?: string; note?: string };
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", 400);
  }

  const branchId = typeof body.branchId === "string" ? body.branchId : "";
  const variantId = typeof body.variantId === "string" ? body.variantId : "";
  const quantity = typeof body.quantity === "number" ? body.quantity : 0;
  const type = body.type === "IN" || body.type === "OUT" || body.type === "ADJUST" ? body.type : "ADJUST";
  const note = typeof body.note === "string" ? body.note : null;

  if (!branchId || !variantId) return apiError("INVALID_BODY", 400);

  const branch = await db.branch.findUnique({ where: { id: branchId } });
  const variant = await db.variant.findUnique({ where: { id: variantId } });
  if (!branch || !variant) return apiError("NOT_FOUND", 404);

  const userId = auth.userId;
  const absQty = Math.abs(quantity);
  const delta =
    type === "ADJUST"
      ? null
      : type === "OUT"
        ? -absQty
        : absQty;

  await db.$transaction(async (tx) => {
    const level = await tx.stockLevel.findUnique({
      where: { branchId_variantId: { branchId, variantId } },
    });
    const newQty =
      type === "ADJUST"
        ? Math.max(0, absQty)
        : Math.max(0, (level?.quantity ?? 0) + (delta ?? 0));
    await tx.stockLevel.upsert({
      where: { branchId_variantId: { branchId, variantId } },
      create: { branchId, variantId, quantity: newQty },
      update: { quantity: newQty },
    });
    await tx.stockMovement.create({
      data: {
        branchId,
        variantId,
        type,
        quantity: Math.abs(quantity),
        note,
        actorStaffUserId: userId,
      },
    });
  });

  return apiSuccess({ ok: true });
}
