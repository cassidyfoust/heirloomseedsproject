import { Pool } from "pg";
import bcrypt from "bcrypt";

export async function createTestUser(
  pool: Pool,
  username: string = "testuser",
  password: string = "testpass"
) {
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const result = await pool.query(
    "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *",
    [username, passwordHash]
  );

  return result.rows[0];
}

export async function createTestSeed(pool: Pool, seedData: any = {}) {
  const defaultSeed = {
    name: "Test Seed",
    description: "Test Description",
    category: "Test Category",
    growing_season: "Summer",
    days_to_maturity: 90,
    planting_depth: 1.0,
    spacing_inches: 12,
    quantity_available: 100,
    ...seedData,
  };

  const result = await pool.query(
    `INSERT INTO seeds (name, description, category, growing_season, days_to_maturity, planting_depth, spacing_inches, quantity_available)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      defaultSeed.name,
      defaultSeed.description,
      defaultSeed.category,
      defaultSeed.growing_season,
      defaultSeed.days_to_maturity,
      defaultSeed.planting_depth,
      defaultSeed.spacing_inches,
      defaultSeed.quantity_available,
    ]
  );

  return result.rows[0];
}
