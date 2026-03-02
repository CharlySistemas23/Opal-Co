import { apiError, apiSuccess } from "@/lib/apiResponse";
import { requireAdminCatalog } from "@/lib/admin-api-auth";
import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";

function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function GET(request: Request) {
  const auth = await requireAdminCatalog(request);
  if (auth instanceof Response) return auth;

  if (!databaseConfigured() || !db) return apiError("UNAVAILABLE", 503);

  const stores = await db.store.findMany({ orderBy: { order: "asc" } });
  return apiSuccess(stores);
}

export async function POST(request: Request) {
  const auth = await requireAdminCatalog(request);
  if (auth instanceof Response) return auth;

  if (!databaseConfigured() || !db) return apiError("UNAVAILABLE", 503);

  let body: { slug?: string; name?: string; address?: string; city?: string; country?: string; mapUrl?: string; description?: string };
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", 400);
  }

  const slug = body.slug ? slugify(body.slug) : slugify(body.name ?? "store");
  if (!slug) return apiError("INVALID_SLUG", 400);

  const existing = await db.store.findUnique({ where: { slug } });
  if (existing) return apiError("DUPLICATE_SLUG", 400);

  const store = await db.store.create({
    data: {
      slug,
      name: body.name?.trim() ?? "New Store",
      address: body.address?.trim() ?? "",
      city: body.city?.trim() ?? "",
      country: body.country?.trim() ?? "",
      mapUrl: body.mapUrl?.trim() || null,
      description: body.description?.trim() || null,
      order: 0,
    },
  });
  return apiSuccess(store);
}
