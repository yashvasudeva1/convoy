import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { AppError } from "./errorHandler";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "Missing or invalid Authorization header");
  }

  const token = header.slice("Bearer ".length);

  try {
    req.user = verifyToken(token);
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }

  next();
}
