// Deterministic dummy dataset for TransitOps demo/testing.
// Framework-agnostic (no Prisma imports) so it can be consumed by both
// the Prisma seed script and standalone report/PDF generators.

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rand = seededRandom(42);
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
function randInt(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function randFloat(min: number, max: number, decimals = 2) {
  const v = rand() * (max - min) + min;
  return Number(v.toFixed(decimals));
}
function daysAgo(d: number) {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000);
}

export type VehicleStatus = "AVAILABLE" | "ON_TRIP" | "IN_SHOP" | "RETIRED";
export type DriverStatus = "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "SUSPENDED";
export type TripStatus = "PENDING" | "DISPATCHED" | "COMPLETED" | "CANCELLED";
export type MaintenanceStatus = "OPEN" | "CLOSED";

export interface DummyVehicle {
  registrationNumber: string;
  make: string;
  model: string;
  type: string;
  capacityKg: number;
  odometerKm: number;
  acquisitionCost: number;
  region: string;
  status: VehicleStatus;
}

export interface DummyDriver {
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: Date;
  contactNumber: string;
  safetyScore: number;
  status: DriverStatus;
}

export interface DummyTrip {
  vehicleIdx: number;
  driverIdx: number;
  origin: string;
  destination: string;
  cargoWeightKg: number;
  plannedDistanceKm: number;
  finalOdometerKm: number | null;
  fuelConsumedLiters: number | null;
  revenue: number;
  status: TripStatus;
  createdAt: Date;
  dispatchedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
}

export interface DummyFuelLog {
  tripIdx: number | null;
  vehicleIdx: number;
  liters: number;
  cost: number;
  odometer: number;
  loggedAt: Date;
}

export interface DummyExpenseLog {
  tripIdx: number | null;
  vehicleIdx: number;
  category: string;
  amount: number;
  description: string;
  loggedAt: Date;
}

export interface DummyMaintenanceLog {
  vehicleIdx: number;
  reason: string;
  notes: string;
  cost: number;
  status: MaintenanceStatus;
  openedAt: Date;
  closedAt: Date | null;
}

const MAKES_MODELS: [string, string, string][] = [
  ["Tata", "Ace Gold", "Mini Truck"],
  ["Tata", "407 Gold", "Truck"],
  ["Tata", "Intra V30", "Pickup"],
  ["Tata", "Ultra 1518", "Truck"],
  ["Tata", "Winger", "Van"],
  ["Mahindra", "Bolero Pickup", "Pickup"],
  ["Mahindra", "Jeeto", "Mini Truck"],
  ["Mahindra", "Furio 7", "Truck"],
  ["Ashok Leyland", "Dost+", "Mini Truck"],
  ["Ashok Leyland", "Partner", "Truck"],
  ["Eicher", "Pro 2049", "Truck"],
  ["Eicher", "Pro 3015", "Truck"],
  ["Force", "Traveller", "Van"],
  ["Piaggio", "Ape Xtra", "Three-Wheeler"],
  ["BharatBenz", "914R", "Truck"],
];

const REGIONS = ["North", "South", "East", "West", "Central"];

const FIRST_NAMES = [
  "Ravi", "Priya", "Amit", "Sunita", "Vikram", "Anjali", "Suresh", "Kavita",
  "Manoj", "Deepa", "Arjun", "Neha", "Rajesh", "Pooja", "Sanjay",
];
const LAST_NAMES = [
  "Kumar", "Singh", "Sharma", "Patel", "Reddy", "Nair", "Gupta", "Iyer",
  "Verma", "Rao", "Mehta", "Joshi", "Chauhan", "Das", "Pillai",
];

const CITIES = [
  "Chennai", "Bengaluru", "Hyderabad", "Coimbatore", "Madurai", "Vijayawada",
  "Kochi", "Mysuru", "Pondicherry", "Trichy", "Salem", "Vellore", "Nellore",
  "Tirupati", "Mangaluru",
];

const EXPENSE_CATEGORIES = ["Toll", "Parking", "Traffic Fine", "Loading Labor", "Permit Fee", "Miscellaneous"];
const MAINTENANCE_REASONS = [
  "Engine oil change", "Brake pad replacement", "Tyre replacement",
  "Clutch repair", "AC servicing", "Suspension check", "Battery replacement",
  "General service", "Accident repair", "Electrical fault",
];

