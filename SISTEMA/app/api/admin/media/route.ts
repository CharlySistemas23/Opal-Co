import { apiError, apiSuccess } from "@/lib/apiResponse";
import { requireAdminSession } from "@/lib/admin-api-auth";
import { db } from "@/lib/db";
import { getMediaAssets } from "@/lib/data/media";
import { databaseConfigured } from "@/utils/safeEnv";

export async function GET(request: Request) {
  const authResult = await requireAdminSession(request);
  if (authResult instanceof Response) return authResult;

  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder") ?? undefined;
  const tagsParam = searchParams.get("tags");
  const tags = tagsParam ? tagsParam.split(",").map((t) => t.trim()).filter(Boolean) : undefined;
  const q = searchParams.get("q") ?? undefined;

  const assets = await getMediaAssets({ folder, tags, q });
  return apiSuccess({ assets });
}

export async function POST(request: Request) {
  const authResult = await requireAdminSession(request);
  if (authResult instanceof Response) return authResult;

  if (!databaseConfigured() || !db) {
    return apiError("UNAVAILABLE", 503);
  }

  let body: {
    publicId?: string;
    url?: string;
    type?: string;
    format?: string;
    bytes?: number;
    width?: number;
    height?: number;
    folder?: string;
    tags?: string[];
    alt?: string;
  };
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", 400);
  }

  const publicId = typeof body.publicId === "string" ? body.publicId.trim() : "";
  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!publicId || !url) {
    return apiError("INVALID_BODY", 400);
  }

  try {
    const asset = await db.mediaAsset.create({
      data: {
        publicId,
        url,
        type: body.type === "VIDEO" ? "VIDEO" : "IMAGE",
        format: typeof body.format === "string" ? body.format : null,
        bytes: typeof body.bytes === "number" ? body.bytes : null,
        width: typeof body.width === "number" ? body.width : null,
        height: typeof body.height === "number" ? body.height : null,
        folder: typeof body.folder === "string" ? body.folder : null,
        tags: Array.isArray(body.tags) ? body.tags : [],
        alt: typeof body.alt === "string" ? body.alt : null,
      },
    });
    return apiSuccess(asset);
  } catch (e: unknown) {
    const code = e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002"
      ? "DUPLICATE"
      : "FAILED";
    return apiError(code, 400);
  }
}
