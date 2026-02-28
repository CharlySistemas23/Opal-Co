import { apiError, apiSuccess } from "@/lib/apiResponse";
import { requireAdminSession } from "@/lib/admin-api-auth";
import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminSession(request);
  if (authResult instanceof Response) return authResult;

  if (!databaseConfigured() || !db) {
    return apiError("UNAVAILABLE", 503);
  }

  const { id } = await params;
  const existing = await db.mediaAsset.findUnique({ where: { id } });
  if (!existing) return apiError("NOT_FOUND", 404);

  try {
    await db.mediaAsset.delete({ where: { id } });
    return apiSuccess({ ok: true });
  } catch {
    return apiError("FAILED", 400);
  }
}
