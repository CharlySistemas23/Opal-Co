import { Container, Section, Heading } from "@/components/ui";
import { NewProductForm } from "./NewProductForm";

export const dynamic = "force-dynamic";

export default function AdminNewProductPage() {
  return (
    <Section background="stone" spacing="default">
      <Container>
        <Heading as="h1" level={2} className="text-charcoal mb-8">
          New product
        </Heading>
        <NewProductForm />
      </Container>
    </Section>
  );
}
