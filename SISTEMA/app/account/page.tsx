import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heading, Text } from "@/components/ui";
import { LogoutButton } from "@/components/account/LogoutButton";
import { getCustomerSessionFromCookie } from "@/lib/customer-auth";

export const metadata = {
  title: "Account",
  description: "Manage your OPAL & CO account.",
};

export default async function AccountPage() {
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie");
  const session = getCustomerSessionFromCookie(cookieHeader);
  if (!session) {
    redirect("/account/login");
  }

  return (
    <section className="py-16 md:py-24">
      <Heading as="h1" level={2} className="text-charcoal mb-4">
        Welcome
      </Heading>
      <Text variant="body" muted className="mb-8">
        {session.email}
      </Text>
      <nav className="space-y-4">
        <Link
          href="/account/orders"
          className="flex items-center justify-between font-sans text-sm uppercase tracking-[0.15em] text-charcoal hover:text-champagne transition-colors duration-fast py-4 border-b border-charcoal/10 group"
        >
          Order history
          <span className="group-hover:translate-x-1 transition-transform" aria-hidden>›</span>
        </Link>
        <Link
          href="/account/addresses"
          className="flex items-center justify-between font-sans text-sm uppercase tracking-[0.15em] text-charcoal hover:text-champagne transition-colors duration-fast py-4 border-b border-charcoal/10 group"
        >
          Addresses
          <span className="group-hover:translate-x-1 transition-transform" aria-hidden>›</span>
        </Link>
      </nav>
      <div className="mt-12">
        <LogoutButton />
      </div>
    </section>
  );
}
