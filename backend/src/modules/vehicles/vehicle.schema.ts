import { z } from "zod";

export const vehicleStatusEnum = z.enum(["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"]);

export const createVehicleSchema = z.object({
  registrationNumber: z.string().trim().min(1, "registrationNumber is required"),
  make: z.string().trim().min(1, "make is required"),
  model: z.string().trim().min(1, "model is required"),
  capacityKg: z.number().positive("capacityKg must be a positive number"),
  status: vehicleStatusEnum.optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();
