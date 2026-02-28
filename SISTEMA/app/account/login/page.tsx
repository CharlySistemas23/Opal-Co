import Link from "next/link";
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
          <p className="mt-8 font-sans text-sm text-charcoal/70 text-center">
            ¿Prefieres usar email y contraseña?{" "}
            <Link href="/sign-in" className="uppercase tracking-[0.15em] text-charcoal hover:text-champagne transition-colors duration-fast underline underline-offset-2">
              Iniciar sesión
            </Link>
            {" · "}
            <Link href="/register" className="uppercase tracking-[0.15em] text-charcoal hover:text-champagne transition-colors duration-fast underline underline-offset-2">
              Crear cuenta
            </Link>
          </p>
        </Container>
      </div>
    </section>
  );
}
