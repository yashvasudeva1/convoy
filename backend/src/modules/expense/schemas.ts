import { z } from "zod";

export const createExpenseLogSchema = z.object({
  vehicleId: z.string().min(1),
  tripId: z.string().min(1).optional(),
  category: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().optional(),
});

export type CreateExpenseLogInput = z.infer<typeof createExpenseLogSchema>;
