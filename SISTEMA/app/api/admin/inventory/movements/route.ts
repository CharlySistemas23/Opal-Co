import { apiSuccess } from "@/lib/apiResponse";
import { requireAdminCatalog } from "@/lib/admin-api-auth";
import { getStockMovements } from "@/lib/data/inventory";

export async function GET(request: Request) {
  const auth = await requireAdminCatalog(request);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(request.url);
  const variantId = searchParams.get("variantId") ?? undefined;
  const branchId = searchParams.get("branchId") ?? undefined;
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);

  const movements = await getStockMovements({ variantId, branchId, limit });
  return apiSuccess({ movements });
}
