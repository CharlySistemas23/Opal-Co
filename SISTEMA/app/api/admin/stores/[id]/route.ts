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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminCatalog(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const store = await db?.store.findUnique({ where: { id } });
  if (!store) return apiError("NOT_FOUND", 404);
  return apiSuccess(store);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminCatalog(request);
  if (auth instanceof Response) return auth;

  if (!databaseConfigured() || !db) return apiError("UNAVAILABLE", 503);

  const { id } = await params;
  const existing = await db.store.findUnique({ where: { id } });
  if (!existing) return apiError("NOT_FOUND", 404);

  let body: { slug?: string; name?: string; address?: string; city?: string; country?: string; mapUrl?: string; description?: string; order?: number };
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", 400);
  }

  const updates: Record<string, unknown> = {};
  if (body.slug !== undefined) {
    const slug = slugify(body.slug);
    if (slug) {
      const dup = await db.store.findFirst({ where: { slug, NOT: { id } } });
      if (dup) return apiError("DUPLICATE_SLUG", 400);
      updates.slug = slug;
    }
  }
  if (typeof body.name === "string") updates.name = body.name.trim();
  if (typeof body.address === "string") updates.address = body.address.trim();
  if (typeof body.city === "string") updates.city = body.city.trim();
  if (typeof body.country === "string") updates.country = body.country.trim();
  if (body.mapUrl !== undefined) updates.mapUrl = body.mapUrl?.trim() || null;
  if (body.description !== undefined) updates.description = body.description?.trim() || null;
  if (typeof body.order === "number") updates.order = body.order;

  if (Object.keys(updates).length === 0) return apiSuccess({ ok: true });

  await db.store.update({ where: { id }, data: updates as Record<string, unknown> });
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
  const existing = await db.store.findUnique({ where: { id } });
  if (!existing) return apiError("NOT_FOUND", 404);

  await db.store.delete({ where: { id } });
  return apiSuccess({ ok: true });
}
