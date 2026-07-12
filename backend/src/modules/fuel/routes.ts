import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { asyncHandler } from "../../utils/asyncHandler";
import { createFuelLogSchema } from "./schemas";
import { createFuelLog, listFuelLogs } from "./service";

export const fuelRouter = Router();

fuelRouter.use(authenticate);

fuelRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await listFuelLogs());
  })
);

fuelRouter.post(
  "/",
  requireRole("FLEET_MANAGER", "DISPATCHER"),
  asyncHandler(async (req, res) => {
    const input = createFuelLogSchema.parse(req.body);
    const log = await createFuelLog(input);
    res.status(201).json(log);
  })
);
