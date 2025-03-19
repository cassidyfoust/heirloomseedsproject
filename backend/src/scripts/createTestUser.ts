import { Pool } from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
});

async function createTestUser() {
  const username = "test";
  const password = "test123";
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  try {
    const result = await pool.query(
      `INSERT INTO users (username, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (username) 
       DO UPDATE SET password_hash = $2`,
      [username, passwordHash]
    );

    console.log("Test user created/updated successfully");
  } catch (error) {
    console.error("Error creating test user:", error);
  } finally {
    await pool.end();
  }
}

createTestUser();
