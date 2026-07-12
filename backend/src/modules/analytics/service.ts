import { Prisma } from "@prisma/client";
import { prisma } from "../../config/db";

export interface FleetFilters {
  type?: string;
  region?: string;
}

function vehicleWhere(filters: FleetFilters): Prisma.VehicleWhereInput {
  return {
    type: filters.type ?? undefined,
    region: filters.region ?? undefined,
  };
}

export async function getDashboard(filters: FleetFilters = {}) {
  const where = vehicleWhere(filters);

  const [
    totalVehicles,
    availableVehicles,
    onTripVehicles,
    inShopVehicles,
    activeTrips,
    pendingTrips,
    driversOnDuty,
  ] = await Promise.all([
    prisma.vehicle.count({ where }),
    prisma.vehicle.count({ where: { ...where, status: "AVAILABLE" } }),
    prisma.vehicle.count({ where: { ...where, status: "ON_TRIP" } }),
    prisma.vehicle.count({ where: { ...where, status: "IN_SHOP" } }),
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

// Fleet utilization: share of the (optionally filtered) fleet currently on a trip.
export async function getFleetUtilization(filters: FleetFilters = {}) {
  const where = vehicleWhere(filters);
  const [total, onTrip] = await Promise.all([
    prisma.vehicle.count({ where }),
    prisma.vehicle.count({ where: { ...where, status: "ON_TRIP" } }),
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

// Operational Cost = Fuel + Maintenance, per the spec formula. Other expenses (tolls, etc.)
// are tracked separately and surfaced but not folded into this headline total.
export async function getOperationalCost() {
  const [fuelAgg, maintenanceAgg, expenseAgg] = await Promise.all([
    prisma.fuelLog.aggregate({ _sum: { cost: true } }),
    prisma.maintenanceLog.aggregate({ _sum: { cost: true } }),
    prisma.expenseLog.aggregate({ _sum: { amount: true } }),
  ]);
  const fuelCost = fuelAgg._sum.cost ?? 0;
  const maintenanceCost = maintenanceAgg._sum.cost ?? 0;
  const otherExpenses = expenseAgg._sum.amount ?? 0;
  return {
    fuelCost,
    maintenanceCost,
    otherExpenses,
    totalOperationalCost: fuelCost + maintenanceCost,
  };
}

// Vehicle ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost, per vehicle.
export async function getVehicleROI() {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      trips: { where: { status: "COMPLETED" } },
      fuelLogs: true,
      maintenanceLogs: true,
    },
  });

  return vehicles.map((v) => {
    const revenue = v.trips.reduce((s, t) => s + t.revenue, 0);
    const fuelCost = v.fuelLogs.reduce((s, f) => s + f.cost, 0);
    const maintenanceCost = v.maintenanceLogs.reduce((s, m) => s + m.cost, 0);
    const roi =
      v.acquisitionCost > 0
        ? (revenue - (maintenanceCost + fuelCost)) / v.acquisitionCost
        : null;
    return {
      vehicleId: v.id,
      revenue,
      fuelCost,
      maintenanceCost,
      acquisitionCost: v.acquisitionCost,
      completedTrips: v.trips.length,
      roi,
    };
  });
}

export async function getAnalytics(filters: FleetFilters = {}) {
  const [utilization, fuelEfficiency, operationalCost, vehicleROI] =
    await Promise.all([
      getFleetUtilization(filters),
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
