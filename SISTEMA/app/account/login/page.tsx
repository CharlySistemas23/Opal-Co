import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCustomerSessionFromCookie } from "@/lib/customer-auth";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your OPAL & CO account.",
};

export default async function AccountLoginPage() {
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie");
  const session = getCustomerSessionFromCookie(cookieHeader);
  if (session) {
    redirect("/account");
  }

  redirect("/sign-in");
}
