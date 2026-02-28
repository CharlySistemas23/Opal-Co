import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Container, Heading, Text } from "@/components/ui";
import { getCustomerSessionFromCookie } from "@/lib/customer-auth";
import { OtpLoginForm } from "./OtpLoginForm";

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

  return (
    <section className="py-24 md:py-32 bg-stone">
      <Container className="text-center">
        <Heading
          as="h1"
          level={1}
          className="text-charcoal mb-6 tracking-[0.15em] uppercase"
        >
          Sign in
        </Heading>
        <Text variant="large" muted className="max-w-xl mx-auto">
          Enter your email to receive a one-time login code. No password
          required.
        </Text>
      </Container>
      <div className="py-16">
        <Container className="max-w-xl">
          <OtpLoginForm />
        </Container>
      </div>
    </section>
  );
}
