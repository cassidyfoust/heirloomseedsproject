import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

// Load environment variables based on NODE_ENV
dotenv.config({
  path: path.resolve(
    __dirname,
    `../../.env${process.env.NODE_ENV === "test" ? ".test" : ""}`
  ),
});

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database:
    process.env.NODE_ENV === "test" ? "heirloom_seeds_test" : "heirloom_seeds",
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
});

export default pool;
