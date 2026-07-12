import "dotenv/config";
import { PrismaClient, RoleName } from "@prisma/client";
import { hashPassword } from "../src/utils/password";

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

  console.log("Seeded roles and demo users:");
  for (const demoUser of DEMO_USERS) {
    console.log(`  ${demoUser.role.padEnd(20)} ${demoUser.email}  (password: ${DEMO_PASSWORD})`);
  }
  console.log("Seeded vehicles:", [vehicle1.registrationNumber, vehicle2.registrationNumber]);
  console.log("Seeded drivers:", [driver1.licenseNumber, driver2.licenseNumber]);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
