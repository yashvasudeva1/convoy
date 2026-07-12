import { Prisma, VehicleStatus } from "@prisma/client";
import { prisma } from "../../config/db";
import { AppError } from "../../middleware/errorHandler";

interface VehicleInput {
  registrationNumber: string;
  make: string;
  model: string;
  type?: string;
  capacityKg: number;
  odometerKm?: number;
  acquisitionCost?: number;
  region?: string;
  status?: VehicleStatus;
}

export function listVehicles(status?: VehicleStatus, type?: string, region?: string) {
  return prisma.vehicle.findMany({
    where: {
      status: status ?? undefined,
      type: type ?? undefined,
      region: region ?? undefined,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getVehicle(id: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) {
    throw new AppError(404, "Vehicle not found");
  }
  return vehicle;
}

export async function createVehicle(input: VehicleInput) {
  try {
    return await prisma.vehicle.create({ data: input });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new AppError(409, "A vehicle with this registration number already exists");
    }
    throw err;
  }
}

export async function updateVehicle(id: string, input: Partial<VehicleInput>) {
  await getVehicle(id);

  try {
    return await prisma.vehicle.update({ where: { id }, data: input });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new AppError(409, "A vehicle with this registration number already exists");
    }
    throw err;
  }
}

export async function deleteVehicle(id: string) {
  await getVehicle(id);

  try {
    await prisma.vehicle.delete({ where: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      throw new AppError(409, "Cannot delete a vehicle with existing maintenance records");
    }
    throw err;
  }
}
