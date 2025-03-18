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
exports.userService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../db"));
exports.userService = {
    createUser(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const result = yield db_1.default.query("INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *", [username, hashedPassword]);
            return result.rows[0];
        });
    },
    authenticateUser(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Authenticating user:", username);
            const result = yield db_1.default.query("SELECT * FROM users WHERE username = $1", [
                username,
            ]);
            const user = result.rows[0];
            if (!user) {
                console.log("User not found:", username);
                return null;
            }
            console.log("User found, verifying password");
            const isValid = yield bcrypt_1.default.compare(password, user.password_hash);
            if (!isValid) {
                console.log("Invalid password for user:", username);
                return null;
            }
            console.log("Password verified for user:", username);
            return user;
        });
    },
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query("SELECT * FROM users WHERE id = $1", [id]);
            return result.rows[0] || null;
        });
    },
    getUserByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield db_1.default.query("SELECT * FROM users WHERE username = $1", [
                username,
            ]);
            return result.rows[0] || null;
        });
    },
};
