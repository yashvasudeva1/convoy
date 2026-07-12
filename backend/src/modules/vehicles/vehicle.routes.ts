import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  createVehicleHandler,
  deleteVehicleHandler,
  getVehicleHandler,
  listVehiclesHandler,
  updateVehicleHandler,
} from "./vehicle.controller";

export const vehicleRouter = Router();

vehicleRouter.use(authenticate);

vehicleRouter.get("/", asyncHandler(listVehiclesHandler));
vehicleRouter.get("/:id", asyncHandler(getVehicleHandler));
vehicleRouter.post("/", requireRole("FLEET_MANAGER"), asyncHandler(createVehicleHandler));
vehicleRouter.put("/:id", requireRole("FLEET_MANAGER"), asyncHandler(updateVehicleHandler));
vehicleRouter.delete("/:id", requireRole("FLEET_MANAGER"), asyncHandler(deleteVehicleHandler));
