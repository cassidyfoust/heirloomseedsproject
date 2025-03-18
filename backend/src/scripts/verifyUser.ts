import bcrypt from "bcrypt";
import pool from "../db";

async function verifyUser(username: string, password: string) {
  try {
    console.log("Verifying user:", username);

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    const user = result.rows[0];

    if (!user) {
      console.log("User not found in database");
      return;
    }

    console.log("User found:", {
      id: user.id,
      username: user.username,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });

    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log("Password valid:", isValid);

    if (!isValid) {
      console.log("Current password hash:", user.password_hash);
      const newHash = await bcrypt.hash(password, 10);
      console.log("New password hash would be:", newHash);
    }

    await pool.end();
  } catch (error) {
    console.error("Error verifying user:", error);
    await pool.end();
  }
}

// Run the verification
verifyUser("heirloomseeds", "heirloomseedstest");
