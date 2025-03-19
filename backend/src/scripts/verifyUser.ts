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
  } catch (error) {
    console.error("Error verifying user:", error);
  } finally {
    await pool.end();
  }
}

// Get username and password from command line arguments
const [username, password] = process.argv.slice(2);

if (!username || !password) {
  console.error("Usage: npm run verify-user <username> <password>");
  process.exit(1);
}

verifyUser(username, password);
