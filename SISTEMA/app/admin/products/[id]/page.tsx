import { notFound } from "next/navigation";
import { Container, Section, Heading } from "@/components/ui";
import { getProductById } from "@/lib/data/products";
import { databaseConfigured } from "@/utils/safeEnv";
import { ProductEditClient } from "./ProductEditClient";

export const dynamic = "force-dynamic";

export default async function AdminProductEditPage({
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
            Edit product
          </Heading>
          <p className="mt-4 text-charcoal/70">Database not configured.</p>
        </Container>
      </Section>
    );
  }

  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <Section background="stone" spacing="default">
      <Container>
        <ProductEditClient product={product} />
      </Container>
    </Section>
  );
}
