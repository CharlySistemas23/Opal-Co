import { Container, Section, Heading, Text } from "@/components/ui";
import { databaseConfigured } from "@/utils/safeEnv";
import { InventoryClient } from "./InventoryClient";
import { getBranches, getStockLevels } from "@/lib/data/inventory";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  if (!databaseConfigured()) {
    return (
      <Section background="stone" spacing="default">
        <Container>
          <Heading as="h1" level={2} className="text-charcoal">
            Inventory
          </Heading>
          <Text variant="body" muted className="mt-4">
            Database not configured.
          </Text>
        </Container>
      </Section>
    );
  }

  const [branches, stockLevels] = await Promise.all([
    getBranches(),
    getStockLevels(),
  ]);

  return (
    <Section background="stone" spacing="default">
      <Container>
        <Heading as="h1" level={2} className="text-charcoal mb-8">
          Inventory
        </Heading>
        <InventoryClient branches={branches} stockLevels={stockLevels} />
      </Container>
    </Section>
  );
}
