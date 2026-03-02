import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { databaseConfigured } from "@/utils/safeEnv";

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const session = getSessionFromCookie(cookieHeader);

  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  if (
    session.role !== "OWNER" &&
    session.role !== "ADMIN" &&
    session.role !== "MANAGER"
  ) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const headers = ["email", "status", "tags", "source", "createdAt"];
  let rows: string[][] = [headers];

  if (databaseConfigured() && db) {
    const subscribers = await db.subscriber.findMany({
      orderBy: { createdAt: "desc" },
    });
    rows = [
      headers,
      ...subscribers.map((s) => [
        s.email,
        s.status,
        s.tags.join(";"),
        s.source ?? "",
        s.createdAt.toISOString(),
      ]),
    ];
  }

  const csv = rows.map((row) => row.map(escapeCsvField).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="subscribers.csv"',
    },
  });
}
