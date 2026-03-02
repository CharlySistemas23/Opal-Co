"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Text } from "@/components/ui";
import { updateStaffUser } from "./actions";

type StaffRole = "OWNER" | "ADMIN" | "MANAGER" | "STAFF" | "VIEWER";

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  createdAt: Date;
}

export function UsersTable({
  users,
  currentUserRole,
  roles,
}: {
  users: UserRow[];
  currentUserRole: string | null;
  roles: readonly StaffRole[];
}) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const canEdit = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  async function handleRoleChange(userId: string, role: StaffRole) {
    setUpdatingId(userId);
    try {
      const result = await updateStaffUser(userId, { role });
      if (result.ok) router.refresh();
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleStatusChange(userId: string, status: "ACTIVE" | "SUSPENDED") {
    setUpdatingId(userId);
    try {
      const result = await updateStaffUser(userId, { status });
      if (result.ok) router.refresh();
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="overflow-x-auto border border-charcoal/10 rounded">
      <table className="w-full font-sans text-sm">
        <thead>
          <tr className="border-b border-charcoal/10 bg-charcoal/5">
            <th className="text-left py-3 px-4 text-charcoal font-medium">Email</th>
            <th className="text-left py-3 px-4 text-charcoal font-medium">Name</th>
            <th className="text-left py-3 px-4 text-charcoal font-medium">Role</th>
            <th className="text-left py-3 px-4 text-charcoal font-medium">Status</th>
            <th className="text-left py-3 px-4 text-charcoal font-medium">Created</th>
            {canEdit && <th className="text-right py-3 px-4 text-charcoal font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-charcoal/5 hover:bg-charcoal/5">
              <td className="py-3 px-4 text-charcoal">{user.email}</td>
              <td className="py-3 px-4 text-charcoal/80">{user.name ?? "—"}</td>
              <td className="py-3 px-4 text-charcoal/80">{user.role}</td>
              <td className="py-3 px-4 text-charcoal/80">{user.status}</td>
              <td className="py-3 px-4 text-charcoal/70">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              {canEdit && (
                <td className="py-3 px-4 text-right">
                  {user.role === "OWNER" && currentUserRole !== "OWNER" ? (
                    <Text variant="small" muted>—</Text>
                  ) : (
                    <div className="flex flex-wrap gap-2 justify-end">
                      {user.role !== "OWNER" && (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as StaffRole)}
                          disabled={updatingId === user.id}
                          className="px-2 py-1 border border-charcoal/20 bg-ivory text-charcoal text-xs focus:outline-none"
                        >
                          {roles.filter((r) => r !== "OWNER").map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      )}
                      {user.role !== "OWNER" && (
                        user.status === "ACTIVE" ? (
                          <Button
                            type="button"
                            variant="subtle"
                            className="!py-1 !px-2 !text-xs"
                            disabled={updatingId === user.id}
                            onClick={() => handleStatusChange(user.id, "SUSPENDED")}
                          >
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="subtle"
                            className="!py-1 !px-2 !text-xs"
                            disabled={updatingId === user.id}
                            onClick={() => handleStatusChange(user.id, "ACTIVE")}
                          >
                            Reactivate
                          </Button>
                        )
                      )}
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
