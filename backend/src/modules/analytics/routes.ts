import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { getAnalytics, getDashboard } from "./service";

export const dashboardRouter = Router();
export const analyticsRouter = Router();

dashboardRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await getDashboard());
  })
);

analyticsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await getAnalytics());
  })
);
