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
require("@jest/globals");
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load test environment variables
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env.test") });
const pool = new pg_1.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.NODE_ENV === "test" ? "heirloom_seeds_test" : "heirloom_seeds",
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "5432"),
    max: 1, // Use only one connection for tests
});
const initDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield pool.connect();
    try {
        // Enable UUID extension
        yield client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        // Drop existing tables
        yield client.query(`
      DROP TABLE IF EXISTS seeds CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
        // Create test database tables
        yield client.query(`
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
    }
    catch (error) {
        console.error("Error initializing test database:", error);
        throw error;
    }
    finally {
        client.release();
    }
});
const clearTables = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield pool.connect();
    try {
        yield client.query("TRUNCATE TABLE seeds, users CASCADE");
        console.log("Test tables cleared successfully");
    }
    catch (error) {
        console.error("Error clearing test tables:", error);
        throw error;
    }
    finally {
        client.release();
    }
});
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield initDatabase();
}));
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield clearTables();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield pool.connect();
    try {
        // Drop all tables
        yield client.query(`
      DROP TABLE IF EXISTS seeds CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
        // Release the client
        client.release();
        // Close all connections in the pool
        yield pool.end();
        console.log("Test database cleaned up successfully");
    }
    catch (error) {
        console.error("Error cleaning up test database:", error);
        client.release();
        throw error;
    }
}));
