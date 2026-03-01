import Link from "next/link";
import { Container, Heading, Text } from "@/components/ui";
import { SignInForm } from "./SignInForm";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your OPAL & CO account.",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen">
      <section className="py-24 md:py-32 bg-stone">
        <Container className="text-center">
          <Heading as="h1" level={1} className="text-charcoal mb-6 tracking-[0.15em] uppercase">
            Sign in
          </Heading>
          <Text variant="large" muted className="max-w-xl mx-auto">
            Access your account to manage your preferences and orders.
          </Text>
        </Container>
      </section>
      <div className="py-20 md:py-30">
        <Container className="max-w-xl">
          <SignInForm />
          <p className="mt-8 font-sans text-sm text-charcoal/70 text-center">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="uppercase tracking-[0.15em] text-charcoal hover:text-champagne transition-colors duration-fast underline underline-offset-2">
              Regístrate
            </Link>
          </p>
        </Container>
      </div>
    </div>
  );
}
