import { revalidatePath, revalidateTag } from "next/cache";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { requireAdminSession } from "@/lib/admin-api-auth";
import { db } from "@/lib/db";
import { getPageBySlug } from "@/lib/data/pages";
import { databaseConfigured } from "@/utils/safeEnv";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authResult = await requireAdminSession(request);
  if (authResult instanceof Response) return authResult;

  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return apiError("NOT_FOUND", 404);

  return apiSuccess(page);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authResult = await requireAdminSession(request);
  if (authResult instanceof Response) return authResult;

  if (!databaseConfigured() || !db) {
    return apiError("UNAVAILABLE", 503);
  }

  const { slug } = await params;
  const existing = await db.page.findUnique({ where: { slug } });
  if (!existing) return apiError("NOT_FOUND", 404);

  let body: {
    title?: string;
    seoTitle?: string;
    seoDescription?: string;
    published?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", 400);
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.title === "string") updates.title = body.title;
  if (body.seoTitle !== undefined) updates.seoTitle = body.seoTitle ?? null;
  if (body.seoDescription !== undefined)
    updates.seoDescription = body.seoDescription ?? null;
  if (typeof body.published === "boolean") updates.published = body.published;

  if (Object.keys(updates).length === 0) {
    return apiSuccess({ ok: true });
  }

  await db.page.update({
    where: { slug },
    data: updates as Record<string, string | boolean | null>,
  });

  revalidateTag(`page:${slug}`);
  const path = slug === "home" ? "/" : `/${slug}`;
  revalidatePath(path);

  return apiSuccess({ ok: true });
}
