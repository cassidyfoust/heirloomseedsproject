import pool from "../db";
import fs from "fs";
import path from "path";

interface Migration {
  name: string;
}

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get list of executed migrations
    const { rows: executedMigrations } = await client.query<Migration>(
      "SELECT name FROM migrations ORDER BY id"
    );
    const executedMigrationNames = new Set(
      executedMigrations.map((row) => row.name)
    );

    // Read migration files
    const migrationsDir = path.join(__dirname, "../db/migrations");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    // Execute each migration that hasn't been run yet
    for (const file of migrationFiles) {
      if (!executedMigrationNames.has(file)) {
        console.log(`Executing migration: ${file}`);
        try {
          const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
          await client.query(sql);
          await client.query("INSERT INTO migrations (name) VALUES ($1)", [
            file,
          ]);
          console.log(`Successfully executed migration: ${file}`);
        } catch (error) {
          console.error(`Error executing migration ${file}:`, error);
          throw error;
        }
      } else {
        console.log(`Skipping already executed migration: ${file}`);
      }
    }

    await client.query("COMMIT");
    console.log("All migrations completed successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error running migrations:", error);
    throw error;
  } finally {
    client.release();
  }
}

runMigrations()
  .then(() => {
    console.log("Migration process completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration process failed:", error);
    process.exit(1);
  });
