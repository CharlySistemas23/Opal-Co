import Link from "next/link";
import { Container, Section, Heading, Text } from "@/components/ui";
import { safeEnv } from "@/utils/safeEnv";

export const dynamic = "force-dynamic";

export default function AdminJournalPage() {
  const projectId = safeEnv("NEXT_PUBLIC_SANITY_PROJECT_ID") || "";
  const studioUrl = projectId
    ? `https://${projectId}.sanity.studio`
    : "https://www.sanity.io/manage";

  return (
    <Section background="stone" spacing="default">
      <Container>
        <Heading as="h1" level={2} className="text-charcoal mb-6">
          Journal
        </Heading>
        <Text variant="body" muted className="mb-6 max-w-xl">
          Journal entries are managed via Sanity CMS. Edit content, add new posts, and manage images in Sanity Studio.
        </Text>
        <Link
          href={studioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-8 py-4 font-sans text-sm uppercase tracking-[0.2em] bg-charcoal text-ivory hover:bg-charcoal/90 transition-all"
        >
          Open Sanity Studio
        </Link>
        {!projectId && (
          <Text variant="small" muted className="mt-4">
            Set NEXT_PUBLIC_SANITY_PROJECT_ID in your environment to link to your project&apos;s Studio.
          </Text>
        )}
      </Container>
    </Section>
  );
}
