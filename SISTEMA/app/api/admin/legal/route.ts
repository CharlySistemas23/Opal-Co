import { apiSuccess } from "@/lib/apiResponse";
import { requireAdminCatalog } from "@/lib/admin-api-auth";
import { getLegalPages } from "@/lib/data/legal";

export async function GET(request: Request) {
  const auth = await requireAdminCatalog(request);
  if (auth instanceof Response) return auth;

  const pages = await getLegalPages();
  return apiSuccess(pages);
}
