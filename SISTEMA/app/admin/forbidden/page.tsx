import Link from "next/link";
import { Container, Section, Heading, Text, Button } from "@/components/ui";

export default function AdminForbiddenPage() {
  return (
    <Section background="stone" spacing="default">
      <Container className="max-w-md">
        <Heading as="h1" level={2} className="mb-4 text-charcoal">
          Access denied
        </Heading>
        <Text variant="body" muted className="mb-8">
          You don’t have permission to view this page. Contact an owner or
          admin if you need access.
        </Text>
        <Link href="/admin">
          <Button variant="subtle">Back to dashboard</Button>
        </Link>
      </Container>
    </Section>
  );
}
