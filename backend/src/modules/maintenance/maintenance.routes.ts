import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  closeMaintenanceHandler,
  createMaintenanceHandler,
  getMaintenanceHandler,
  listMaintenanceHandler,
} from "./maintenance.controller";

export const maintenanceRouter = Router();

maintenanceRouter.use(authenticate);

maintenanceRouter.get("/", asyncHandler(listMaintenanceHandler));
maintenanceRouter.get("/:id", asyncHandler(getMaintenanceHandler));
maintenanceRouter.post("/", requireRole("FLEET_MANAGER", "SAFETY_OFFICER"), asyncHandler(createMaintenanceHandler));
maintenanceRouter.patch(
  "/:id/close",
  requireRole("FLEET_MANAGER", "SAFETY_OFFICER"),
  asyncHandler(closeMaintenanceHandler)
);
