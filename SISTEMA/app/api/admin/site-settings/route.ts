import { apiError, apiSuccess } from "@/lib/apiResponse";
import { requireAdminCatalog } from "@/lib/admin-api-auth";
import { getSiteTextMap, updateSiteText } from "@/lib/data/siteText";
import { databaseConfigured } from "@/utils/safeEnv";

export async function GET(request: Request) {
  const auth = await requireAdminCatalog(request);
  if (auth instanceof Response) return auth;

  const map = await getSiteTextMap();
  return apiSuccess(map);
}

export async function PUT(request: Request) {
  const auth = await requireAdminCatalog(request);
  if (auth instanceof Response) return auth;

  if (!databaseConfigured()) return apiError("UNAVAILABLE", 503);

  let body: { items?: Array<{ key: string; value: string }> };
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", 400);
  }

  const items = body.items ?? [];
  if (items.length === 0) return apiSuccess({ ok: true });

  await updateSiteText(items);
  return apiSuccess({ ok: true });
}
