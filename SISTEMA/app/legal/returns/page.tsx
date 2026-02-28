import { Container, Heading, Text } from "@/components/ui";

export const metadata = {
  title: "Returns & Exchanges",
  description: "OPAL & CO returns and exchanges policy.",
};

export default function ReturnsPage() {
  return (
    <div className="min-h-screen py-20 md:py-30">
      <Container className="max-w-2xl">
        <Heading as="h1" level={2} className="text-charcoal mb-12">
          Returns & Exchanges
        </Heading>
        <Text variant="body" muted className="space-y-6">
          <p>We accept returns within 30 days of delivery for unworn pieces in original condition. Please contact us to initiate a return. Custom or bespoke pieces may not be eligible.</p>
          <p>For questions, contact us at inquiries@opal-and-co.com.</p>
        </Text>
      </Container>
    </div>
  );
}
