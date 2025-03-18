import "@jest/globals";
import request from "supertest";
import express from "express";
import authRoutes from "../routes/authRoutes";
import { createTestUser } from "./helpers";
import { Pool } from "pg";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Authentication Routes", () => {
  let pool: Pool;

  beforeAll(async () => {
    pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: "heirloom_seeds_test",
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || "5432"),
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const username = "testuser";
      const password = "testpass";
      await createTestUser(pool, username, password);

      const response = await request(app)
        .post("/api/auth/login")
        .send({ username, password });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("username", username);
      expect(response.body).not.toHaveProperty("password_hash");
    });

    it("should return 401 with invalid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ username: "wronguser", password: "wrongpass" });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "error",
        "Invalid username or password"
      );
    });

    it("should return 401 with correct username but wrong password", async () => {
      const username = "testuser";
      const password = "testpass";
      await createTestUser(pool, username, password);

      const response = await request(app)
        .post("/api/auth/login")
        .send({ username, password: "wrongpass" });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "error",
        "Invalid username or password"
      );
    });

    it("should return 400 with missing credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Username and password are required"
      );
    });

    it("should return 400 with empty username", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ username: "", password: "testpass" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Username and password are required"
      );
    });

    it("should return 400 with empty password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ username: "testuser", password: "" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "error",
        "Username and password are required"
      );
    });
  });
});
