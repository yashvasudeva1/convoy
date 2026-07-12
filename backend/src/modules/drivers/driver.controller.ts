import { Request, Response } from "express";
import { AppError } from "../../middleware/errorHandler";
import { createDriverSchema, driverStatusEnum, updateDriverSchema } from "./driver.schema";
import * as driverService from "./driver.service";

export async function listDriversHandler(req: Request, res: Response) {
  const statusQuery = req.query.status;
  let status: (typeof driverStatusEnum)["_type"] | undefined;

  if (typeof statusQuery === "string") {
    const parsed = driverStatusEnum.safeParse(statusQuery);
    if (!parsed.success) {
      throw new AppError(400, "Invalid status filter");
    }
    status = parsed.data;
  }

  const drivers = await driverService.listDrivers(status);
  res.json(drivers);
}

export async function getDriverHandler(req: Request, res: Response) {
  const driver = await driverService.getDriver(req.params.id);
  res.json(driver);
}

export async function createDriverHandler(req: Request, res: Response) {
  const parsed = createDriverSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? "Invalid request body");
  }

  const driver = await driverService.createDriver(parsed.data);
  res.status(201).json(driver);
}

export async function updateDriverHandler(req: Request, res: Response) {
  const parsed = updateDriverSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message ?? "Invalid request body");
  }

  const driver = await driverService.updateDriver(req.params.id, parsed.data);
  res.json(driver);
}

export async function deleteDriverHandler(req: Request, res: Response) {
  await driverService.deleteDriver(req.params.id);
  res.status(204).send();
}
