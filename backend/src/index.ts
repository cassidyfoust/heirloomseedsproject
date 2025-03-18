import express from "express";
import cors from "cors";
import seedRoutes from "./routes/seedRoutes";
import authRoutes from "./routes/authRoutes";
import orderRoutes from "./routes/orderRoutes";

const app = express();
const port = process.env.PORT || 3001;

console.log("Starting server...");

app.use(cors());
app.use(express.json());

// Routes
console.log("Registering routes...");
app.use("/api/seeds", seedRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
console.log("Routes registered successfully");

// Add a test route to verify server is running
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log("Available routes:");
  console.log("- GET /api/seeds");
  console.log("- POST /api/auth/login");
  console.log("- GET /api/orders");
});
