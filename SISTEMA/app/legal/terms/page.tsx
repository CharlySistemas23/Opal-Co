import { Container, Heading, Text } from "@/components/ui";

export const metadata = {
  title: "Terms of Service",
  description: "OPAL & CO terms of service.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-20 md:py-30">
      <Container className="max-w-2xl">
        <Heading as="h1" level={2} className="text-charcoal mb-12">
          Terms of Service
        </Heading>
        <Text variant="body" muted className="space-y-6">
          <p>By using this site you agree to these terms. All content and imagery are owned by OPAL & CO. Purchases are subject to our returns policy.</p>
          <p>For questions, contact us at inquiries@opal-and-co.com.</p>
        </Text>
      </Container>
    </div>
  );
}
