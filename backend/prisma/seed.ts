import { PrismaClient, RoleName } from "@prisma/client";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

const DEMO_USERS: Array<{ name: string; email: string; password: string; role: RoleName }> = [
  { name: "Fleet Manager", email: "fleet.manager@transitops.demo", password: "password123", role: "FLEET_MANAGER" },
  { name: "Dispatcher", email: "dispatcher@transitops.demo", password: "password123", role: "DISPATCHER" },
  { name: "Safety Officer", email: "safety.officer@transitops.demo", password: "password123", role: "SAFETY_OFFICER" },
  { name: "Financial Analyst", email: "financial.analyst@transitops.demo", password: "password123", role: "FINANCIAL_ANALYST" },
];

async function main() {
  const roleNames: RoleName[] = ["FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"];

  const roles = new Map<RoleName, string>();
  for (const name of roleNames) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    roles.set(name, role.id);
  }

  for (const demoUser of DEMO_USERS) {
    const passwordHash = await hashPassword(demoUser.password);
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

  console.log("Seeded roles and demo users:");
  for (const demoUser of DEMO_USERS) {
    console.log(`  ${demoUser.role.padEnd(20)} ${demoUser.email}  (password: ${demoUser.password})`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
