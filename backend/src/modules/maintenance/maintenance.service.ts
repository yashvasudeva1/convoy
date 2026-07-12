import { MaintenanceStatus } from "@prisma/client";
import { prisma } from "../../config/db";
import { AppError } from "../../middleware/errorHandler";

export function listMaintenanceLogs(vehicleId?: string, status?: MaintenanceStatus) {
  return prisma.maintenanceLog.findMany({
    where: {
      vehicleId: vehicleId ?? undefined,
      status: status ?? undefined,
    },
    include: { vehicle: true },
    orderBy: { openedAt: "desc" },
  });
}

export async function getMaintenanceLog(id: string) {
  const log = await prisma.maintenanceLog.findUnique({
    where: { id },
    include: { vehicle: true },
  });
  if (!log) {
    throw new AppError(404, "Maintenance record not found");
  }
  return log;
}

export async function createMaintenanceLog(input: { vehicleId: string; reason: string; notes?: string; cost?: number }) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: input.vehicleId } });
  if (!vehicle) {
    throw new AppError(404, "Vehicle not found");
  }

  if (vehicle.status === "RETIRED") {
    throw new AppError(400, "Cannot open a maintenance record for a retired vehicle");
  }
  if (vehicle.status === "IN_SHOP") {
    throw new AppError(409, "Vehicle already has an open maintenance record");
  }
  if (vehicle.status === "ON_TRIP") {
    throw new AppError(409, "Cannot open a maintenance record while the vehicle is on a trip");
  }

  return prisma.$transaction(async (tx) => {
    const log = await tx.maintenanceLog.create({
      data: {
        vehicleId: input.vehicleId,
        reason: input.reason,
        notes: input.notes,
        cost: input.cost,
      },
    });

    await tx.vehicle.update({
      where: { id: input.vehicleId },
      data: { status: "IN_SHOP" },
    });

    return log;
  });
}

export async function closeMaintenanceLog(id: string, notes?: string, cost?: number) {
  const log = await prisma.maintenanceLog.findUnique({ where: { id } });
  if (!log) {
    throw new AppError(404, "Maintenance record not found");
  }
  if (log.status === "CLOSED") {
    throw new AppError(409, "Maintenance record is already closed");
  }

  return prisma.$transaction(async (tx) => {
    const closedLog = await tx.maintenanceLog.update({
      where: { id },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
        notes: notes ?? log.notes,
        cost: cost ?? log.cost,
      },
    });

    const vehicle = await tx.vehicle.findUnique({ where: { id: log.vehicleId } });
    if (vehicle?.status === "IN_SHOP") {
      await tx.vehicle.update({
        where: { id: log.vehicleId },
        data: { status: "AVAILABLE" },
      });
    }

    return closedLog;
  });
}
