import { Driver, Vehicle } from "@prisma/client";
import { AppError } from "../../middleware/errorHandler";

export function assertVehicleAssignable(vehicle: Vehicle, cargoWeightKg: number) {
  if (vehicle.status === "RETIRED") {
    throw new AppError(422, "Vehicle is retired");
  }
  if (vehicle.status === "IN_SHOP") {
    throw new AppError(422, "Vehicle is in shop");
  }
  if (vehicle.status === "ON_TRIP") {
    throw new AppError(422, "Vehicle is already on a trip");
  }
  if (vehicle.status !== "AVAILABLE") {
    throw new AppError(422, "Vehicle is not available");
  }
  if (cargoWeightKg > vehicle.capacityKg) {
    throw new AppError(
      422,
      `Cargo weight (${cargoWeightKg}kg) exceeds vehicle capacity (${vehicle.capacityKg}kg)`
    );
  }
}

export function assertDriverAssignable(driver: Driver) {
  if (driver.status === "SUSPENDED") {
    throw new AppError(422, "Driver is suspended");
  }
  if (driver.status === "ON_TRIP") {
    throw new AppError(422, "Driver is already on a trip");
  }
  if (driver.status !== "AVAILABLE") {
    throw new AppError(422, "Driver is not available");
  }
  if (driver.licenseExpiry.getTime() < Date.now()) {
    throw new AppError(422, "Driver license has expired");
  }
}
