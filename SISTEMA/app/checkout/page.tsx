import { Container, Heading, Text } from "@/components/ui";
import { CheckoutForm } from "./CheckoutForm";

export const metadata = {
  title: "Checkout",
  description: "Complete your purchase.",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen py-20 md:py-30">
      <Container className="max-w-xl mx-auto">
        <Heading as="h1" level={2} className="text-charcoal mb-8">
          Checkout
        </Heading>
        <Text variant="body" muted className="mb-16">
          Secure payment. Private acquisition.
        </Text>
        <CheckoutForm />
      </Container>
    </div>
  );
}
