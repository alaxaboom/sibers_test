import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secret = process.env.SESSION_SECRET || "your-secret-key";

interface TokenPayload {
  id: number;
  username: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
