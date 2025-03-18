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
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const authRoutes_1 = __importDefault(require("../routes/authRoutes"));
const helpers_1 = require("./helpers");
const pg_1 = require("pg");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api/auth", authRoutes_1.default);
describe("Authentication Routes", () => {
    let pool;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        pool = new pg_1.Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: "heirloom_seeds_test",
            password: process.env.DB_PASSWORD,
            port: parseInt(process.env.DB_PORT || "5432"),
        });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield pool.end();
    }));
    describe("POST /api/auth/login", () => {
        it("should login successfully with valid credentials", () => __awaiter(void 0, void 0, void 0, function* () {
            const username = "testuser";
            const password = "testpass";
            yield (0, helpers_1.createTestUser)(pool, username, password);
            const response = yield (0, supertest_1.default)(app)
                .post("/api/auth/login")
                .send({ username, password });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id");
            expect(response.body).toHaveProperty("username", username);
            expect(response.body).not.toHaveProperty("password_hash");
        }));
        it("should return 401 with invalid credentials", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post("/api/auth/login")
                .send({ username: "wronguser", password: "wrongpass" });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("error", "Invalid username or password");
        }));
        it("should return 401 with correct username but wrong password", () => __awaiter(void 0, void 0, void 0, function* () {
            const username = "testuser";
            const password = "testpass";
            yield (0, helpers_1.createTestUser)(pool, username, password);
            const response = yield (0, supertest_1.default)(app)
                .post("/api/auth/login")
                .send({ username, password: "wrongpass" });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty("error", "Invalid username or password");
        }));
        it("should return 400 with missing credentials", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).post("/api/auth/login").send({});
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error", "Username and password are required");
        }));
        it("should return 400 with empty username", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post("/api/auth/login")
                .send({ username: "", password: "testpass" });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error", "Username and password are required");
        }));
        it("should return 400 with empty password", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post("/api/auth/login")
                .send({ username: "testuser", password: "" });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error", "Username and password are required");
        }));
    });
});
