"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";
import {
  canAccessUsers,
  getSessionFromCookie,
  STAFF_ROLES,
  type StaffRole,
} from "@/lib/admin-auth";

async function getActorSession() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  return getSessionFromCookie(cookieHeader);
}

function audit(
  actorUserId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  meta: Record<string, unknown>
) {
  if (!db) return Promise.resolve();
  return db.staffAuditLog.create({
    data: {
      actorUserId,
      action,
      entityType,
      entityId,
      metaJson: meta as object,
    },
  });
}

export async function getStaffUsers(): Promise<
  { ok: true; users: Array<{ id: string; email: string; name: string | null; role: string; status: string; createdAt: Date }> } | { ok: false; error: string }
> {
  const session = await getActorSession();
  if (!session || !canAccessUsers(session.role)) {
    return { ok: false, error: "FORBIDDEN" };
  }
  if (!databaseConfigured() || !db) {
    return { ok: true, users: [] };
  }
  try {
    const users = await db.staffUser.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
    });
    return {
      ok: true,
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
      })),
    };
  } catch {
    return { ok: false, error: "Database not configured or unavailable. Set DATABASE_URL and run migrations." };
  }
}

export async function createStaffUser(
  email: string,
  name: string | null,
  role: StaffRole
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getActorSession();
  if (!session) return { ok: false, error: "UNAUTHORIZED" };
  if (session.role !== "OWNER") {
    return { ok: false, error: "Only the owner can create staff users." };
  }
  if (!databaseConfigured() || !db) {
    return { ok: false, error: "Database not configured." };
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { ok: false, error: "Invalid email." };
  }
  if (!STAFF_ROLES.includes(role)) return { ok: false, error: "Invalid role." };

  try {
    const user = await db.staffUser.create({
      data: {
        email: normalizedEmail,
        name: name?.trim() || null,
        role,
        status: "ACTIVE",
      },
    });
    await audit(session.userId, "USER_CREATED", "StaffUser", user.id, {
      email: user.email,
      role: user.role,
    });
    return { ok: true };
  } catch (e: unknown) {
    const msg = e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002"
      ? "A user with this email already exists."
      : "Failed to create user.";
    return { ok: false, error: msg };
  }
}

export async function updateStaffUser(
  userId: string,
  updates: { role?: StaffRole; status?: "ACTIVE" | "SUSPENDED" }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getActorSession();
  if (!session || !canAccessUsers(session.role)) {
    return { ok: false, error: "FORBIDDEN" };
  }
  if (!databaseConfigured() || !db) {
    return { ok: false, error: "Database not configured." };
  }

  if (updates.role && !STAFF_ROLES.includes(updates.role)) {
    return { ok: false, error: "Invalid role." };
  }

  const existing = await db.staffUser.findUnique({ where: { id: userId } });
  if (!existing) return { ok: false, error: "User not found." };

  if (existing.role === "OWNER" && session.role !== "OWNER") {
    return { ok: false, error: "Only the owner can change the owner account." };
  }

  try {
    const user = await db.staffUser.update({
      where: { id: userId },
      data: {
        ...(updates.role != null && { role: updates.role }),
        ...(updates.status != null && { status: updates.status }),
      },
    });
    const action = updates.status === "SUSPENDED" ? "USER_SUSPENDED" : "USER_UPDATED";
    await audit(session.userId, action, "StaffUser", user.id, {
      email: user.email,
      role: user.role,
      status: user.status,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to update user." };
  }
}

