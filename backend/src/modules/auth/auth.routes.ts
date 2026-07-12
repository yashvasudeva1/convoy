import { Router } from "express";
import { loginHandler } from "./auth.controller";
import { asyncHandler } from "../../utils/asyncHandler";

export const authRouter = Router();

authRouter.post("/login", asyncHandler(loginHandler));
