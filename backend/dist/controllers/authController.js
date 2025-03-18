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
exports.authController = void 0;
const userService_1 = require("../services/userService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
exports.authController = {
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, password } = req.body;
                if (!username || !password) {
                    return res
                        .status(400)
                        .json({ error: "Username and password are required" });
                }
                // Check if user already exists
                const existingUser = yield userService_1.userService.getUserByUsername(username);
                if (existingUser) {
                    return res.status(409).json({ error: "Username already exists" });
                }
                const user = yield userService_1.userService.createUser(username, password);
                const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, {
                    expiresIn: "24h",
                });
                res.status(201).json({
                    message: "User registered successfully",
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        created_at: user.created_at,
                        updated_at: user.updated_at,
                    },
                });
            }
            catch (error) {
                console.error("Registration error:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
    },
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, password } = req.body;
                if (!username || !password) {
                    return res
                        .status(400)
                        .json({ error: "Username and password are required" });
                }
                const user = yield userService_1.userService.authenticateUser(username, password);
                if (!user) {
                    return res.status(401).json({ error: "Invalid credentials" });
                }
                const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, {
                    expiresIn: "24h",
                });
                res.json({
                    message: "Login successful",
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        created_at: user.created_at,
                        updated_at: user.updated_at,
                    },
                });
            }
            catch (error) {
                console.error("Login error:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        });
    },
};
