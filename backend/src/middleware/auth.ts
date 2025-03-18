import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { userService } from "../services/userService";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("Authenticating request...");
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ error: "Authentication token required" });
  }

  try {
    console.log("Verifying token...");
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    console.log("Token verified successfully");
    const user = await userService.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = {
      id: user.id,
      username: user.username,
    };

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
