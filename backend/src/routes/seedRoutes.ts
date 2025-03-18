import express from "express";
import { seedService } from "../services/seedService";

const router = express.Router();

// Get all seeds with optional filtering, sorting, and pagination
router.get("/", async (req, res) => {
  try {
    const { category, search, sortBy, sortOrder, page, limit } = req.query;
    const seeds = await seedService.getAllSeeds(
      category as string | undefined,
      search as string | undefined,
      (sortBy as "name" | "category") || "name",
      (sortOrder as "asc" | "desc") || "asc",
      parseInt(page as string) || 1,
      parseInt(limit as string) || 9
    );
    res.json(seeds);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch seeds" });
  }
});

// Get all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await seedService.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Get a single seed by ID
router.get("/:id", async (req, res) => {
  try {
    const seed = await seedService.getSeedById(req.params.id);
    if (!seed) {
      return res.status(404).json({ error: "Seed not found" });
    }
    res.json(seed);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch seed" });
  }
});

// Create a new seed
router.post("/", async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: "Name and category are required" });
    }
    const seed = await seedService.createSeed(req.body);
    res.status(201).json(seed);
  } catch (error) {
    res.status(500).json({ error: "Failed to create seed" });
  }
});

// Update a seed
router.put("/:id", async (req, res) => {
  try {
    const seed = await seedService.updateSeed(req.params.id, req.body);
    if (!seed) {
      return res.status(404).json({ error: "Seed not found" });
    }
    res.json(seed);
  } catch (error) {
    res.status(500).json({ error: "Failed to update seed" });
  }
});

// Delete a seed
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await seedService.deleteSeed(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Seed not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete seed" });
  }
});

export default router;
