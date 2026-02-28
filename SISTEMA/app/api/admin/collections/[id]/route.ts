import { revalidateTag } from "next/cache";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { requireAdminCatalog } from "@/lib/admin-api-auth";
import { getCollectionById } from "@/lib/data/collections";
import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";

function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminCatalog(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const collection = await getCollectionById(id);
  if (!collection) return apiError("NOT_FOUND", 404);
  return apiSuccess(collection);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminCatalog(request);
  if (auth instanceof Response) return auth;

  if (!databaseConfigured() || !db) return apiError("UNAVAILABLE", 503);

  const { id } = await params;
  const existing = await db.collection.findUnique({ where: { id } });
  if (!existing) return apiError("NOT_FOUND", 404);

  let body: { slug?: string; title?: string; description?: string; published?: boolean };
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", 400);
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.title === "string") updates.title = body.title.trim();
  if (body.slug !== undefined) {
    const slug = typeof body.slug === "string" ? slugify(body.slug) : slugify(existing.slug);
    if (slug) {
      const dup = await db.collection.findFirst({ where: { slug, NOT: { id } } });
      if (dup) return apiError("DUPLICATE_SLUG", 400);
      updates.slug = slug;
    }
  }
  if (body.description !== undefined) updates.description = body.description ?? null;
  if (typeof body.published === "boolean") updates.published = body.published;

  if (Object.keys(updates).length === 0) return apiSuccess({ ok: true });

  await db.collection.update({
    where: { id },
    data: updates as Record<string, string | boolean | null>,
  });
  revalidateTag("page:home");
  return apiSuccess({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminCatalog(request);
  if (auth instanceof Response) return auth;

  if (!databaseConfigured() || !db) return apiError("UNAVAILABLE", 503);

  const { id } = await params;
  const existing = await db.collection.findUnique({ where: { id } });
  if (!existing) return apiError("NOT_FOUND", 404);

  await db.collection.delete({ where: { id } });
  revalidateTag("page:home");
  return apiSuccess({ ok: true });
}
