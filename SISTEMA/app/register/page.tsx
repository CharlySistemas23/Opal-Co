import Link from "next/link";
import { Container, Heading, Text } from "@/components/ui";
import { RegisterForm } from "./RegisterForm";

export const metadata = {
  title: "Register",
  description: "Create your OPAL & CO account.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen">
      <section className="py-24 md:py-32 bg-stone">
        <Container className="text-center">
          <Heading as="h1" level={1} className="text-charcoal mb-6 tracking-[0.15em] uppercase">
            Register
          </Heading>
          <Text variant="large" muted className="max-w-xl mx-auto">
            Create your account to enjoy exclusive benefits, save your preferences, and track your orders.
          </Text>
        </Container>
      </section>
      <div className="py-20 md:py-30">
        <Container className="max-w-xl">
          <RegisterForm />
          <p className="mt-8 font-sans text-sm text-charcoal/70 text-center">
            ¿Ya tienes cuenta?{" "}
            <Link href="/sign-in" className="uppercase tracking-[0.15em] text-charcoal hover:text-champagne transition-colors duration-fast underline underline-offset-2">
              Iniciar sesión
            </Link>
          </p>
        </Container>
      </div>
    </div>
  );
}
