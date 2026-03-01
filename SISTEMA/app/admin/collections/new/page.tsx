import { Container, Section, Heading } from "@/components/ui";
import { NewCollectionForm } from "./NewCollectionForm";

export const dynamic = "force-dynamic";

export default function AdminNewCollectionPage() {
  return (
    <Section background="stone" spacing="default">
      <Container>
        <Heading as="h1" level={2} className="text-charcoal mb-8">
          New collection
        </Heading>
        <NewCollectionForm />
      </Container>
    </Section>
  );
}
