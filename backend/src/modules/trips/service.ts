import { prisma } from "../../config/db";
import { AppError } from "../../middleware/errorHandler";
import { CreateTripInput } from "./schemas";
import { assertDriverAssignable, assertVehicleAssignable } from "./rules";

export async function createTrip(input: CreateTripInput) {
  const [vehicle, driver] = await Promise.all([
    prisma.vehicle.findUnique({ where: { id: input.vehicleId } }),
    prisma.driver.findUnique({ where: { id: input.driverId } }),
  ]);

  if (!vehicle) throw new AppError(404, "Vehicle not found");
  if (!driver) throw new AppError(404, "Driver not found");

  assertVehicleAssignable(vehicle, input.cargoWeightKg);
  assertDriverAssignable(driver);

  return prisma.trip.create({
    data: {
      vehicleId: input.vehicleId,
      driverId: input.driverId,
      origin: input.origin,
      destination: input.destination,
      cargoWeightKg: input.cargoWeightKg,
    },
  });
}

export async function dispatchTrip(tripId: string) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new AppError(404, "Trip not found");
    if (trip.status !== "PENDING") {
      throw new AppError(422, `Cannot dispatch trip in status ${trip.status}`);
    }

    const [vehicle, driver] = await Promise.all([
      tx.vehicle.findUnique({ where: { id: trip.vehicleId } }),
      tx.driver.findUnique({ where: { id: trip.driverId } }),
    ]);
    if (!vehicle) throw new AppError(404, "Vehicle not found");
    if (!driver) throw new AppError(404, "Driver not found");

    assertVehicleAssignable(vehicle, trip.cargoWeightKg);
    assertDriverAssignable(driver);

    await tx.vehicle.update({
      where: { id: vehicle.id },
      data: { status: "ON_TRIP" },
    });
    await tx.driver.update({
      where: { id: driver.id },
      data: { status: "ON_TRIP" },
    });

    return tx.trip.update({
      where: { id: tripId },
      data: { status: "DISPATCHED", dispatchedAt: new Date() },
    });
  });
}

export async function completeTrip(tripId: string) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new AppError(404, "Trip not found");
    if (trip.status !== "DISPATCHED") {
      throw new AppError(422, `Cannot complete trip in status ${trip.status}`);
    }

    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: "AVAILABLE" },
    });
    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: "AVAILABLE" },
    });

    return tx.trip.update({
      where: { id: tripId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  });
}

export async function cancelTrip(tripId: string) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw new AppError(404, "Trip not found");
    if (trip.status !== "PENDING" && trip.status !== "DISPATCHED") {
      throw new AppError(422, `Cannot cancel trip in status ${trip.status}`);
    }

    if (trip.status === "DISPATCHED") {
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: "AVAILABLE" },
      });
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: "AVAILABLE" },
      });
    }

    return tx.trip.update({
      where: { id: tripId },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
  });
}

export async function listTrips() {
  return prisma.trip.findMany({ orderBy: { createdAt: "desc" } });
}
