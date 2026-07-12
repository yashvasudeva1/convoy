import { Request, Response } from "express";
import { loginSchema } from "./auth.schema";
import { login } from "./auth.service";
import { AppError } from "../../middleware/errorHandler";

export async function loginHandler(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? "Invalid request body");
  }

  const result = await login(parsed.data.email, parsed.data.password);
  res.json(result);
}
