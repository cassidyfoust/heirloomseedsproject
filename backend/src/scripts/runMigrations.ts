import fs from "fs";
import path from "path";
import pool from "../config/db";

async function runMigrations() {
  const client = await pool.connect();
  try {
    // Run migrations in order
    const migrations = [
      "000_create_trigger_function.sql",
      "001_create_orders_tables.sql",
      "002_add_test_orders.sql",
    ];

    for (const migration of migrations) {
      console.log(`Running migration: ${migration}`);
      const migrationPath = path.join(__dirname, "../db/migrations", migration);
      const migrationSQL = fs.readFileSync(migrationPath, "utf8");
      await client.query(migrationSQL);
    }

    console.log("All migrations completed successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
