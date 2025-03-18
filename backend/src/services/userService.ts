import bcrypt from "bcrypt";
import pool from "../db";

export interface User {
  id: string;
  username: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export const userService = {
  async createUser(username: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *",
      [username, hashedPassword]
    );
    return result.rows[0];
  },

  async authenticateUser(
    username: string,
    password: string
  ): Promise<User | null> {
    console.log("Starting authentication for user:", username);

    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );

      console.log("Database query completed, rows found:", result.rows.length);

      const user = result.rows[0];

      if (!user) {
        console.log("User not found in database:", username);
        return null;
      }

      console.log("User found in database:", {
        id: user.id,
        username: user.username,
        created_at: user.created_at,
      });

      console.log("Verifying password...");
      const isValid = await bcrypt.compare(password, user.password_hash);

      if (!isValid) {
        console.log("Password verification failed for user:", username);
        return null;
      }

      console.log("Password verified successfully for user:", username);
      return user;
    } catch (error) {
      console.error("Error during authentication:", error);
      throw error;
    }
  },

  async getUserById(id: string): Promise<User | null> {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] || null;
  },

  async getUserByUsername(username: string): Promise<User | null> {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    return result.rows[0] || null;
  },
};
