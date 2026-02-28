import { notFound } from "next/navigation";
import { Container, Section, Heading } from "@/components/ui";
import { getCollectionById } from "@/lib/data/collections";
import { databaseConfigured } from "@/utils/safeEnv";
import { CollectionEditClient } from "./CollectionEditClient";

export const dynamic = "force-dynamic";

export default async function AdminCollectionEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!databaseConfigured()) {
    return (
      <Section background="stone" spacing="default">
        <Container>
          <Heading as="h1" level={2} className="text-charcoal">
            Edit collection
          </Heading>
          <p className="mt-4 text-charcoal/70">Database not configured.</p>
        </Container>
      </Section>
    );
  }

  const collection = await getCollectionById(id);
  if (!collection) notFound();

  return (
    <Section background="stone" spacing="default">
      <Container>
        <CollectionEditClient collection={collection} />
      </Container>
    </Section>
  );
}
