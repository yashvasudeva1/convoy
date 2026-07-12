import { z } from "zod";

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().trim().min(1, "vehicleId is required"),
  reason: z.string().trim().min(1, "reason is required"),
  notes: z.string().trim().min(1).optional(),
});

export const closeMaintenanceSchema = z.object({
  notes: z.string().trim().min(1).optional(),
});
