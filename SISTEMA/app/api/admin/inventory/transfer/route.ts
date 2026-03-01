import { apiError, apiSuccess } from "@/lib/apiResponse";
import { requireAdminCatalog } from "@/lib/admin-api-auth";
import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";

export async function POST(request: Request) {
  const auth = await requireAdminCatalog(request);
  if (auth instanceof Response) return auth;

  if (!databaseConfigured() || !db) return apiError("UNAVAILABLE", 503);

  let body: {
    fromBranchId?: string;
    toBranchId?: string;
    variantId?: string;
    quantity?: number;
    note?: string;
  };
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", 400);
  }

  const fromBranchId = typeof body.fromBranchId === "string" ? body.fromBranchId : "";
  const toBranchId = typeof body.toBranchId === "string" ? body.toBranchId : "";
  const variantId = typeof body.variantId === "string" ? body.variantId : "";
  const quantity = Math.abs(typeof body.quantity === "number" ? body.quantity : 0);
  const note = typeof body.note === "string" ? body.note : null;

  if (!fromBranchId || !toBranchId || !variantId || quantity <= 0) {
    return apiError("INVALID_BODY", 400);
  }
  if (fromBranchId === toBranchId) return apiError("SAME_BRANCH", 400);

  const [fromBranch, toBranch, variant] = await Promise.all([
    db.branch.findUnique({ where: { id: fromBranchId } }),
    db.branch.findUnique({ where: { id: toBranchId } }),
    db.variant.findUnique({ where: { id: variantId } }),
  ]);
  if (!fromBranch || !toBranch || !variant) return apiError("NOT_FOUND", 404);

  const userId = auth.userId;
  const referenceId = `transfer-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  await db.$transaction(async (tx) => {
    const fromLevel = await tx.stockLevel.findUnique({
      where: { branchId_variantId: { branchId: fromBranchId, variantId } },
    });
    const toLevel = await tx.stockLevel.findUnique({
      where: { branchId_variantId: { branchId: toBranchId, variantId } },
    });
    const fromQty = fromLevel?.quantity ?? 0;
    const toQty = toLevel?.quantity ?? 0;
    if (fromQty < quantity) throw new Error("INSUFFICIENT_STOCK");

    await tx.stockLevel.upsert({
      where: { branchId_variantId: { branchId: fromBranchId, variantId } },
      create: { branchId: fromBranchId, variantId, quantity: fromQty - quantity },
      update: { quantity: fromQty - quantity },
    });
    await tx.stockLevel.upsert({
      where: { branchId_variantId: { branchId: toBranchId, variantId } },
      create: { branchId: toBranchId, variantId, quantity: toQty + quantity },
      update: { quantity: toQty + quantity },
    });

    await tx.stockMovement.create({
      data: {
        branchId: fromBranchId,
        variantId,
        type: "OUT",
        quantity,
        note,
        referenceType: "TRANSFER",
        referenceId,
        actorStaffUserId: userId,
      },
    });
    await tx.stockMovement.create({
      data: {
        branchId: toBranchId,
        variantId,
        type: "IN",
        quantity,
        note,
        referenceType: "TRANSFER",
        referenceId,
        actorStaffUserId: userId,
      },
    });
  });

  return apiSuccess({ ok: true });
}
