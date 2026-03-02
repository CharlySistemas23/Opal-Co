import { apiError, apiSuccess } from "@/lib/apiResponse";
import { requireAdminCatalog } from "@/lib/admin-api-auth";
import { getLegalPageBySlug } from "@/lib/data/legal";
import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireAdminCatalog(request);
  if (auth instanceof Response) return auth;

  const { slug } = await params;
  const page = await getLegalPageBySlug(slug);
  if (!page) return apiError("NOT_FOUND", 404);
  return apiSuccess(page);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireAdminCatalog(request);
  if (auth instanceof Response) return auth;

  if (!databaseConfigured() || !db) return apiError("UNAVAILABLE", 503);

  const { slug } = await params;
  let body: { title?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", 400);
  }

  const existing = await db.legalPage.findUnique({ where: { slug } });
  if (!existing) return apiError("NOT_FOUND", 404);

  const updates: Record<string, unknown> = {};
  if (typeof body.title === "string") updates.title = body.title.trim();
  if (typeof body.content === "string") updates.content = body.content;

  if (Object.keys(updates).length === 0) return apiSuccess({ ok: true });

  await db.legalPage.update({
    where: { slug },
    data: updates as { title?: string; content?: string },
  });
  return apiSuccess({ ok: true });
}
