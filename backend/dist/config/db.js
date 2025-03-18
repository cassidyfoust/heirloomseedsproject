"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables based on NODE_ENV
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, `../../.env${process.env.NODE_ENV === "test" ? ".test" : ""}`),
});
const pool = new pg_1.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.NODE_ENV === "test" ? "heirloom_seeds_test" : "heirloom_seeds",
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "5432"),
});
exports.default = pool;
