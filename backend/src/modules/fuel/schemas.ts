import { z } from "zod";

export const createFuelLogSchema = z.object({
  vehicleId: z.string().min(1),
  tripId: z.string().min(1).optional(),
  liters: z.number().positive(),
  cost: z.number().positive(),
  odometer: z.number().nonnegative().optional(),
});

export type CreateFuelLogInput = z.infer<typeof createFuelLogSchema>;
