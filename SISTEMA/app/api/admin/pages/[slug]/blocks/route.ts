import { revalidatePath, revalidateTag } from "next/cache";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { requireAdminSession } from "@/lib/admin-api-auth";
import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";
import { PAGE_BLOCK_TYPES } from "@/lib/blocks/types";

const MAX_BLOCKS = 50;
const VALID_TYPES = new Set(PAGE_BLOCK_TYPES);

function isValidType(t: unknown): t is (typeof PAGE_BLOCK_TYPES)[number] {
  return typeof t === "string" && VALID_TYPES.has(t as (typeof PAGE_BLOCK_TYPES)[number]);
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

  let body: { blocks?: unknown[] };
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", 400);
  }

  const blocks = body.blocks;
  if (!Array.isArray(blocks)) {
    return apiError("INVALID_BODY", 400);
  }
  if (blocks.length > MAX_BLOCKS) {
    return apiError("TOO_MANY_BLOCKS", 400);
  }

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (!b || typeof b !== "object") {
      return apiError("INVALID_BLOCK", 400);
    }
    const t = (b as Record<string, unknown>).type;
    const order = (b as Record<string, unknown>).order;
    const visible = (b as Record<string, unknown>).visible;
    const dataJson = (b as Record<string, unknown>).dataJson;

    if (!isValidType(t)) return apiError("INVALID_BLOCK_TYPE", 400);
    if (typeof order !== "number" || order < 0) return apiError("INVALID_ORDER", 400);
    if (typeof visible !== "boolean") return apiError("INVALID_VISIBLE", 400);
    if (dataJson !== null && dataJson !== undefined && typeof dataJson !== "object") {
      return apiError("INVALID_DATA_JSON", 400);
    }
  }

  await db.$transaction(async (tx) => {
    await tx.pageBlock.deleteMany({ where: { pageId: existing.id } });
    if (blocks.length === 0) return;

    await tx.pageBlock.createMany({
      data: blocks.map((b, i) => {
        const block = b as Record<string, unknown>;
        return {
          pageId: existing.id,
          type: block.type as "HERO" | "MANIFESTO" | "FEATURED_PRODUCTS" | "DUAL_NARRATIVE" | "HIGH_JEWELRY" | "CRAFT" | "CTA" | "RICH_TEXT" | "GALLERY" | "FAQ_LIST",
          order: typeof block.order === "number" ? block.order : i,
          visible: block.visible === true,
          dataJson: (block.dataJson as object) ?? {},
        };
      }),
    });
  });

  revalidateTag(`page:${slug}`);
  const path = slug === "home" ? "/" : `/${slug}`;
  revalidatePath(path);

  return apiSuccess({ ok: true });
}
