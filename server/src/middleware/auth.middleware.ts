import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: number;
  role: "admin" | "student";
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token =
      authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Invalid token format",
      });
    }

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as JwtPayload;

    req.user = decoded;

    next();

  } catch (err) {

    return res.status(401).json({
      message:
        "Invalid or expired token",
    });

  }
};