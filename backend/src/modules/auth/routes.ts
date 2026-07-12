import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { loginHandler } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/", asyncHandler(loginHandler));
