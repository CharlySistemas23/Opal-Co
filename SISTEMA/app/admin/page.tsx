import Link from "next/link";
import { Container, Section, Heading, Text } from "@/components/ui";
import { databaseConfigured } from "@/utils/safeEnv";

const QUICK_LINKS = [
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/stores", label: "Stores" },
  { href: "/admin/legal", label: "Legal" },
  { href: "/admin/site-settings", label: "Site Text" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/journal", label: "Journal" },
];

export default function AdminPage() {
  const dbConfigured = databaseConfigured();

  return (
    <Section background="stone" spacing="default">
      <Container>
        {!dbConfigured ? (
          <div
            className="rounded border border-amber-500/50 bg-amber-50 px-6 py-4 text-amber-900"
            role="alert"
          >
            <Heading as="h2" level={4} className="mb-2 text-amber-900">
              Database not configured
            </Heading>
            <Text variant="body" muted className="text-amber-800">
              Set DATABASE_URL in your environment to use the admin. The site
              runs in mock mode without it.
            </Text>
          </div>
        ) : (
          <div>
            <Heading as="h2" level={4} className="mb-4 text-charcoal">
              Dashboard
            </Heading>
            <Text variant="body" muted className="mb-8">
              Manage content from the sidebar or use the quick links below.
            </Text>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {QUICK_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 border border-charcoal/10 rounded hover:border-charcoal/20 hover:bg-charcoal/5 transition-colors font-sans text-sm uppercase tracking-wider text-charcoal"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
