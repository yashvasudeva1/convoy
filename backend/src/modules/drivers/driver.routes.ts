import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createDriverHandler,
  deleteDriverHandler,
  getDriverHandler,
  listDriversHandler,
  updateDriverHandler,
} from "./driver.controller";

export const driverRouter = Router();

driverRouter.use(authenticate);

driverRouter.get("/", asyncHandler(listDriversHandler));
driverRouter.get("/:id", asyncHandler(getDriverHandler));
driverRouter.post("/", requireRole("FLEET_MANAGER"), asyncHandler(createDriverHandler));
driverRouter.put("/:id", requireRole("FLEET_MANAGER", "SAFETY_OFFICER"), asyncHandler(updateDriverHandler));
driverRouter.delete("/:id", requireRole("FLEET_MANAGER"), asyncHandler(deleteDriverHandler));
