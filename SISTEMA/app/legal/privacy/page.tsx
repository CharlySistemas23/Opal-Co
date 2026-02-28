import { Container, Heading, Text } from "@/components/ui";

export const metadata = {
  title: "Privacy Policy",
  description: "OPAL & CO privacy policy.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-20 md:py-30">
      <Container className="max-w-2xl">
        <Heading as="h1" level={2} className="text-charcoal mb-12">
          Privacy Policy
        </Heading>
        <Text variant="body" muted className="space-y-6">
          <p>We respect your privacy. Data collected through this site is used only to process inquiries, appointments, and orders and to improve our service. We do not sell your data to third parties.</p>
          <p>For questions, contact us at inquiries@opal-and-co.com.</p>
        </Text>
      </Container>
    </div>
  );
}
