import { apiSuccess } from "@/lib/apiResponse";
import { requireAdminSession } from "@/lib/admin-api-auth";
import { getPages } from "@/lib/data/pages";

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
