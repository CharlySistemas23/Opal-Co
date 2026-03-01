import { NextResponse } from "next/server";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";
import {
  type AdminSession,
  createSessionToken,
  createSignedPayload,
  getMockOwnerEmail,
  hashToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  verifyOtpHash,
} from "@/lib/admin-auth";

function setSessionCookie(sessionPayload: string): NextResponse {
  const res = apiSuccess({ ok: true });
  const isProd = process.env.NODE_ENV === "production";
  res.cookies.set(SESSION_COOKIE_NAME, sessionPayload, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body?.code === "string" ? body.code.trim().replace(/\s/g, "") : "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return apiError("INVALID_EMAIL", 400);
    }
    if (!code || !/^\d{6}$/.test(code)) {
      return apiError("INVALID_CODE", 400);
    }

    if (!databaseConfigured()) {
      const mockOwner = getMockOwnerEmail();
      if (email !== mockOwner) {
        return apiError("INVALID_CODE", 200);
      }
      const payload = createSignedPayload({
        userId: "mock-owner",
        role: "OWNER",
      });
      return setSessionCookie(payload);
    }

    if (!db) return apiError("UNAVAILABLE", 503);

    try {
      const user = await db.staffUser.findUnique({
        where: { email },
      });

      const mockOwner = getMockOwnerEmail();
      if ((!user || user.status !== "ACTIVE") && email === mockOwner) {
        const payload = createSignedPayload({
          userId: "mock-owner",
          role: "OWNER",
        });
        return setSessionCookie(payload);
      }
      if (!user || user.status !== "ACTIVE") {
        return apiError("INVALID_CODE", 200);
      }

      const tokens = await db.staffOtpToken.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 1,
      });

      const otpToken = tokens[0];
      if (!otpToken || otpToken.expiresAt < new Date() || otpToken.attempts >= 5) {
        return apiError("INVALID_CODE", 200);
      }

      if (!verifyOtpHash(code, otpToken.codeHash)) {
        await db.staffOtpToken.update({
          where: { id: otpToken.id },
          data: { attempts: otpToken.attempts + 1 },
        });
        return apiError("INVALID_CODE", 200);
      }

      const sessionToken = createSessionToken();
      const tokenHash = hashToken(sessionToken);
      const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

      const session = await db.staffSession.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      await db.staffOtpToken.delete({ where: { id: otpToken.id } }).catch(() => {});

      const payload = createSignedPayload({
        userId: user.id,
        role: user.role as AdminSession["role"],
        sessionId: session.id,
      });

      return setSessionCookie(payload);
    } catch (dbError) {
      if (email === getMockOwnerEmail()) {
        const payload = createSignedPayload({
          userId: "mock-owner",
          role: "OWNER",
        });
        return setSessionCookie(payload);
      }
      console.error("[admin auth] DB error on verify:", dbError);
      return apiError("UNAVAILABLE", 503);
    }
  } catch {
    return apiError("INVALID_REQUEST", 400);
  }
}
