import { revalidatePath, revalidateTag } from "next/cache";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { requireAdminCatalog } from "@/lib/admin-api-auth";
import { getProductById } from "@/lib/data/products";
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
  const product = await getProductById(id);
  if (!product) return apiError("NOT_FOUND", 404);
  return apiSuccess(product);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminCatalog(request);
  if (auth instanceof Response) return auth;

  if (!databaseConfigured() || !db) return apiError("UNAVAILABLE", 503);

  const { id } = await params;
  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return apiError("NOT_FOUND", 404);

  let body: {
    handle?: string;
    title?: string;
    description?: string;
    materialSummary?: string;
    gemstoneSummary?: string;
    byInquiry?: boolean;
    published?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", 400);
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.title === "string") updates.title = body.title.trim();
  if (body.handle !== undefined) {
    const handle = typeof body.handle === "string" ? slugify(body.handle) : slugify(existing.handle);
    if (handle) {
      const dup = await db.product.findFirst({ where: { handle, NOT: { id } } });
      if (dup) return apiError("DUPLICATE_HANDLE", 400);
      updates.handle = handle;
    }
  }
  if (body.description !== undefined) updates.description = body.description ?? null;
  if (body.materialSummary !== undefined) updates.materialSummary = body.materialSummary ?? null;
  if (body.gemstoneSummary !== undefined) updates.gemstoneSummary = body.gemstoneSummary ?? null;
  if (typeof body.byInquiry === "boolean") updates.byInquiry = body.byInquiry;
  if (typeof body.published === "boolean") updates.published = body.published;

  if (Object.keys(updates).length === 0) return apiSuccess({ ok: true });

  await db.product.update({
    where: { id },
    data: updates as Record<string, string | boolean | null>,
  });
  revalidatePath(`/products/${existing.handle}`);
  if (updates.handle) revalidatePath(`/products/${updates.handle}`);
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
  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return apiError("NOT_FOUND", 404);

  await db.product.delete({ where: { id } });
  revalidatePath(`/products/${existing.handle}`);
  revalidateTag("page:home");
  return apiSuccess({ ok: true });
}
