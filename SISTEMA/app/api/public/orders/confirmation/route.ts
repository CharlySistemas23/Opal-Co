import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  if (!sessionId || typeof sessionId !== "string") {
    return apiError("MISSING_SESSION_ID", 400);
  }

  if (!databaseConfigured() || !db) {
    return apiError("UNAVAILABLE", 503);
  }

  const payment = await db.payment.findFirst({
    where: { stripeCheckoutSessionId: sessionId },
    include: { order: true },
  });

  if (!payment?.order) {
    return apiError("NOT_FOUND", 404);
  }

  return apiSuccess({
    orderNumber: payment.order.orderNumber,
    email: payment.order.email,
  });
}
