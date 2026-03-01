"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { type StaffRole } from "@/lib/admin-auth";
import { createStaffUser } from "./actions";

export function CreateUserForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<StaffRole>("STAFF");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await createStaffUser(email, name || null, role);
      if (result.ok) {
        setOpen(false);
        setEmail("");
        setName("");
        setRole("STAFF");
        router.refresh();
      } else {
        setError(result.error);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" onClick={() => setOpen(true)}>
        Create user
      </Button>
    );
  }

  return (
    <div className="rounded border border-charcoal/20 bg-ivory p-6 max-w-md">
      <h2 className="font-sans text-sm uppercase tracking-[0.2em] text-charcoal mb-4">
        New staff user
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="font-sans text-sm text-charcoal/80" role="alert">
            {error}
          </p>
        )}
        <div>
          <label className="block font-sans text-xs uppercase tracking-[0.2em] text-charcoal mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-charcoal/20 bg-ivory font-sans text-charcoal text-sm focus:outline-none focus:border-charcoal/40"
          />
        </div>
        <div>
          <label className="block font-sans text-xs uppercase tracking-[0.2em] text-charcoal mb-1">
            Name (optional)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-charcoal/20 bg-ivory font-sans text-charcoal text-sm focus:outline-none focus:border-charcoal/40"
          />
        </div>
        <div>
          <label className="block font-sans text-xs uppercase tracking-[0.2em] text-charcoal mb-1">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as StaffRole)}
            className="w-full px-4 py-2 border border-charcoal/20 bg-ivory font-sans text-charcoal text-sm focus:outline-none focus:border-charcoal/40"
          >
            {(["ADMIN", "MANAGER", "STAFF", "VIEWER"] as const).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create"}
          </Button>
          <Button type="button" variant="subtle" onClick={() => { setOpen(false); setError(null); }}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
