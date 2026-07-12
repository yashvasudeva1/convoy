import { Driver, DriverStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/db";
import { AppError } from "../../middleware/errorHandler";

interface DriverInput {
  name: string;
  licenseNumber: string;
  licenseExpiry: Date;
  safetyScore?: number;
  status?: DriverStatus;
}

function withLicenseStatus(driver: Driver) {
  return {
    ...driver,
    isLicenseExpired: driver.licenseExpiry.getTime() < Date.now(),
  };
}

function assertNotAvailableWithExpiredLicense(status: DriverStatus, licenseExpiry: Date) {
  if (status === "AVAILABLE" && licenseExpiry.getTime() < Date.now()) {
    throw new AppError(
      400,
      `Cannot set driver to Available: license expired on ${licenseExpiry.toISOString().slice(0, 10)}. Use OFF_DUTY or SUSPENDED instead.`
    );
  }
}

export async function listDrivers(status?: DriverStatus) {
  const drivers = await prisma.driver.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return drivers.map(withLicenseStatus);
}

export async function getDriver(id: string) {
  const driver = await prisma.driver.findUnique({ where: { id } });
  if (!driver) {
    throw new AppError(404, "Driver not found");
  }
  return withLicenseStatus(driver);
}

export async function createDriver(input: DriverInput) {
  assertNotAvailableWithExpiredLicense(input.status ?? "AVAILABLE", input.licenseExpiry);

  try {
    const driver = await prisma.driver.create({ data: input });
    return withLicenseStatus(driver);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new AppError(409, "A driver with this license number already exists");
    }
    throw err;
  }
}

export async function updateDriver(id: string, input: Partial<DriverInput>) {
  const existing = await prisma.driver.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, "Driver not found");
  }

  const resolvedStatus = input.status ?? existing.status;
  const resolvedLicenseExpiry = input.licenseExpiry ?? existing.licenseExpiry;
  assertNotAvailableWithExpiredLicense(resolvedStatus, resolvedLicenseExpiry);

  try {
    const driver = await prisma.driver.update({ where: { id }, data: input });
    return withLicenseStatus(driver);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new AppError(409, "A driver with this license number already exists");
    }
    throw err;
  }
}

export async function deleteDriver(id: string) {
  const existing = await prisma.driver.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, "Driver not found");
  }

  await prisma.driver.delete({ where: { id } });
}
