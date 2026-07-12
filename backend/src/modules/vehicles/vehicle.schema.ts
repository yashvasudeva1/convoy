import { z } from "zod";

export const vehicleStatusEnum = z.enum(["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"]);

export const createVehicleSchema = z.object({
  registrationNumber: z.string().trim().min(1, "registrationNumber is required"),
  make: z.string().trim().min(1, "make is required"),
  model: z.string().trim().min(1, "model is required"),
  type: z.string().trim().min(1).optional(),
  capacityKg: z.number().positive("capacityKg must be a positive number"),
  odometerKm: z.number().nonnegative().optional(),
  acquisitionCost: z.number().nonnegative().optional(),
  region: z.string().trim().min(1).optional(),
  status: vehicleStatusEnum.optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();
