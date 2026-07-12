import { prisma } from "../../config/db";

export async function getDashboard() {
  const [
    totalVehicles,
    availableVehicles,
    onTripVehicles,
    inShopVehicles,
    activeTrips,
    pendingTrips,
    driversOnDuty,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: "AVAILABLE" } }),
    prisma.vehicle.count({ where: { status: "ON_TRIP" } }),
    prisma.vehicle.count({ where: { status: "IN_SHOP" } }),
    prisma.trip.count({ where: { status: "DISPATCHED" } }),
    prisma.trip.count({ where: { status: "PENDING" } }),
    prisma.driver.count({ where: { status: "ON_TRIP" } }),
  ]);

  return {
    activeVehicles: totalVehicles,
    availableVehicles,
    vehiclesInMaintenance: inShopVehicles,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    onTripVehicles,
  };
}

// Fleet utilization: share of the fleet currently on a trip.
export async function getFleetUtilization() {
  const [total, onTrip] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: "ON_TRIP" } }),
  ]);
  return total === 0 ? 0 : (onTrip / total) * 100;
}

// Fuel efficiency (km/L) per vehicle, derived from consecutive odometer readings on fuel logs.
export async function getFuelEfficiency() {
  const vehicles = await prisma.vehicle.findMany({
    include: { fuelLogs: { orderBy: { loggedAt: "asc" } } },
  });

  const perVehicle = vehicles.map((v) => {
    const readings = v.fuelLogs
      .map((f) => f.odometer)
      .filter((o): o is number => o != null);
    const totalLiters = v.fuelLogs.reduce((sum, f) => sum + f.liters, 0);
    const distance =
      readings.length >= 2 ? readings[readings.length - 1] - readings[0] : 0;
    const kmPerLiter = totalLiters > 0 && distance > 0 ? distance / totalLiters : 0;
    return { vehicleId: v.id, distance, totalLiters, kmPerLiter };
  });

  const totalDistance = perVehicle.reduce((s, v) => s + v.distance, 0);
  const totalLiters = perVehicle.reduce((s, v) => s + v.totalLiters, 0);
  const fleetKmPerLiter =
    totalLiters > 0 && totalDistance > 0 ? totalDistance / totalLiters : 0;

  return { fleetKmPerLiter, perVehicle };
}

export async function getOperationalCost() {
  const [fuelAgg, expenseAgg] = await Promise.all([
    prisma.fuelLog.aggregate({ _sum: { cost: true } }),
    prisma.expenseLog.aggregate({ _sum: { amount: true } }),
  ]);
  const fuelCost = fuelAgg._sum.cost ?? 0;
  const expenseCost = expenseAgg._sum.amount ?? 0;
  return { fuelCost, expenseCost, totalOperationalCost: fuelCost + expenseCost };
}

// ROI proxy: completed trips per unit of operational cost incurred by the vehicle.
// No revenue/fare model exists in the schema yet, so this is a cost-efficiency proxy, not true ROI.
export async function getVehicleROI() {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      trips: { where: { status: "COMPLETED" } },
      fuelLogs: true,
      expenseLogs: true,
    },
  });

  return vehicles.map((v) => {
    const completedTrips = v.trips.length;
    const cost =
      v.fuelLogs.reduce((s, f) => s + f.cost, 0) +
      v.expenseLogs.reduce((s, e) => s + e.amount, 0);
    const tripsPerCostUnit = cost > 0 ? completedTrips / cost : 0;
    return { vehicleId: v.id, completedTrips, cost, tripsPerCostUnit };
  });
}

export async function getAnalytics() {
  const [utilization, fuelEfficiency, operationalCost, vehicleROI] =
    await Promise.all([
      getFleetUtilization(),
      getFuelEfficiency(),
      getOperationalCost(),
      getVehicleROI(),
    ]);

  return {
    fleetUtilization: utilization,
    fuelEfficiency,
    operationalCost,
    vehicleROI,
  };
}
