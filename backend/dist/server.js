"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const seedRoutes_1 = __importDefault(require("./routes/seedRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use("/api/seeds", seedRoutes_1.default);
// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});
// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
