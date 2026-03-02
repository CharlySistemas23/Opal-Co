import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heading, Text } from "@/components/ui";
import { getCustomerSessionFromCookie } from "@/lib/customer-auth";
import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";

export const metadata = {
  title: "Order History",
  description: "View your order history at OPAL & CO.",
};

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

function formatStatus(status: string): string {
  const map: Record<string, string> = {
    PENDING_PAYMENT: "Pending payment",
    PAID: "Paid",
    PREPARING: "Preparing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
  };
  return map[status] ?? status;
}

export default async function AccountOrdersPage() {
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie");
  const session = getCustomerSessionFromCookie(cookieHeader);
  if (!session) {
    redirect("/account/login");
  }

  let orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalCents: number;
    createdAt: Date;
    items: Array<{ title: string; sku: string; quantity: number; priceCents: number }>;
  }> = [];

  if (databaseConfigured() && db) {
    const rows = await db.order.findMany({
      where: { customerId: session.customerId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
    orders = rows.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      totalCents: o.totalCents,
      createdAt: o.createdAt,
      items: o.items.map((i) => ({
        title: i.title,
        sku: i.sku,
        quantity: i.quantity,
        priceCents: i.priceCents,
      })),
    }));
  }

  return (
    <section className="py-16 md:py-24">
      <Link
        href="/account"
        className="inline-block font-sans text-xs uppercase tracking-[0.2em] text-charcoal/70 hover:text-charcoal mb-8 transition-colors"
      >
        Back to account
      </Link>
      <Heading as="h1" level={2} className="text-charcoal mb-8">
        Order history
      </Heading>
      {orders.length === 0 ? (
        <Text variant="body" muted>
          You have no orders yet.
        </Text>
      ) : (
        <ul className="space-y-8">
          {orders.map((order) => (
            <li
              key={order.id}
              className="border border-charcoal/10 p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <Text variant="body" className="font-medium">
                    {order.orderNumber}
                  </Text>
                  <Text variant="body" muted className="text-sm">
                    {formatDate(order.createdAt.toISOString())} ·{" "}
                    {formatStatus(order.status)}
                  </Text>
                </div>
                <Text variant="body">{formatPrice(order.totalCents)}</Text>
              </div>
              <ul className="space-y-1">
                {order.items.map((item, idx) => (
                  <li key={idx} className="font-sans text-sm text-charcoal/80">
                    {item.title} × {item.quantity}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
