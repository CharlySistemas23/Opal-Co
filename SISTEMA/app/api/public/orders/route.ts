import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { getCustomerSessionFromCookie } from "@/lib/customer-auth";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const session = getCustomerSessionFromCookie(cookieHeader);
  if (!session) {
    return apiError("UNAUTHORIZED", 401);
  }

  if (!databaseConfigured() || !db) {
    return apiError("UNAVAILABLE", 503);
  }

  const orders = await db.order.findMany({
    where: { customerId: session.customerId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return apiSuccess({
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      totalCents: o.totalCents,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((i) => ({
        title: i.title,
        sku: i.sku,
        quantity: i.quantity,
        priceCents: i.priceCents,
      })),
    })),
  });
}
