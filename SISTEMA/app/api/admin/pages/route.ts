import { revalidateTag } from "next/cache";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { requireAdminSession } from "@/lib/admin-api-auth";
import { getPages } from "@/lib/data/pages";
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
  const authResult = await requireAdminSession(request);
  if (authResult instanceof Response) return authResult;

  const pages = await getPages();
  return apiSuccess(
    pages.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      published: p.published,
      updatedAt: p.updatedAt,
    }))
  );
}

export async function POST(request: Request) {
  const authResult = await requireAdminSession(request);
  if (authResult instanceof Response) return authResult;

  if (!databaseConfigured() || !db) return apiError("UNAVAILABLE", 503);

  let body: { slug?: string; title?: string; seoTitle?: string; seoDescription?: string; published?: boolean };
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

  const existing = await db.page.findUnique({ where: { slug } });
  if (existing) return apiError("DUPLICATE_SLUG", 400);

  try {
    const page = await db.page.create({
      data: {
        slug,
        title,
        seoTitle: typeof body.seoTitle === "string" ? body.seoTitle : null,
        seoDescription: typeof body.seoDescription === "string" ? body.seoDescription : null,
        published: body.published !== false,
      },
    });
    revalidateTag("page:home");
    return apiSuccess(page);
  } catch {
    return apiError("FAILED", 400);
  }
}
