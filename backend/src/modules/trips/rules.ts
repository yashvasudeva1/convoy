import { Driver, Vehicle } from "@prisma/client";
import { AppError } from "../../middleware/errorHandler";

export function assertVehicleAssignable(vehicle: Vehicle, cargoWeightKg: number) {
  if (vehicle.status === "RETIRED") {
    throw new AppError("Vehicle is retired", 422);
  }
  if (vehicle.status === "IN_SHOP") {
    throw new AppError("Vehicle is in shop", 422);
  }
  if (vehicle.status === "ON_TRIP") {
    throw new AppError("Vehicle is already on a trip", 422);
  }
  if (vehicle.status !== "AVAILABLE") {
    throw new AppError("Vehicle is not available", 422);
  }
  if (cargoWeightKg > vehicle.capacityKg) {
    throw new AppError(
      `Cargo weight (${cargoWeightKg}kg) exceeds vehicle capacity (${vehicle.capacityKg}kg)`,
      422
    );
  }
}

export function assertDriverAssignable(driver: Driver) {
  if (driver.status === "SUSPENDED") {
    throw new AppError("Driver is suspended", 422);
  }
  if (driver.status === "ON_TRIP") {
    throw new AppError("Driver is already on a trip", 422);
  }
  if (driver.status !== "AVAILABLE") {
    throw new AppError("Driver is not available", 422);
  }
  if (driver.licenseExpiry.getTime() < Date.now()) {
    throw new AppError("Driver license has expired", 422);
  }
}
