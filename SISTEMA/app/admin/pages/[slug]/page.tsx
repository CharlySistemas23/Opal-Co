import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { Container, Section, Heading } from "@/components/ui";
import { getPageBySlug } from "@/lib/data/pages";
import { databaseConfigured } from "@/utils/safeEnv";
import { PageEditorClient } from "./PageEditorClient";

export default async function AdminPageEditorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!databaseConfigured()) {
    return (
      <Section background="stone" spacing="default">
        <Container>
          <Heading as="h1" level={2} className="text-charcoal">
            Edit Page
          </Heading>
          <p className="mt-4 text-charcoal/70">Database not configured.</p>
        </Container>
      </Section>
    );
  }

  const page = await getPageBySlug(slug);
  if (!page) notFound();

  return (
    <Section background="stone" spacing="default">
      <Container>
        <PageEditorClient page={page} />
      </Container>
    </Section>
  );
}
