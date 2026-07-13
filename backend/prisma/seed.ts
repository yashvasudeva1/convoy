import "dotenv/config";
import { PrismaClient, RoleName } from "@prisma/client";
import { hashPassword } from "../src/utils/password";
import { generateDummyData } from "./dummyData";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "password123";

const DEMO_USERS: Array<{ name: string; email: string; role: RoleName }> = [
  { name: "Fleet Manager", email: "fleet.manager@transitops.demo", role: "FLEET_MANAGER" },
  { name: "Dispatcher", email: "dispatcher@transitops.demo", role: "DISPATCHER" },
  { name: "Safety Officer", email: "safety.officer@transitops.demo", role: "SAFETY_OFFICER" },
  { name: "Financial Analyst", email: "financial.analyst@transitops.demo", role: "FINANCIAL_ANALYST" },
];

async function main() {
  const roles = new Map<RoleName, string>();
  for (const roleName of Object.values(RoleName)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    roles.set(roleName, role.id);
  }

  const passwordHash = await hashPassword(DEMO_PASSWORD);
  for (const demoUser of DEMO_USERS) {
    await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {},
      create: {
        name: demoUser.name,
        email: demoUser.email,
        passwordHash,
        roleId: roles.get(demoUser.role)!,
      },
    });
  }

  const dummy = generateDummyData();

  const vehicleRecords = [];
  for (const v of dummy.vehicles) {
    vehicleRecords.push(
      await prisma.vehicle.upsert({
        where: { registrationNumber: v.registrationNumber },
        update: {},
        create: v,
      })
    );
  }

  const driverRecords = [];
  for (const d of dummy.drivers) {
    driverRecords.push(
      await prisma.driver.upsert({
        where: { licenseNumber: d.licenseNumber },
        update: {},
        create: d,
      })
    );
  }

  console.log("Seeded roles and demo users:");
  for (const demoUser of DEMO_USERS) {
    console.log(`  ${demoUser.role.padEnd(20)} ${demoUser.email}  (password: ${DEMO_PASSWORD})`);
  }
  console.log(`Seeded ${vehicleRecords.length} vehicles, ${driverRecords.length} drivers.`);

  const existingTripCount = await prisma.trip.count();
  if (existingTripCount >= dummy.trips.length) {
    console.log(`Skipping trip/fuel/expense/maintenance seed (already ${existingTripCount} trips present).`);
    return;
  }

  const tripRecords = [];
  for (const t of dummy.trips) {
    tripRecords.push(
      await prisma.trip.create({
        data: {
          vehicleId: vehicleRecords[t.vehicleIdx].id,
          driverId: driverRecords[t.driverIdx].id,
          origin: t.origin,
          destination: t.destination,
          cargoWeightKg: t.cargoWeightKg,
          plannedDistanceKm: t.plannedDistanceKm,
          finalOdometerKm: t.finalOdometerKm ?? undefined,
          fuelConsumedLiters: t.fuelConsumedLiters ?? undefined,
          revenue: t.revenue,
          status: t.status,
          createdAt: t.createdAt,
          dispatchedAt: t.dispatchedAt ?? undefined,
          completedAt: t.completedAt ?? undefined,
          cancelledAt: t.cancelledAt ?? undefined,
        },
      })
    );
  }
  console.log(`Seeded ${tripRecords.length} trips.`);

  let fuelCount = 0;
  for (const f of dummy.fuelLogs) {
    await prisma.fuelLog.create({
      data: {
        tripId: f.tripIdx !== null ? tripRecords[f.tripIdx].id : undefined,
        vehicleId: vehicleRecords[f.vehicleIdx].id,
        liters: f.liters,
        cost: f.cost,
        odometer: f.odometer,
        loggedAt: f.loggedAt,
      },
    });
    fuelCount++;
  }
  console.log(`Seeded ${fuelCount} fuel logs.`);

  let expenseCount = 0;
  for (const e of dummy.expenseLogs) {
    await prisma.expenseLog.create({
      data: {
        tripId: e.tripIdx !== null ? tripRecords[e.tripIdx].id : undefined,
        vehicleId: vehicleRecords[e.vehicleIdx].id,
        category: e.category,
        amount: e.amount,
        description: e.description,
        loggedAt: e.loggedAt,
      },
    });
    expenseCount++;
  }
  console.log(`Seeded ${expenseCount} expense logs.`);

  let maintenanceCount = 0;
  for (const m of dummy.maintenanceLogs) {
    await prisma.maintenanceLog.create({
      data: {
        vehicleId: vehicleRecords[m.vehicleIdx].id,
        reason: m.reason,
        notes: m.notes,
        cost: m.cost,
        status: m.status,
        openedAt: m.openedAt,
        closedAt: m.closedAt ?? undefined,
      },
    });
    maintenanceCount++;
  }
  console.log(`Seeded ${maintenanceCount} maintenance logs.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
