import { apiError, apiSuccess } from "@/lib/apiResponse";
import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";
import {
  generateCustomerOtpCode,
  hashCustomerToken,
} from "@/lib/customer-auth";
import { checkRequestCode } from "@/lib/rateLimit";
import { sendCustomerOtpEmail } from "@/lib/email";

const OTP_EXPIRY_MINUTES = 10;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return apiError("INVALID_EMAIL", 400);
    }

    if (!checkRequestCode(email)) {
      return apiError("RATE_LIMITED", 429);
    }

    if (!databaseConfigured()) {
      return apiSuccess({ ok: true });
    }

    if (!db) return apiSuccess({ ok: true });

    const customer = await db.customer.upsert({
      where: { email },
      create: { email, status: "ACTIVE" },
      update: {},
    });

    const code = generateCustomerOtpCode();
    const codeHash = hashCustomerToken(code);
    const expiresAt = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    );

    await db.customerOtpToken.create({
      data: {
        customerId: customer.id,
        codeHash,
        expiresAt,
      },
    });

    const result = await sendCustomerOtpEmail(email, code);
    if (!result.ok) {
      return apiError(result.error || "EMAIL_FAILED", 500);
    }

    return apiSuccess({ ok: true });
  } catch {
    return apiError("INVALID_REQUEST", 400);
  }
}
