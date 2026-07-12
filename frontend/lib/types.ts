/* backend API types */

export type ApiRole = 'FLEET_MANAGER' | 'DISPATCHER' | 'SAFETY_OFFICER' | 'FINANCIAL_ANALYST';
export type ApiVehicleStatus = 'AVAILABLE' | 'ON_TRIP' | 'IN_SHOP' | 'RETIRED';
export type ApiDriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'SUSPENDED';
export type ApiTripStatus = 'PENDING' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';
export type ApiMaintenanceStatus = 'OPEN' | 'CLOSED';

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: ApiRole;
}

export interface LoginResponse {
  token: string;
  user: ApiUser;
}

export interface ApiVehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  capacityKg: number;
  status: ApiVehicleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApiDriver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  safetyScore: number;
  status: ApiDriverStatus;
  isLicenseExpired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiMaintenanceLog {
  id: string;
  vehicleId: string;
  vehicle?: ApiVehicle;
  reason: string;
  notes: string | null;
  status: ApiMaintenanceStatus;
  openedAt: string;
  closedAt: string | null;
}

export interface ApiTrip {
  id: string;
  vehicleId: string;
  driverId: string;
  origin: string;
  destination: string;
  cargoWeightKg: number;
  status: ApiTripStatus;
  createdAt: string;
  dispatchedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
}

export interface ApiFuelLog {
  id: string;
  vehicleId: string;
  tripId: string | null;
  liters: number;
  cost: number;
  odometer: number | null;
  loggedAt: string;
}

export interface ApiExpenseLog {
  id: string;
  vehicleId: string;
  tripId: string | null;
  category: string;
  amount: number;
  description: string | null;
  loggedAt: string;
}

export interface ApiDashboard {
  activeVehicles: number;
  availableVehicles: number;
  vehiclesInMaintenance: number;
  activeTrips: number;
  pendingTrips: number;
  driversOnDuty: number;
  onTripVehicles: number;
}

export interface ApiAnalytics {
  fleetUtilization: number;
  fuelEfficiency: {
    fleetKmPerLiter: number;
    perVehicle: Array<{ vehicleId: string; distance: number; totalLiters: number; kmPerLiter: number }>;
  };
  operationalCost: { fuelCost: number; expenseCost: number; totalOperationalCost: number };
  vehicleROI: Array<{ vehicleId: string; completedTrips: number; cost: number; tripsPerCostUnit: number }>;
}
