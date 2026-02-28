import { NextResponse } from "next/server";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";
import {
  createCustomerSignedPayload,
  createCustomerSessionToken,
  CUSTOMER_SESSION_COOKIE_NAME,
  CUSTOMER_SESSION_MAX_AGE_SECONDS,
  hashCustomerToken,
  verifyCustomerOtpHash,
} from "@/lib/customer-auth";
import { checkVerifyCode } from "@/lib/rateLimit";

function setSessionCookie(sessionPayload: string): NextResponse {
  const res = apiSuccess({ ok: true });
  const isProd = process.env.NODE_ENV === "production";
  res.cookies.set(CUSTOMER_SESSION_COOKIE_NAME, sessionPayload, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: CUSTOMER_SESSION_MAX_AGE_SECONDS,
  });
  return res;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const code =
      typeof body?.code === "string"
        ? body.code.trim().replace(/\s/g, "")
        : "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return apiError("INVALID_EMAIL", 400);
    }
    if (!code || !/^\d{6}$/.test(code)) {
      return apiError("INVALID_CODE", 400);
    }

    if (!checkVerifyCode(email)) {
      return apiError("RATE_LIMITED", 429);
    }

    if (!databaseConfigured()) {
      return apiError("INVALID_CODE", 200);
    }

    if (!db) return apiError("INVALID_CODE", 200);

    const customer = await db.customer.findUnique({
      where: { email },
    });

    if (!customer || customer.status !== "ACTIVE") {
      return apiError("INVALID_CODE", 200);
    }

    const tokens = await db.customerOtpToken.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    const otpToken = tokens[0];
    if (!otpToken || otpToken.expiresAt < new Date() || otpToken.attempts >= 5) {
      return apiError("INVALID_CODE", 200);
    }

    if (!verifyCustomerOtpHash(code, otpToken.codeHash)) {
      await db.customerOtpToken.update({
        where: { id: otpToken.id },
        data: { attempts: otpToken.attempts + 1 },
      });
      return apiError("INVALID_CODE", 200);
    }

    const sessionToken = createCustomerSessionToken();
    const tokenHash = hashCustomerToken(sessionToken);
    const expiresAt = new Date(
      Date.now() + CUSTOMER_SESSION_MAX_AGE_SECONDS * 1000
    );

    await db.customerSession.create({
      data: {
        customerId: customer.id,
        tokenHash,
        expiresAt,
      },
    });

    await db.customerOtpToken
      .delete({ where: { id: otpToken.id } })
      .catch(() => {});

    const payload = createCustomerSignedPayload({
      customerId: customer.id,
      email: customer.email,
    });

    return setSessionCookie(payload);
  } catch {
    return apiError("INVALID_REQUEST", 400);
  }
}
