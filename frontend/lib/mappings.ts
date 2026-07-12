/* display <-> backend enum mappings */
import { ApiDriverStatus, ApiMaintenanceStatus, ApiRole, ApiTripStatus, ApiVehicleStatus } from './types';

export const ROLE_TO_LABEL: Record<ApiRole, string> = {
  FLEET_MANAGER: 'Fleet Manager',
  DISPATCHER: 'Dispatcher',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
};

export const VEHICLE_STATUS_TO_LABEL: Record<ApiVehicleStatus, string> = {
  AVAILABLE: 'Available',
  ON_TRIP: 'On Trip',
  IN_SHOP: 'In Shop',
  RETIRED: 'Retired',
};

export const LABEL_TO_VEHICLE_STATUS: Record<string, ApiVehicleStatus> = {
  Available: 'AVAILABLE',
  'On Trip': 'ON_TRIP',
  'In Shop': 'IN_SHOP',
  Retired: 'RETIRED',
};

export const DRIVER_STATUS_TO_LABEL: Record<ApiDriverStatus, string> = {
  AVAILABLE: 'Available',
  ON_TRIP: 'On Trip',
  OFF_DUTY: 'Off Duty',
  SUSPENDED: 'Suspended',
};

export const LABEL_TO_DRIVER_STATUS: Record<string, ApiDriverStatus> = {
  Available: 'AVAILABLE',
  'On Trip': 'ON_TRIP',
  'Off Duty': 'OFF_DUTY',
  Suspended: 'SUSPENDED',
};

export const TRIP_STATUS_TO_LABEL: Record<ApiTripStatus, string> = {
  PENDING: 'Draft',
  DISPATCHED: 'Dispatched',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const MAINTENANCE_STATUS_TO_LABEL: Record<ApiMaintenanceStatus, string> = {
  OPEN: 'In Shop',
  CLOSED: 'Completed',
};
