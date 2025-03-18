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
exports.seedService = void 0;
const db_1 = __importDefault(require("../config/db"));
exports.seedService = {
    // Get all seeds with optional filtering, sorting, and pagination
    getAllSeeds(category_1, searchQuery_1) {
        return __awaiter(this, arguments, void 0, function* (category, searchQuery, sortBy = "name", sortOrder = "asc", page = 1, limit = 9) {
            const offset = (page - 1) * limit;
            const params = [];
            const conditions = [];
            // Build the WHERE clause
            if (category) {
                conditions.push("category = $1");
                params.push(category);
            }
            if (searchQuery) {
                conditions.push("(name ILIKE $" +
                    (params.length + 1) +
                    " OR description ILIKE $" +
                    (params.length + 1) +
                    ")");
                params.push(`%${searchQuery}%`);
            }
            const whereClause = conditions.length > 0 ? " WHERE " + conditions.join(" AND ") : "";
            // Get total count
            const countResult = yield db_1.default.query(`SELECT COUNT(*) FROM seeds${whereClause}`, params);
            const total = parseInt(countResult.rows[0].count);
            const totalPages = Math.ceil(total / limit);
            // Get paginated results
            const result = yield db_1.default.query(`SELECT * FROM seeds${whereClause} ORDER BY ${sortBy} ${sortOrder.toUpperCase()} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`, [...params, limit, offset]);
            return {
                items: result.rows,
                total,
                page,
                limit,
                totalPages,
            };
        });
    },
    // Get a single seed by ID
    getSeedById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query("SELECT * FROM seeds WHERE id = $1", [id]);
            return result.rows[0] || null;
        });
    },
    // Get all unique categories
    getCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query("SELECT DISTINCT category FROM seeds ORDER BY category");
            return result.rows.map((row) => row.category);
        });
    },
    // Create a new seed
    createSeed(seed) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query(`INSERT INTO seeds (name, description, category, growing_season, days_to_maturity, planting_depth, spacing_inches)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`, [
                seed.name,
                seed.description,
                seed.category,
                seed.growing_season,
                seed.days_to_maturity,
                seed.planting_depth,
                seed.spacing_inches,
            ]);
            return result.rows[0];
        });
    },
    // Update a seed
    updateSeed(id, seed) {
        return __awaiter(this, void 0, void 0, function* () {
            const setClause = Object.keys(seed)
                .map((key, index) => `${key} = $${index + 2}`)
                .join(", ");
            const result = yield db_1.default.query(`UPDATE seeds SET ${setClause} WHERE id = $1 RETURNING *`, [id, ...Object.values(seed)]);
            return result.rows[0] || null;
        });
    },
    // Delete a seed
    deleteSeed(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query("DELETE FROM seeds WHERE id = $1 RETURNING *", [id]);
            return result.rowCount ? result.rowCount > 0 : false;
        });
    },
};
