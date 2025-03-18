"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const seedService_1 = require("../services/seedService");
const router = express_1.default.Router();
// Get all seeds with optional filtering, sorting, and pagination
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, search, sortBy, sortOrder, page, limit } = req.query;
        const seeds = yield seedService_1.seedService.getAllSeeds(category, search, sortBy || "name", sortOrder || "asc", parseInt(page) || 1, parseInt(limit) || 9);
        res.json(seeds);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch seeds" });
    }
}));
// Get all categories
router.get("/categories", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield seedService_1.seedService.getCategories();
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
}));
// Get a single seed by ID
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const seed = yield seedService_1.seedService.getSeedById(req.params.id);
        if (!seed) {
            return res.status(404).json({ error: "Seed not found" });
        }
        res.json(seed);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch seed" });
    }
}));
// Create a new seed
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, category } = req.body;
        if (!name || !category) {
            return res.status(400).json({ error: "Name and category are required" });
        }
        const seed = yield seedService_1.seedService.createSeed(req.body);
        res.status(201).json(seed);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create seed" });
    }
}));
// Update a seed
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const seed = yield seedService_1.seedService.updateSeed(req.params.id, req.body);
        if (!seed) {
            return res.status(404).json({ error: "Seed not found" });
        }
        res.json(seed);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update seed" });
    }
}));
// Delete a seed
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield seedService_1.seedService.deleteSeed(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: "Seed not found" });
        }
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete seed" });
    }
}));
exports.default = router;
