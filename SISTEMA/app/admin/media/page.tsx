import { Container, Section, Text } from "@/components/ui";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";
import { databaseConfigured } from "@/utils/safeEnv";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  return (
    <Section background="stone" spacing="default">
      <Container>
        {!databaseConfigured() ? (
          <Text variant="body" muted>
            Database not configured. Set DATABASE_URL to manage media.
          </Text>
        ) : (
          <MediaLibrary />
        )}
      </Container>
    </Section>
  );
}
