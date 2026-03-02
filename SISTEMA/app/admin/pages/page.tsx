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
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Heading as="h1" level={2} className="text-charcoal">
            Pages
          </Heading>
          {databaseConfigured() && (
            <Link
              href="/admin/pages/new"
              className="font-sans text-sm uppercase tracking-[0.15em] px-4 py-2 border border-charcoal/20 rounded hover:bg-charcoal/5 transition-colors"
            >
              Create page
            </Link>
          )}
        </div>

        {!databaseConfigured() ? (
          <Text variant="body" muted>
            Database not configured. Set DATABASE_URL to manage pages.
          </Text>
        ) : (
          <>
            <Heading as="h2" level={4} className="text-charcoal mb-4">
              Páginas CMS
            </Heading>
            {pages.length === 0 ? (
              <Text variant="body" muted className="mb-8">
                No pages found. Run the seed to create default pages.
              </Text>
            ) : (
              <div className="overflow-x-auto mb-12">
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

            <Heading as="h2" level={4} className="text-charcoal mb-4">
              Otras secciones
            </Heading>
            <Text variant="body" muted className="mb-4">
              Estas rutas del sitio se editan desde otras áreas del admin.
            </Text>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-charcoal/20">
                    <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">
                      Ruta
                    </th>
                    <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">
                      Dónde editar
                    </th>
                    <th className="py-3 px-4 font-sans text-xs uppercase tracking-wider text-charcoal/70">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-charcoal/10 hover:bg-charcoal/5">
                    <td className="py-3 px-4 font-mono text-sm">/collections</td>
                    <td className="py-3 px-4 text-charcoal/80">Collections + Site Text (título/subtítulo)</td>
                    <td className="py-3 px-4">
                      <Link href="/admin/collections" className="font-sans text-sm uppercase tracking-wider text-charcoal hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                  <tr className="border-b border-charcoal/10 hover:bg-charcoal/5">
                    <td className="py-3 px-4 font-mono text-sm">/high-jewelry</td>
                    <td className="py-3 px-4 text-charcoal/80">Collections (high-jewelry) + Site Text (hero)</td>
                    <td className="py-3 px-4">
                      <Link href="/admin/collections" className="font-sans text-sm uppercase tracking-wider text-charcoal hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                  <tr className="border-b border-charcoal/10 hover:bg-charcoal/5">
                    <td className="py-3 px-4 font-mono text-sm">/legal/*</td>
                    <td className="py-3 px-4 text-charcoal/80">Legal pages</td>
                    <td className="py-3 px-4">
                      <Link href="/admin/legal" className="font-sans text-sm uppercase tracking-wider text-charcoal hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                  <tr className="border-b border-charcoal/10 hover:bg-charcoal/5">
                    <td className="py-3 px-4 font-mono text-sm">/stores</td>
                    <td className="py-3 px-4 text-charcoal/80">Stores</td>
                    <td className="py-3 px-4">
                      <Link href="/admin/stores" className="font-sans text-sm uppercase tracking-wider text-charcoal hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                  <tr className="border-b border-charcoal/10 hover:bg-charcoal/5">
                    <td className="py-3 px-4 font-mono text-sm">/journal</td>
                    <td className="py-3 px-4 text-charcoal/80">Sanity Studio (configurar NEXT_PUBLIC_SANITY_PROJECT_ID)</td>
                    <td className="py-3 px-4">
                      <Link href="/admin/journal" className="font-sans text-sm uppercase tracking-wider text-charcoal hover:underline">
                        Open
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </Container>
    </Section>
  );
}