export function generateDummyData() {
  const vehicles: DummyVehicle[] = [];
  for (let i = 0; i < 15; i++) {
    const [make, model, type] = MAKES_MODELS[i];
    const stateCode = ["TN", "KA", "AP", "KL", "MH"][i % 5];
    const status: VehicleStatus =
      i % 11 === 0 ? "IN_SHOP" : i % 13 === 0 ? "RETIRED" : i % 4 === 0 ? "ON_TRIP" : "AVAILABLE";
    vehicles.push({
      registrationNumber: `${stateCode}-${String(10 + i).padStart(2, "0")}-${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(66 + (i % 25))}-${1000 + i * 37}`,
      make,
      model,
      type,
      capacityKg: [750, 1000, 1250, 1500, 2000, 3000][i % 6],
      odometerKm: randInt(5000, 150000),
      acquisitionCost: randInt(450000, 2200000),
      region: REGIONS[i % REGIONS.length],
      status,
    });
  }

  const drivers: DummyDriver[] = [];
  for (let i = 0; i < 15; i++) {
    const status: DriverStatus =
      i % 12 === 0 ? "SUSPENDED" : i % 9 === 0 ? "OFF_DUTY" : i % 4 === 0 ? "ON_TRIP" : "AVAILABLE";
    drivers.push({
      name: `${FIRST_NAMES[i]} ${LAST_NAMES[i]}`,
      licenseNumber: `DL-${["TN", "KA", "AP", "KL", "MH"][i % 5]}-${String(2000 + i).padStart(4, "0")}`,
      licenseCategory: i % 5 === 0 ? "HMV" : "LMV",
      licenseExpiry: new Date(2026 + (i % 4), (i * 2) % 12, 15),
      contactNumber: `9${randInt(100000000, 999999999)}`,
      safetyScore: randInt(60, 100),
      status,
    });
  }

  const trips: DummyTrip[] = [];
  for (let i = 0; i < 45; i++) {
    const vehicleIdx = i % vehicles.length;
    const driverIdx = i % drivers.length;
    const origin = pick(CITIES);
    let destination = pick(CITIES);
    while (destination === origin) destination = pick(CITIES);

    const statusRoll = i % 10;
    const status: TripStatus =
      statusRoll < 6 ? "COMPLETED" : statusRoll < 8 ? "DISPATCHED" : statusRoll < 9 ? "PENDING" : "CANCELLED";

    const plannedDistanceKm = randInt(80, 950);
    const createdAt = daysAgo(randInt(2, 90));
    const dispatchedAt = status === "PENDING" ? null : new Date(createdAt.getTime() + 3 * 60 * 60 * 1000);
    const completedAt =
      status === "COMPLETED"
        ? new Date((dispatchedAt as Date).getTime() + randInt(4, 30) * 60 * 60 * 1000)
        : null;
    const cancelledAt = status === "CANCELLED" ? new Date(createdAt.getTime() + 2 * 60 * 60 * 1000) : null;

    trips.push({
      vehicleIdx,
      driverIdx,
      origin,
      destination,
      cargoWeightKg: randInt(100, 2800),
      plannedDistanceKm,
      finalOdometerKm: status === "COMPLETED" ? randInt(5000, 150000) : null,
      fuelConsumedLiters: status === "COMPLETED" ? randFloat(15, 120, 1) : null,
      revenue: status === "CANCELLED" ? 0 : randInt(2500, 45000),
      status,
      createdAt,
      dispatchedAt,
      completedAt,
      cancelledAt,
    });
  }

  const fuelLogs: DummyFuelLog[] = [];
  for (let i = 0; i < 30; i++) {
    const tripIdx = i % 3 === 0 ? null : i % trips.length;
    const vehicleIdx = tripIdx !== null ? trips[tripIdx].vehicleIdx : i % vehicles.length;
    const liters = randFloat(10, 100, 1);
    fuelLogs.push({
      tripIdx,
      vehicleIdx,
      liters,
      cost: Number((liters * randFloat(92, 106, 2)).toFixed(2)),
      odometer: randInt(5000, 150000),
      loggedAt: daysAgo(randInt(1, 85)),
    });
  }

  const expenseLogs: DummyExpenseLog[] = [];
  for (let i = 0; i < 25; i++) {
    const tripIdx = i % 4 === 0 ? null : i % trips.length;
    const vehicleIdx = tripIdx !== null ? trips[tripIdx].vehicleIdx : i % vehicles.length;
    const category = EXPENSE_CATEGORIES[i % EXPENSE_CATEGORIES.length];
    expenseLogs.push({
      tripIdx,
      vehicleIdx,
      category,
      amount: randInt(100, 5000),
      description: `${category} - ${pick(CITIES)}`,
      loggedAt: daysAgo(randInt(1, 85)),
    });
  }

  const maintenanceLogs: DummyMaintenanceLog[] = [];
  for (let i = 0; i < 12; i++) {
    const status: MaintenanceStatus = i % 4 === 0 ? "OPEN" : "CLOSED";
    const openedAt = daysAgo(randInt(5, 120));
    maintenanceLogs.push({
      vehicleIdx: i % vehicles.length,
      reason: MAINTENANCE_REASONS[i % MAINTENANCE_REASONS.length],
      notes: `Routine check during ${MAINTENANCE_REASONS[i % MAINTENANCE_REASONS.length].toLowerCase()}`,
      cost: randInt(800, 45000),
      status,
      openedAt,
      closedAt: status === "CLOSED" ? new Date(openedAt.getTime() + randInt(1, 5) * 24 * 60 * 60 * 1000) : null,
    });
  }

  return { vehicles, drivers, trips, fuelLogs, expenseLogs, maintenanceLogs };
}
