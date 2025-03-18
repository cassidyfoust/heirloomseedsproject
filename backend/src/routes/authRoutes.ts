import express from "express";
import { userService } from "../services/userService";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (
      !username ||
      !password ||
      username.trim() === "" ||
      password.trim() === ""
    ) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    console.log("Login attempt for username:", username);

    const user = await userService.authenticateUser(username, password);

    if (!user) {
      console.log("Authentication failed for username:", username);
      return res.status(401).json({ error: "Invalid username or password" });
    }

    console.log("Login successful for username:", username);
    res.json(user);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
