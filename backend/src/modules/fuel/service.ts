import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";
import { CreateFuelLogInput } from "./schemas";

export async function createFuelLog(input: CreateFuelLogInput) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: input.vehicleId },
  });
  if (!vehicle) throw new AppError("Vehicle not found", 404);

  if (input.tripId) {
    const trip = await prisma.trip.findUnique({ where: { id: input.tripId } });
    if (!trip) throw new AppError("Trip not found", 404);
  }

  return prisma.fuelLog.create({
    data: {
      vehicleId: input.vehicleId,
      tripId: input.tripId,
      liters: input.liters,
      cost: input.cost,
      odometer: input.odometer,
    },
  });
}

export async function listFuelLogs() {
  return prisma.fuelLog.findMany({ orderBy: { loggedAt: "desc" } });
}
