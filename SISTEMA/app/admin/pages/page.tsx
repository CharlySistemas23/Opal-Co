import Link from "next/link";

export const dynamic = "force-dynamic";
import { Container, Section, Heading, Text } from "@/components/ui";
import { getPages } from "@/lib/data/pages";
import { databaseConfigured } from "@/utils/safeEnv";

export default async function AdminPagesListPage() {
  const pages = databaseConfigured() ? await getPages() : [];

  return (
    <Section background="stone" spacing="default">
      <Container>
        <Heading as="h1" level={2} className="text-charcoal mb-8">
          Pages
        </Heading>

        {!databaseConfigured() ? (
          <Text variant="body" muted>
            Database not configured. Set DATABASE_URL to manage pages.
          </Text>
        ) : pages.length === 0 ? (
          <Text variant="body" muted>
            No pages found. Run the seed to create default pages.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-charcoal/20">
                  <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">
                    Slug
                  </th>
                  <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">
                    Title
                  </th>
                  <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">
                    Published
                  </th>
                  <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">
                    Updated
                  </th>
                  <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id} className="border-b border-charcoal/10 hover:bg-charcoal/5">
                    <td className="py-3 px-4 font-mono text-sm">{p.slug}</td>
                    <td className="py-3 px-4">{p.title}</td>
                    <td className="py-3 px-4">{p.published ? "Yes" : "No"}</td>
                    <td className="py-3 px-4 text-charcoal/70 text-sm">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/pages/${p.slug}`}
                        className="font-sans text-sm uppercase tracking-wider text-charcoal hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>
    </Section>
  );
}
