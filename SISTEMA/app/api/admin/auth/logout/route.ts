import { apiSuccess } from "@/lib/apiResponse";
import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";
import { getSessionFromCookie, SESSION_COOKIE_NAME } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const session = getSessionFromCookie(cookieHeader);

  if (databaseConfigured() && db && session?.sessionId) {
    await db.staffSession.deleteMany({ where: { id: session.sessionId } }).catch(() => {});
  }

  const res = apiSuccess({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
