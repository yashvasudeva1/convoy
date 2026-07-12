import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";
import { CreateExpenseLogInput } from "./schemas";

export async function createExpenseLog(input: CreateExpenseLogInput) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: input.vehicleId },
  });
  if (!vehicle) throw new AppError("Vehicle not found", 404);

  if (input.tripId) {
    const trip = await prisma.trip.findUnique({ where: { id: input.tripId } });
    if (!trip) throw new AppError("Trip not found", 404);
  }

  return prisma.expenseLog.create({
    data: {
      vehicleId: input.vehicleId,
      tripId: input.tripId,
      category: input.category,
      amount: input.amount,
      description: input.description,
    },
  });
}

export async function listExpenseLogs() {
  return prisma.expenseLog.findMany({ orderBy: { loggedAt: "desc" } });
}

export async function totalOperationalCost() {
  const [fuelAgg, expenseAgg] = await Promise.all([
    prisma.fuelLog.aggregate({ _sum: { cost: true } }),
    prisma.expenseLog.aggregate({ _sum: { amount: true } }),
  ]);
  const fuelCost = fuelAgg._sum.cost ?? 0;
  const expenseCost = expenseAgg._sum.amount ?? 0;
  return {
    fuelCost,
    expenseCost,
    totalOperationalCost: fuelCost + expenseCost,
  };
}
