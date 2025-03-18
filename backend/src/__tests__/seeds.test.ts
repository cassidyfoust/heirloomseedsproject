import "@jest/globals";
import request from "supertest";
import app from "../app";
import pool from "../db";

describe("Seed Routes", () => {
  const testSeeds = [
    {
      name: "Test Tomato",
      description: "A juicy tomato variety",
      category: "Tomatoes",
      growing_season: "Summer",
      days_to_maturity: 90,
      planting_depth: 1.0,
      spacing_inches: 12,
    },
    {
      name: "Test Pepper",
      description: "A spicy pepper variety",
      category: "Peppers",
      growing_season: "Summer",
      days_to_maturity: 75,
      planting_depth: 0.5,
      spacing_inches: 8,
    },
  ];

  beforeEach(async () => {
    for (const seed of testSeeds) {
      await pool.query(
        "INSERT INTO seeds (name, description, category, growing_season, days_to_maturity, planting_depth, spacing_inches) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
          seed.name,
          seed.description,
          seed.category,
          seed.growing_season,
          seed.days_to_maturity,
          seed.planting_depth,
          seed.spacing_inches,
        ]
      );
    }
  });

  describe("GET /api/seeds", () => {
    it("should return all seeds", async () => {
      const response = await request(app).get("/api/seeds");

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(2);
      expect(response.body.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: testSeeds[0].name,
            category: testSeeds[0].category,
          }),
          expect.objectContaining({
            name: testSeeds[1].name,
            category: testSeeds[1].category,
          }),
        ])
      );
    });

    it("should filter seeds by category", async () => {
      const response = await request(app)
        .get("/api/seeds")
        .query({ category: "Tomatoes" });

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0]).toEqual(
        expect.objectContaining({
          name: testSeeds[0].name,
          category: "Tomatoes",
        })
      );
    });

    it("should search seeds by name or description", async () => {
      const response = await request(app)
        .get("/api/seeds")
        .query({ search: "juicy" });

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0]).toEqual(
        expect.objectContaining({
          name: testSeeds[0].name,
          description: expect.stringContaining("juicy"),
        })
      );
    });

    it("should handle pagination", async () => {
      const response = await request(app)
        .get("/api/seeds")
        .query({ page: 1, limit: 1 });

      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(1);
      expect(response.body).toHaveProperty("total");
      expect(response.body).toHaveProperty("page", 1);
      expect(response.body).toHaveProperty("totalPages");
    });
  });

  describe("GET /api/seeds/:id", () => {
    it("should return a single seed", async () => {
      const seed = (await pool.query("SELECT id FROM seeds LIMIT 1")).rows[0];
      const response = await request(app).get(`/api/seeds/${seed.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: seed.id,
          name: testSeeds[0].name,
        })
      );
    });

    it("should return 404 for non-existent seed", async () => {
      const response = await request(app).get("/api/seeds/999999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/seeds", () => {
    const newSeed = {
      name: "New Carrot",
      description: "A sweet carrot variety",
      category: "Root Vegetables",
      growing_season: "Spring",
      days_to_maturity: 60,
      planting_depth: 0.5,
      spacing_inches: 4,
    };

    it("should create a new seed", async () => {
      const response = await request(app).post("/api/seeds").send(newSeed);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          name: newSeed.name,
          category: newSeed.category,
        })
      );
    });

    it("should return 400 for invalid seed data", async () => {
      const response = await request(app)
        .post("/api/seeds")
        .send({ category: "Invalid" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("PUT /api/seeds/:id", () => {
    it("should update an existing seed", async () => {
      const seed = (await pool.query("SELECT id FROM seeds LIMIT 1")).rows[0];
      const updateData = {
        name: "Updated Tomato",
        growing_season: "Fall",
      };

      const response = await request(app)
        .put(`/api/seeds/${seed.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining(updateData));
    });

    it("should return 404 for updating non-existent seed", async () => {
      const response = await request(app)
        .put("/api/seeds/999999")
        .send({ name: "Invalid" });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("DELETE /api/seeds/:id", () => {
    it("should delete an existing seed", async () => {
      const seed = (await pool.query("SELECT id FROM seeds LIMIT 1")).rows[0];
      const response = await request(app).delete(`/api/seeds/${seed.id}`);

      expect(response.status).toBe(204);
    });

    it("should return 404 for deleting non-existent seed", async () => {
      const response = await request(app).delete("/api/seeds/999999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
    });
  });
});
