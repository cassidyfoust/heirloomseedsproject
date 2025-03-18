import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import seedRoutes from "./routes/seedRoutes";
import orderRoutes from "./routes/orderRoutes";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/seeds", seedRoutes);
app.use("/api/orders", orderRoutes);

export default app;
