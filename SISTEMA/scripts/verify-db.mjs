#!/usr/bin/env node
/**
 * Verifica que la base de datos esté configurada y que las tablas existan.
 * Uso: node scripts/verify-db.mjs
 * Exit 0 = OK, Exit 1 = Error
 */
import pg from "pg";

const REQUIRED_TABLES = [
  "StaffUser",
  "Product",
  "Page",
  "Collection",
  "MediaAsset",
  "Variant",
  "Cart",
  "Order",
  "SiteSetting",
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL no está configurada.");
    process.exit(1);
  }

  console.log("✓ DATABASE_URL configurada");

  const client = new pg.Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    console.log("✓ Conexión a la base de datos exitosa");

    for (const table of REQUIRED_TABLES) {
      const result = await client.query(
        `SELECT COUNT(*) as count FROM "${table}"`
      );
      const count = parseInt(result.rows[0]?.count ?? "0", 10);
      console.log(`  ✓ Tabla "${table}": ${count} registros`);
    }

    console.log("\n✅ Verificación completada. Todas las tablas existen.");
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Error en la verificación:", err.message);
    await client.end().catch(() => {});
    process.exit(1);
  }
}

main();
