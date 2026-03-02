import { apiError, apiSuccess } from "@/lib/apiResponse";
import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";
import { hashPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return apiError("INVALID_EMAIL", 400);
    }
    if (!password || password.length < 8) {
      return apiError("PASSWORD_TOO_SHORT", 400);
    }

    if (!databaseConfigured() || !db) {
      return apiError("UNAVAILABLE", 503);
    }

    const existing = await db.customer.findUnique({ where: { email } });
    if (existing) {
      return apiError("EMAIL_TAKEN", 400);
    }

    const passwordHash = hashPassword(password);
    await db.customer.create({
      data: {
        email,
        name: name || null,
        passwordHash,
        status: "ACTIVE",
      },
    });

    return apiSuccess({ ok: true });
  } catch {
    return apiError("INVALID_REQUEST", 400);
  }
}
