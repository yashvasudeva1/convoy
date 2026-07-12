import "dotenv/config";
import { PrismaClient, RoleName } from "@prisma/client";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "password123";

const DEMO_USERS: { name: string; email: string; role: RoleName }[] = [
  { name: "Frank Fleet", email: "fleet.manager@transitops.dev", role: "FLEET_MANAGER" },
  { name: "Dana Dispatcher", email: "dispatcher@transitops.dev", role: "DISPATCHER" },
  { name: "Sam Safety", email: "safety.officer@transitops.dev", role: "SAFETY_OFFICER" },
  { name: "Fiona Finance", email: "financial.analyst@transitops.dev", role: "FINANCIAL_ANALYST" },
];

async function main() {
  for (const roleName of Object.values(RoleName)) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  const passwordHash = await hashPassword(DEMO_PASSWORD);
  for (const demoUser of DEMO_USERS) {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: demoUser.role } });
    await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {},
      create: {
        name: demoUser.name,
        email: demoUser.email,
        passwordHash,
        roleId: role.id,
      },
    });
  }

  const vehicle1 = await prisma.vehicle.upsert({
    where: { registrationNumber: "TN-01-AB-1234" },
    update: {},
    create: {
      registrationNumber: "TN-01-AB-1234",
      make: "Tata",
      model: "Ace Gold",
      capacityKg: 1000,
      status: "AVAILABLE",
    },
  });

  const vehicle2 = await prisma.vehicle.upsert({
    where: { registrationNumber: "TN-02-CD-5678" },
    update: {},
    create: {
      registrationNumber: "TN-02-CD-5678",
      make: "Ashok Leyland",
      model: "Dost+",
      capacityKg: 1500,
      status: "AVAILABLE",
    },
  });

  const driver1 = await prisma.driver.upsert({
    where: { licenseNumber: "DL-TN-0001" },
    update: {},
    create: {
      name: "Ravi Kumar",
      licenseNumber: "DL-TN-0001",
      licenseExpiry: new Date("2027-06-30"),
      safetyScore: 95,
      status: "AVAILABLE",
    },
  });

  const driver2 = await prisma.driver.upsert({
    where: { licenseNumber: "DL-TN-0002" },
    update: {},
    create: {
      name: "Priya Singh",
      licenseNumber: "DL-TN-0002",
      licenseExpiry: new Date("2027-03-15"),
      safetyScore: 88,
      status: "AVAILABLE",
    },
  });

  console.log("Seeded:", {
    vehicles: [vehicle1.registrationNumber, vehicle2.registrationNumber],
    drivers: [driver1.licenseNumber, driver2.licenseNumber],
    users: DEMO_USERS.map((u) => `${u.email} / ${DEMO_PASSWORD}`),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
