import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { asyncHandler } from "../../utils/asyncHandler";
import { getAnalytics, getDashboard } from "./service";

export const dashboardRouter = Router();
export const analyticsRouter = Router();

dashboardRouter.use(authenticate);
analyticsRouter.use(authenticate);

function fleetFiltersFromQuery(query: Record<string, unknown>) {
  return {
    type: typeof query.type === "string" ? query.type : undefined,
    region: typeof query.region === "string" ? query.region : undefined,
  };
}

dashboardRouter.get(
  "/",
  requireRole("FLEET_MANAGER", "DISPATCHER", "FINANCIAL_ANALYST", "SAFETY_OFFICER"),
  asyncHandler(async (req, res) => {
    res.json(await getDashboard(fleetFiltersFromQuery(req.query)));
  })
);

analyticsRouter.get(
  "/",
  requireRole("FLEET_MANAGER", "FINANCIAL_ANALYST"),
  asyncHandler(async (req, res) => {
    res.json(await getAnalytics(fleetFiltersFromQuery(req.query)));
  })
);
