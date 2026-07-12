import { Request, Response } from "express";
import { AppError } from "../../middleware/errorHandler";
import { closeMaintenanceSchema, createMaintenanceSchema } from "./maintenance.schema";
import * as maintenanceService from "./maintenance.service";

export async function listMaintenanceHandler(req: Request, res: Response) {
  const vehicleId = typeof req.query.vehicleId === "string" ? req.query.vehicleId : undefined;

  let status: "OPEN" | "CLOSED" | undefined;
  if (typeof req.query.status === "string") {
    if (req.query.status !== "OPEN" && req.query.status !== "CLOSED") {
      throw new AppError(400, "Invalid status filter");
    }
    status = req.query.status;
  }

  const logs = await maintenanceService.listMaintenanceLogs(vehicleId, status);
  res.json(logs);
}

export async function getMaintenanceHandler(req: Request, res: Response) {
  const log = await maintenanceService.getMaintenanceLog(req.params.id);
  res.json(log);
}

export async function createMaintenanceHandler(req: Request, res: Response) {
  const parsed = createMaintenanceSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? "Invalid request body");
  }

  const log = await maintenanceService.createMaintenanceLog(parsed.data);
  res.status(201).json(log);
}

export async function closeMaintenanceHandler(req: Request, res: Response) {
  const parsed = closeMaintenanceSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? "Invalid request body");
  }

  const log = await maintenanceService.closeMaintenanceLog(req.params.id, parsed.data.notes);
  res.json(log);
}
