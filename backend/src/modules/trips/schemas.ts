import { z } from "zod";

export const createTripSchema = z.object({
  vehicleId: z.string().min(1),
  driverId: z.string().min(1),
  origin: z.string().min(1),
  destination: z.string().min(1),
  cargoWeightKg: z.number().positive(),
  plannedDistanceKm: z.number().nonnegative().optional(),
  revenue: z.number().nonnegative().optional(),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;

export const completeTripSchema = z.object({
  finalOdometerKm: z.number().nonnegative().optional(),
  fuelConsumedLiters: z.number().nonnegative().optional(),
  fuelCost: z.number().nonnegative().optional(),
});

export type CompleteTripInput = z.infer<typeof completeTripSchema>;
