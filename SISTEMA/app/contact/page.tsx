import { Container, Heading, Text } from "@/components/ui";
import { ContactForm } from "./ContactForm";

export const metadata = {
  title: "Contact",
  description: "For inquiries, appointments, and assistance.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <section className="py-24 md:py-32 bg-stone">
        <Container className="text-center">
          <Heading as="h1" level={1} className="text-charcoal mb-6 tracking-[0.15em] uppercase">
            Contact
          </Heading>
          <Text variant="large" muted className="max-w-xl mx-auto mb-12">
            For inquiries, appointments, and assistance. We respond within twenty-four hours.
          </Text>
          <div className="flex flex-col sm:flex-row justify-center gap-8 sm:gap-16 text-charcoal/80 font-sans text-sm">
            <span>inquiries@opal-and-co.com</span>
            <span>By appointment only</span>
          </div>
        </Container>
      </section>
      <div className="py-20 md:py-30">
        <Container className="max-w-xl">
          <ContactForm />
        </Container>
      </div>
    </div>
  );
}
