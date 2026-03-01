import { revalidateTag } from "next/cache";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { requireAdminCatalog } from "@/lib/admin-api-auth";
import { getAllCollectionsForAdmin } from "@/lib/data/collections";
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

  const collections = await getAllCollectionsForAdmin();
  return apiSuccess({ collections });
}

export async function POST(request: Request) {
  const auth = await requireAdminCatalog(request);
  if (auth instanceof Response) return auth;

  if (!databaseConfigured() || !db) return apiError("UNAVAILABLE", 503);

  let body: { slug?: string; title?: string; description?: string; published?: boolean };
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", 400);
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return apiError("INVALID_TITLE", 400);

  const slug = typeof body.slug === "string" && body.slug.trim()
    ? slugify(body.slug)
    : slugify(title);
  if (!slug) return apiError("INVALID_SLUG", 400);

  const existing = await db.collection.findUnique({ where: { slug } });
  if (existing) return apiError("DUPLICATE_SLUG", 400);

  try {
    const collection = await db.collection.create({
      data: {
        slug,
        title,
        description: typeof body.description === "string" ? body.description : null,
        published: body.published !== false,
      },
    });
    revalidateTag("page:home");
    return apiSuccess(collection);
  } catch {
    return apiError("FAILED", 400);
  }
}
