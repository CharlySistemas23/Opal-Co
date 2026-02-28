import { apiSuccess } from "@/lib/apiResponse";
import { requireAdminCatalog } from "@/lib/admin-api-auth";
import { getBranches, getStockLevels } from "@/lib/data/inventory";

export async function GET(request: Request) {
  const auth = await requireAdminCatalog(request);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get("branchId") ?? undefined;

  const [branches, stockLevels] = await Promise.all([
    getBranches(),
    getStockLevels(branchId),
  ]);

  return apiSuccess({ branches, stockLevels });
}
