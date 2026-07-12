import { NextFunction, Request, Response } from "express";
import { AppError } from "./errorHandler";

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, "Not authenticated");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(403, "Insufficient permissions for this action");
    }

    next();
  };
}
