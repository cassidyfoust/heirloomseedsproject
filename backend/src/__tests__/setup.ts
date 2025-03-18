import "@jest/globals";
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env.test") });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database:
    process.env.NODE_ENV === "test" ? "heirloom_seeds_test" : "heirloom_seeds",
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
  max: 1, // Use only one connection for tests
});

const initDatabase = async () => {
  const client = await pool.connect();
  try {
    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Drop existing tables
    await client.query(`
      DROP TABLE IF EXISTS seeds CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // Create test database tables
    await client.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE seeds (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(255) NOT NULL,
        growing_season VARCHAR(100),
        days_to_maturity INTEGER,
        planting_depth DECIMAL(5,2),
        spacing_inches INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Test database initialized successfully");
  } catch (error) {
    console.error("Error initializing test database:", error);
    throw error;
  } finally {
    client.release();
  }
};

const clearTables = async () => {
  const client = await pool.connect();
  try {
    await client.query("TRUNCATE TABLE seeds, users CASCADE");
    console.log("Test tables cleared successfully");
  } catch (error) {
    console.error("Error clearing test tables:", error);
    throw error;
  } finally {
    client.release();
  }
};

beforeAll(async () => {
  await initDatabase();
});

beforeEach(async () => {
  await clearTables();
});

afterAll(async () => {
  const client = await pool.connect();
  try {
    // Drop all tables
    await client.query(`
      DROP TABLE IF EXISTS seeds CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // Release the client
    client.release();

    // Close all connections in the pool
    await pool.end();

    console.log("Test database cleaned up successfully");
  } catch (error) {
    console.error("Error cleaning up test database:", error);
    client.release();
    throw error;
  }
});
