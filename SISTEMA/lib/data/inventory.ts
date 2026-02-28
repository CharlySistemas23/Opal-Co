import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";

export async function getBranches() {
  if (!databaseConfigured() || !db) return [];
  try {
    const branches = await db.branch.findMany({
      orderBy: { code: "asc" },
    });
    return branches;
  } catch {
    return [];
  }
}

export async function getStockLevels(branchId?: string) {
  if (!databaseConfigured() || !db) return [];
  try {
    const where = branchId ? { branchId } : {};
    const levels = await db.stockLevel.findMany({
      where,
      include: {
        branch: true,
        variant: {
          include: {
            product: { select: { handle: true, title: true } },
          },
        },
      },
    });
    return levels;
  } catch {
    return [];
  }
}

export async function getStockMovements(
  opts?: { variantId?: string; branchId?: string; limit?: number }
) {
  if (!databaseConfigured() || !db) return [];
  try {
    const where: Record<string, string> = {};
    if (opts?.variantId) where.variantId = opts.variantId;
    if (opts?.branchId) where.branchId = opts.branchId;
    const movements = await db.stockMovement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: opts?.limit ?? 50,
      include: {
        variant: {
          include: { product: { select: { handle: true, title: true } } },
        },
        branch: true,
      },
    });
    return movements;
  } catch {
    return [];
  }
}

export async function getDefaultBranchId(): Promise<string | null> {
  if (!databaseConfigured() || !db) return null;
  try {
    const { getDefaultBranchCode } = await import("@/utils/safeEnv");
    const code = getDefaultBranchCode();
    if (code) {
      const branch = await db.branch.findUnique({
        where: { code },
      });
      return branch?.id ?? null;
    }
    const first = await db.branch.findFirst({
      orderBy: { code: "asc" },
    });
    return first?.id ?? null;
  } catch {
    return null;
  }
}

export async function getAvailableStockForVariant(variantId: string): Promise<number> {
  if (!databaseConfigured() || !db) return 0;
  try {
    const branchId = await getDefaultBranchId();
    if (!branchId) return 0;
    const level = await db.stockLevel.findUnique({
      where: { branchId_variantId: { branchId, variantId } },
    });
    return level?.quantity ?? 0;
  } catch {
    return 0;
  }
}
