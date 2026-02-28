import { randomBytes } from "crypto";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { db } from "@/lib/db";
import {
  databaseConfigured,
  isPostmarkConfigured,
  isResendConfigured,
  safeEnv,
} from "@/utils/safeEnv";
import { hashSubscriberToken } from "@/lib/subscriber-verify";
import { sendWithTemplate } from "@/lib/email/provider";

const VERIFY_EXPIRY_HOURS = 24;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const source = typeof body?.source === "string" ? body.source.trim() : null;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return apiError("INVALID_EMAIL", 400);
    }

    if (!databaseConfigured()) {
      return apiSuccess({ ok: true });
    }

    if (!db) return apiSuccess({ ok: true });

    const existing = await db.subscriber.findUnique({
      where: { email },
    });

    if (existing && existing.status === "SUBSCRIBED") {
      return apiSuccess({ ok: true });
    }

    const plainToken = randomBytes(32).toString("hex");
    const verifyTokenHash = hashSubscriberToken(plainToken);
    const verifyExpiresAt = new Date(
      Date.now() + VERIFY_EXPIRY_HOURS * 60 * 60 * 1000
    );
    const consentAt = new Date();

    await db.subscriber.upsert({
      where: { email },
      create: {
        email,
        status: "PENDING",
        source,
        tags: [],
        verifyTokenHash,
        verifyExpiresAt,
        consentAt,
      },
      update: {
        status: "PENDING",
        source: source ?? undefined,
        verifyTokenHash,
        verifyExpiresAt,
        consentAt,
      },
    });

    if (!isPostmarkConfigured() && !isResendConfigured()) {
      return apiError("EMAIL_NOT_CONFIGURED", 503);
    }

    const siteUrl = safeEnv("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000";
    const confirmUrl = `${siteUrl}/subscribe/confirm?token=${plainToken}`;

    const result = await sendWithTemplate({
      to: email,
      template: "subscribe_confirm",
      variables: { confirm_url: confirmUrl },
    });

    if (!result.ok) {
      console.error("[subscribe] Email send failed:", result.error);
      return apiError("EMAIL_FAILED", 500);
    }

    return apiSuccess({ ok: true });
  } catch {
    return apiError("INVALID_REQUEST", 400);
  }
}
