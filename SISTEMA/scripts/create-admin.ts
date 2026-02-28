#!/usr/bin/env node
/**
 * Crea un usuario admin en la base de datos.
 * Uso: ADMIN_EMAIL=tu@email.com ADMIN_NAME="Tu Nombre" npx tsx scripts/create-admin.ts
 *
 * Variables:
 *   ADMIN_EMAIL (requerido) - Email del admin
 *   ADMIN_NAME (opcional)  - Nombre para mostrar
 *   ADMIN_ROLE (opcional)  - OWNER | ADMIN | MANAGER | STAFF | VIEWER (default: OWNER)
 */
import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function env(key: string): string {
  return (process.env[key] ?? "").trim();
}

async function main() {
  const email = env("ADMIN_EMAIL");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("❌ ADMIN_EMAIL es requerido y debe ser un email válido.");
    console.error("   Uso: ADMIN_EMAIL=tu@email.com ADMIN_NAME=\"Tu Nombre\" npx tsx scripts/create-admin.ts");
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL no está configurada.");
    process.exit(1);
  }

  const name = env("ADMIN_NAME") || undefined;
  const role = (env("ADMIN_ROLE") || "OWNER") as "OWNER" | "ADMIN" | "MANAGER" | "STAFF" | "VIEWER";
  const validRoles = ["OWNER", "ADMIN", "MANAGER", "STAFF", "VIEWER"];
  if (!validRoles.includes(role)) {
    console.error(`❌ ADMIN_ROLE debe ser uno de: ${validRoles.join(", ")}`);
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter });

  const emailLower = email.toLowerCase();

  const user = await prisma.staffUser.upsert({
    where: { email: emailLower },
    create: {
      email: emailLower,
      name: name || "Admin",
      role,
      status: "ACTIVE",
    },
    update: { role, status: "ACTIVE", name: name || undefined },
  });

  console.log(`✅ Usuario admin creado/actualizado:`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Rol:   ${user.role}`);
  console.log(`\n   Para acceder: ve a /admin/sign-in e ingresa este email.`);
  console.log(`   Recibirás un código OTP por email (o en logs si no hay Postmark/Resend).`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});
