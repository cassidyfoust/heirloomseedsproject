import express from "express";
import cors from "cors";
import seedRoutes from "./routes/seedRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/seeds", seedRoutes);
app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
