import { revalidatePath, revalidateTag } from "next/cache";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { requireAdminCatalog } from "@/lib/admin-api-auth";
import { getAllProductsForAdmin } from "@/lib/data/products";
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

  const products = await getAllProductsForAdmin();
  return apiSuccess({ products });
}

export async function POST(request: Request) {
  const auth = await requireAdminCatalog(request);
  if (auth instanceof Response) return auth;

  if (!databaseConfigured() || !db) return apiError("UNAVAILABLE", 503);

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

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return apiError("INVALID_TITLE", 400);

  const handle = typeof body.handle === "string" && body.handle.trim()
    ? slugify(body.handle)
    : slugify(title);
  if (!handle) return apiError("INVALID_HANDLE", 400);

  const existing = await db.product.findUnique({ where: { handle } });
  if (existing) return apiError("DUPLICATE_HANDLE", 400);

  try {
    const product = await db.product.create({
      data: {
        handle,
        title,
        description: typeof body.description === "string" ? body.description : null,
        materialSummary: typeof body.materialSummary === "string" ? body.materialSummary : null,
        gemstoneSummary: typeof body.gemstoneSummary === "string" ? body.gemstoneSummary : null,
        byInquiry: body.byInquiry === true,
        published: body.published !== false,
      },
    });
    revalidatePath("/products/[handle]");
    revalidateTag("page:home");
    return apiSuccess(product);
  } catch {
    return apiError("FAILED", 400);
  }
}
