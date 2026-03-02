"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container, Section, Heading, Text } from "@/components/ui";

interface LegalPage {
  id: string;
  slug: string;
  title: string;
  content: string;
}

const LEGAL_SLUGS = ["privacy", "terms", "returns", "cookies"];

export default function AdminLegalPage() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/legal", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setPages(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const pageBySlug = Object.fromEntries(pages.map((p) => [p.slug, p]));

  return (
    <Section background="stone" spacing="default">
      <Container>
        <Heading as="h1" level={2} className="text-charcoal mb-8">
          Legal pages
        </Heading>
        <Text variant="body" muted className="mb-8">
          Edit the content of each legal page. These are editable from the admin.
        </Text>

        {loading ? (
          <Text variant="body" muted>Loading…</Text>
        ) : (
          <div className="grid gap-4">
            {LEGAL_SLUGS.map((slug) => {
              const page = pageBySlug[slug];
              const title = page?.title ?? slug.charAt(0).toUpperCase() + slug.slice(1);
              return (
                <Link
                  key={slug}
                  href={`/admin/legal/${slug}`}
                  className="block p-4 border border-charcoal/10 hover:border-charcoal/20 transition-colors rounded"
                >
                  <span className="font-sans text-sm uppercase tracking-wider text-charcoal">
                    {title}
                  </span>
                  <span className="text-charcoal/60 ml-2">/legal/{slug}</span>
                </Link>
              );
            })}
          </div>
        )}
      </Container>
    </Section>
  );
}
