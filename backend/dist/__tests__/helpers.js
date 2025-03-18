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
exports.createTestUser = createTestUser;
exports.createTestSeed = createTestSeed;
const bcrypt_1 = __importDefault(require("bcrypt"));
function createTestUser(pool_1) {
    return __awaiter(this, arguments, void 0, function* (pool, username = "testuser", password = "testpass") {
        const saltRounds = 10;
        const passwordHash = yield bcrypt_1.default.hash(password, saltRounds);
        const result = yield pool.query("INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *", [username, passwordHash]);
        return result.rows[0];
    });
}
function createTestSeed(pool_1) {
    return __awaiter(this, arguments, void 0, function* (pool, seedData = {}) {
        const defaultSeed = Object.assign({ name: "Test Seed", description: "Test Description", category: "Test Category", growing_season: "Summer", days_to_maturity: 90, planting_depth: 1.0, spacing_inches: 12, quantity_available: 100 }, seedData);
        const result = yield pool.query(`INSERT INTO seeds (name, description, category, growing_season, days_to_maturity, planting_depth, spacing_inches, quantity_available)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`, [
            defaultSeed.name,
            defaultSeed.description,
            defaultSeed.category,
            defaultSeed.growing_season,
            defaultSeed.days_to_maturity,
            defaultSeed.planting_depth,
            defaultSeed.spacing_inches,
            defaultSeed.quantity_available,
        ]);
        return result.rows[0];
    });
}
