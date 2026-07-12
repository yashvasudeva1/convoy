import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { createFuelLogSchema } from "./schemas";
import { createFuelLog, listFuelLogs } from "./service";

export const fuelRouter = Router();

fuelRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await listFuelLogs());
  })
);

fuelRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createFuelLogSchema.parse(req.body);
    const log = await createFuelLog(input);
    res.status(201).json(log);
  })
);
