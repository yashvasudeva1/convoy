import { z } from "zod";

export const createTripSchema = z.object({
  vehicleId: z.string().min(1),
  driverId: z.string().min(1),
  origin: z.string().min(1),
  destination: z.string().min(1),
  cargoWeightKg: z.number().positive(),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
