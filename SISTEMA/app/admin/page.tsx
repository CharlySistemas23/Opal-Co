import { Container, Section, Heading, Text } from "@/components/ui";
import { databaseConfigured } from "@/utils/safeEnv";

export default function AdminPage() {
  const dbConfigured = databaseConfigured();

  return (
    <Section background="stone" spacing="default">
      <Container>
        {!dbConfigured ? (
          <div
            className="rounded border border-amber-500/50 bg-amber-50 px-6 py-4 text-amber-900"
            role="alert"
          >
            <Heading as="h2" level={4} className="mb-2 text-amber-900">
              Database not configured
            </Heading>
            <Text variant="body" muted className="text-amber-800">
              Set DATABASE_URL in your environment to use the admin. The site
              runs in mock mode without it.
            </Text>
          </div>
        ) : (
          <div>
            <Heading as="h2" level={4} className="mb-4 text-charcoal">
              Dashboard
            </Heading>
            <Text variant="body" muted>
              Manage pages, blocks, media, products, inventory, orders,
              subscribers, and users from the sidebar.
            </Text>
          </div>
        )}
      </Container>
    </Section>
  );
}
