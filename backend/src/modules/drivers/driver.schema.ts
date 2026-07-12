import { z } from "zod";

export const driverStatusEnum = z.enum(["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"]);

export const createDriverSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  licenseNumber: z.string().trim().min(1, "licenseNumber is required"),
  licenseCategory: z.string().trim().min(1).optional(),
  licenseExpiry: z.coerce.date({
    errorMap: () => ({ message: "licenseExpiry must be a valid date" }),
  }),
  contactNumber: z.string().trim().min(1).optional(),
  safetyScore: z.number().int().min(0).max(100).optional(),
  status: driverStatusEnum.optional(),
});

export const updateDriverSchema = createDriverSchema.partial();
