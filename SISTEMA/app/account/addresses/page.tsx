import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heading, Text } from "@/components/ui";
import { getCustomerSessionFromCookie } from "@/lib/customer-auth";

export const metadata = {
  title: "Addresses",
  description: "Manage your addresses at OPAL & CO.",
};

export default async function AccountAddressesPage() {
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie");
  const session = getCustomerSessionFromCookie(cookieHeader);
  if (!session) {
    redirect("/account/login");
  }

  return (
    <section className="py-16 md:py-24">
      <Link
        href="/account"
        className="inline-block font-sans text-xs uppercase tracking-[0.2em] text-charcoal/70 hover:text-charcoal mb-8 transition-colors"
      >
        Back to account
      </Link>
      <Heading as="h1" level={2} className="text-charcoal mb-4">
        Addresses
      </Heading>
      <Text variant="body" muted>
        Address management is coming soon.
      </Text>
    </section>
  );
}
