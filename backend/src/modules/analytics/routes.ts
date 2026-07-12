import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { asyncHandler } from "../../utils/asyncHandler";
import { getAnalytics, getDashboard } from "./service";

export const dashboardRouter = Router();
export const analyticsRouter = Router();

dashboardRouter.use(authenticate);
analyticsRouter.use(authenticate);

dashboardRouter.get(
  "/",
  requireRole("FLEET_MANAGER", "DISPATCHER", "FINANCIAL_ANALYST", "SAFETY_OFFICER"),
  asyncHandler(async (_req, res) => {
    res.json(await getDashboard());
  })
);

analyticsRouter.get(
  "/",
  requireRole("FLEET_MANAGER", "FINANCIAL_ANALYST"),
  asyncHandler(async (_req, res) => {
    res.json(await getAnalytics());
  })
);
