import { cookies } from "next/headers";
import { Container, Section, Heading, Text } from "@/components/ui";
import { getSessionFromCookie } from "@/lib/admin-auth";
import { STAFF_ROLES } from "@/lib/admin-auth";
import { getStaffUsers } from "./actions";
import { UsersTable } from "./UsersTable";
import { CreateUserForm } from "./CreateUserForm";

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const session = getSessionFromCookie(cookieHeader);
  const isOwner = session?.role === "OWNER";

  const result = await getStaffUsers();
  if (!result.ok) {
    return (
      <Section background="stone" spacing="default">
        <Container>
          <Text variant="body" muted>
            {result.error}
          </Text>
        </Container>
      </Section>
    );
  }

  return (
    <Section background="stone" spacing="default">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Heading as="h1" level={2} className="text-charcoal">
            Users
          </Heading>
          {isOwner && <CreateUserForm />}
        </div>

        {result.users.length === 0 ? (
          <Text variant="body" muted>
            No staff users yet. {isOwner ? "Create one above." : ""}
          </Text>
        ) : (
          <UsersTable
            users={result.users}
            currentUserRole={session?.role ?? null}
            roles={STAFF_ROLES}
          />
        )}
      </Container>
    </Section>
  );
}
