import { NextResponse } from "next/server";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";
import { verifyPassword } from "@/lib/password";
import {
  createCustomerSignedPayload,
  createCustomerSessionToken,
  CUSTOMER_SESSION_COOKIE_NAME,
  CUSTOMER_SESSION_MAX_AGE_SECONDS,
  hashCustomerToken,
} from "@/lib/customer-auth";

function setSessionCookie(
  sessionPayload: string
): NextResponse<unknown, { "Content-Type": string }> {
  const res = NextResponse.json({ success: true });
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
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return apiError("INVALID_EMAIL", 400);
    }
    if (!password) {
      return apiError("INVALID_PASSWORD", 400);
    }

    if (!databaseConfigured() || !db) {
      return apiError("UNAVAILABLE", 503);
    }

    const customer = await db.customer.findUnique({ where: { email } });
    if (!customer || customer.status !== "ACTIVE") {
      return apiError("INVALID_CREDENTIALS", 401);
    }

    if (!customer.passwordHash) {
      return apiError("PASSWORD_NOT_SET", 400);
    }

    if (!verifyPassword(password, customer.passwordHash)) {
      return apiError("INVALID_CREDENTIALS", 401);
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

    const payload = createCustomerSignedPayload({
      customerId: customer.id,
      email: customer.email,
    });

    return setSessionCookie(payload);
  } catch {
    return apiError("INVALID_REQUEST", 400);
  }
}
