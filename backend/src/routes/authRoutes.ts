import express from "express";
import { userService } from "../services/userService";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

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
      console.log("Missing credentials");
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

    console.log("User authenticated successfully:", {
      id: user.id,
      username: user.username,
      created_at: user.created_at,
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    console.log("JWT token generated successfully");

    // Create a clean user object without sensitive data
    const cleanUser = {
      id: user.id,
      username: user.username,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    // Send response with token and clean user data
    const response = {
      ...cleanUser,
      token,
    };

    console.log("Sending response:", {
      ...response,
      token: "[REDACTED]", // Don't log the actual token
    });

    // Ensure we're sending the clean response
    return res.status(200).json(response);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Failed to login" });
  }
});

export default router;
