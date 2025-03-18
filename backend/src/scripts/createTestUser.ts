import bcrypt from "bcrypt";
import pool from "../config/db";

async function createTestUser() {
  try {
    const username = "heirloomseeds";
    const password = "heirloomseedstest";
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // First, delete any existing user with the same username
    await pool.query("DELETE FROM users WHERE username = $1", [username]);

    // Then create a new user
    await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
      [username, passwordHash]
    );

    console.log("Test user created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error creating test user:", error);
    process.exit(1);
  }
}

createTestUser();
