import { Container, Heading, Text } from "@/components/ui";

export const metadata = {
  title: "Cookie Policy",
  description: "OPAL & CO cookie policy.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen py-20 md:py-30">
      <Container className="max-w-2xl">
        <Heading as="h1" level={2} className="text-charcoal mb-12">
          Cookie Policy
        </Heading>
        <Text variant="body" muted className="space-y-6">
          <p>This site may use essential cookies for operation and analytics. You can manage preferences in your browser.</p>
          <p>For questions, contact us at inquiries@opal-and-co.com.</p>
        </Text>
      </Container>
    </div>
  );
}
