import { Request, Response } from "express";
import { AppError } from "../../middleware/errorHandler";
import { createVehicleSchema, updateVehicleSchema, vehicleStatusEnum } from "./vehicle.schema";
import * as vehicleService from "./vehicle.service";

export async function listVehiclesHandler(req: Request, res: Response) {
  const statusQuery = req.query.status;
  let status: (typeof vehicleStatusEnum)["_type"] | undefined;

  if (typeof statusQuery === "string") {
    const parsed = vehicleStatusEnum.safeParse(statusQuery);
    if (!parsed.success) {
      throw new AppError(400, "Invalid status filter");
    }
    status = parsed.data;
  }

  const type = typeof req.query.type === "string" ? req.query.type : undefined;
  const region = typeof req.query.region === "string" ? req.query.region : undefined;

  const vehicles = await vehicleService.listVehicles(status, type, region);
  res.json(vehicles);
}

export async function getVehicleHandler(req: Request, res: Response) {
  const vehicle = await vehicleService.getVehicle(req.params.id);
  res.json(vehicle);
}

export async function createVehicleHandler(req: Request, res: Response) {
  const parsed = createVehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? "Invalid request body");
  }

  const vehicle = await vehicleService.createVehicle(parsed.data);
  res.status(201).json(vehicle);
}

export async function updateVehicleHandler(req: Request, res: Response) {
  const parsed = updateVehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? "Invalid request body");
  }

  const vehicle = await vehicleService.updateVehicle(req.params.id, parsed.data);
  res.json(vehicle);
}

export async function deleteVehicleHandler(req: Request, res: Response) {
  await vehicleService.deleteVehicle(req.params.id);
  res.status(204).send();
}
