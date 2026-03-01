import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Container, Section, Heading, Text } from "@/components/ui";
import { getSessionFromCookie } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";

export default async function AdminSubscribersPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const session = getSessionFromCookie(cookieHeader);

  if (!session) {
    redirect("/admin/login");
  }

  if (
    session.role !== "OWNER" &&
    session.role !== "ADMIN" &&
    session.role !== "MANAGER"
  ) {
    redirect("/admin/forbidden");
  }

  let subscribers: Array<{
    id: string;
    email: string;
    status: string;
    tags: string[];
    source: string | null;
    createdAt: Date;
  }> = [];

  if (databaseConfigured() && db) {
    const rows = await db.subscriber.findMany({
      orderBy: { createdAt: "desc" },
    });
    subscribers = rows.map((s) => ({
      id: s.id,
      email: s.email,
      status: s.status,
      tags: s.tags,
      source: s.source,
      createdAt: s.createdAt,
    }));
  }

  return (
    <Section background="stone" spacing="default">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Heading as="h1" level={2} className="text-charcoal">
            Subscribers
          </Heading>
          <a
            href="/api/admin/subscribers/export"
            className="inline-flex items-center font-sans text-sm uppercase tracking-[0.15em] px-4 py-2 border border-charcoal/20 text-charcoal hover:bg-charcoal/5 transition-colors"
          >
            Export CSV
          </a>
        </div>

        {!databaseConfigured() ? (
          <Text variant="body" muted>
            Database is not configured. Subscribers will appear here when configured.
          </Text>
        ) : subscribers.length === 0 ? (
          <Text variant="body" muted>
            No subscribers yet.
          </Text>
        ) : (
          <div className="overflow-x-auto border border-charcoal/10 rounded">
            <table className="w-full font-sans text-sm">
              <thead>
                <tr className="border-b border-charcoal/10 bg-charcoal/5">
                  <th className="text-left py-3 px-4 text-charcoal font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-charcoal font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-charcoal font-medium">Tags</th>
                  <th className="text-left py-3 px-4 text-charcoal font-medium">Source</th>
                  <th className="text-left py-3 px-4 text-charcoal font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="border-b border-charcoal/5 hover:bg-charcoal/5">
                    <td className="py-3 px-4 text-charcoal">{sub.email}</td>
                    <td className="py-3 px-4 text-charcoal/80">{sub.status}</td>
                    <td className="py-3 px-4 text-charcoal/80">
                      {sub.tags.length > 0 ? (
                        <span className="inline-flex flex-wrap gap-1">
                          {sub.tags.map((t) => (
                            <span key={t} className="px-2 py-0.5 bg-charcoal/10 rounded text-xs">
                              {t}
                            </span>
                          ))}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-4 text-charcoal/70">{sub.source ?? "—"}</td>
                    <td className="py-3 px-4 text-charcoal/70">
                      {new Date(sub.createdAt).toLocaleDateString()}
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
