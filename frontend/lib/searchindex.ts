/* search data */
export interface SearchResult {
  type: 'vehicle' | 'driver' | 'trip' | 'page';
  label: string;
  sub: string;
  href: string;
}

export const searchIndex: SearchResult[] = [
  // vehicles
  { type: 'vehicle', label: 'VAN-05',    sub: 'GJ01AB4521 · Available', href: '/fleet' },
  { type: 'vehicle', label: 'TRUCK-11',  sub: 'GJ01AB9981 · On Trip',   href: '/fleet' },
  { type: 'vehicle', label: 'MINI-03',   sub: 'GJ01AB1120 · In Shop',   href: '/fleet' },
  { type: 'vehicle', label: 'VAN-09',    sub: 'GJ01AB0087 · Retired',   href: '/fleet' },
  { type: 'vehicle', label: 'TRUCK-04',  sub: 'GJ01CD3312 · Available', href: '/fleet' },
  { type: 'vehicle', label: 'MINI-08',   sub: 'GJ01CD7721 · Available', href: '/fleet' },
  // drivers
  { type: 'driver',  label: 'Alex',      sub: 'DL-88213 · Available',   href: '/drivers' },
  { type: 'driver',  label: 'John',      sub: 'DL-44120 · Suspended',   href: '/drivers' },
  { type: 'driver',  label: 'Priya',     sub: 'DL-77031 · On Trip',     href: '/drivers' },
  { type: 'driver',  label: 'Suresh',    sub: 'DL-90045 · Off Duty',    href: '/drivers' },
  { type: 'driver',  label: 'Kavita',    sub: 'DL-55310 · Available',   href: '/drivers' },
  // trips
  { type: 'trip',    label: 'TR001',     sub: 'VAN-05 / Alex · Dispatched', href: '/trips' },
  { type: 'trip',    label: 'TR002',     sub: 'TRK-12 / John · Completed',  href: '/trips' },
  { type: 'trip',    label: 'TR003',     sub: 'MINI-08 / Priya · Dispatched',href: '/trips' },
  { type: 'trip',    label: 'TR004',     sub: 'TRUCK-04 / Suresh · Draft',   href: '/trips' },
  // pages
  { type: 'page',    label: 'Dashboard',      sub: 'Fleet overview and KPIs',           href: '/dashboard' },
  { type: 'page',    label: 'Fleet',          sub: 'Vehicle registry and management',   href: '/fleet' },
  { type: 'page',    label: 'Drivers',        sub: 'Driver profiles and safety scores', href: '/drivers' },
  { type: 'page',    label: 'Trips',          sub: 'Trip dispatcher and live board',    href: '/trips' },
  { type: 'page',    label: 'Maintenance',    sub: 'Service logs and vehicle shop',     href: '/maintenance' },
  { type: 'page',    label: 'Fuel & Expenses',sub: 'Fuel logs and cost tracking',       href: '/fuel' },
  { type: 'page',    label: 'Analytics',      sub: 'Reports, charts and cost efficiency', href: '/analytics' },
  { type: 'page',    label: 'Settings',       sub: 'General config and RBAC',           href: '/settings' },
];

export function runSearch(query: string): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return searchIndex.filter(
    r =>
      r.label.toLowerCase().includes(q) ||
      r.sub.toLowerCase().includes(q)
  ).slice(0, 8);
}
