import { apiError, apiSuccess } from "@/lib/apiResponse";
import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";
import {
  generateOtpCode,
  getMockOwnerEmail,
  hashToken,
} from "@/lib/admin-auth";
import { sendOtpEmail } from "@/lib/email";

const OTP_EXPIRY_MINUTES = 10;

export async function POST(request: Request) {
  try {
    let body: { email?: unknown };
    try {
      body = await request.json();
    } catch {
      return apiError("INVALID_BODY", 400);
    }
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return apiError("INVALID_EMAIL", 400);
    }

    if (!databaseConfigured()) {
      const mockOwner = getMockOwnerEmail();
      if (email !== mockOwner) {
        return apiError("USER_NOT_FOUND", 200);
      }
      const code = generateOtpCode();
      console.log("[admin auth] Mock OTP for", email, ":", code);
      return apiSuccess({ ok: true });
    }

    if (!db) return apiError("UNAVAILABLE", 503);

    try {
      const user = await db.staffUser.findUnique({
        where: { email },
      });

      if (!user || user.status !== "ACTIVE") {
        return apiSuccess({ ok: true });
      }

      const code = generateOtpCode();
      const codeHash = hashToken(code);
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      await db.staffOtpToken.create({
        data: {
          userId: user.id,
          codeHash,
          expiresAt,
        },
      });

      const result = await sendOtpEmail(email, code);
      if (!result.ok) {
        return apiError(result.error || "EMAIL_FAILED", 500);
      }

      return apiSuccess({ ok: true });
    } catch (dbError) {
      const mockOwner = getMockOwnerEmail();
      if (email === mockOwner) {
        const code = generateOtpCode();
        console.log("[admin auth] DB unavailable, mock OTP for", email, ":", code);
        return apiSuccess({ ok: true });
      }
      console.error("[admin auth] DB error:", dbError);
      return apiError("UNAVAILABLE", 503);
    }
  } catch {
    return apiError("INVALID_REQUEST", 400);
  }
}
