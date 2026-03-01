import type { AdminSession } from "@/lib/admin-auth";
import { canAccessCatalog, getSessionFromCookie } from "@/lib/admin-auth";

export async function requireAdminSession(
  request: Request
): Promise<AdminSession | Response> {
  const cookieHeader = request.headers.get("cookie");
  const session = getSessionFromCookie(cookieHeader ?? null);
  if (!session) {
    return new Response(
      JSON.stringify({ error: "UNAUTHORIZED" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  return session;
}

export async function requireAdminCatalog(
  request: Request
): Promise<AdminSession | Response> {
  const result = await requireAdminSession(request);
  if (result instanceof Response) return result;
  if (!canAccessCatalog(result.role)) {
    return new Response(
      JSON.stringify({ error: "FORBIDDEN" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  return result;
}
