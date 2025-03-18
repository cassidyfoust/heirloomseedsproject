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
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../config/db"));
function createTestUser() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const username = "heirloomseeds";
            const password = "heirloomseedstest";
            const saltRounds = 10;
            const passwordHash = yield bcrypt_1.default.hash(password, saltRounds);
            // First, delete any existing user with the same username
            yield db_1.default.query("DELETE FROM users WHERE username = $1", [username]);
            // Then create a new user
            yield db_1.default.query("INSERT INTO users (username, password_hash) VALUES ($1, $2)", [username, passwordHash]);
            console.log("Test user created successfully");
            process.exit(0);
        }
        catch (error) {
            console.error("Error creating test user:", error);
            process.exit(1);
        }
    });
}
createTestUser();
