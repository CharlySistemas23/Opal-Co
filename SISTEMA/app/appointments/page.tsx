import { Container, Heading, Text } from "@/components/ui";
import { AppointmentForm } from "./AppointmentForm";

export const metadata = {
  title: "Appointments",
  description: "Book a private viewing or consultation at OPAL & CO.",
};

export default function AppointmentsPage() {
  return (
    <div className="min-h-screen py-20 md:py-30">
      <section className="py-24 md:py-32 bg-stone">
        <Container className="text-center">
          <Heading as="h1" level={1} className="text-charcoal mb-6 tracking-[0.15em] uppercase">
            Appointments
          </Heading>
          <Text variant="large" muted className="max-w-xl mx-auto">
            Book a private viewing or consultation. We respond within twenty-four hours.
          </Text>
        </Container>
      </section>
      <div className="py-20 md:py-30">
        <Container className="max-w-xl">
          <AppointmentForm />
        </Container>
      </div>
    </div>
  );
}
