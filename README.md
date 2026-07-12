# TransitOps (Convoy)

Smart transport operations platform — vehicle, driver, dispatch, maintenance, fuel/expense, and analytics management with role-based access control.

Built for the TransitOps hackathon by a 3-person team: Fleet/User Management (auth, vehicles, drivers, maintenance), Trips/Fuel/Expense/Analytics, and the frontend UI.

## Stack

- **Frontend:** Next.js (App Router) + Tailwind CSS + TanStack Query + React Hook Form + Recharts
- **Backend:** Express + TypeScript
- **Database:** PostgreSQL via Prisma ORM (pinned to v6.19.3 — do not upgrade to Prisma 7, it drops `datasource.url` support from `schema.prisma`)
- **Auth:** JWT + bcrypt, RBAC middleware (`FLEET_MANAGER`, `DISPATCHER`, `SAFETY_OFFICER`, `FINANCIAL_ANALYST`)

## Repo layout

```
backend/    Express API, Prisma schema + migrations, seed script
frontend/   Next.js app (all pages under app/(app)/*, login at app/login)
```

## Prerequisites

- Node.js 18+
- A Postgres database — either a hosted instance (e.g. Supabase) or a local one via Docker:
  ```
  docker run -d --name transitops-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=transitops -p 5432:5432 postgres:16
  ```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and set `DATABASE_URL` — either your local Docker Postgres, or the team's shared hosted database (ask a teammate for the connection string; it is intentionally not committed to this repo).

```bash
npx prisma migrate deploy   # applies schema (safe to re-run)
npm run prisma:seed         # idempotent — creates demo roles/users/vehicles/drivers if missing
npm run dev                 # starts the API on http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000 by default
npm run dev                  # starts the app on http://localhost:3000
```

Open **http://localhost:3000** — it redirects to `/login`.

## Demo accounts

All seeded accounts share the password `password123`. The login screen has one-click buttons for each of these.

| Role | Email |
|---|---|
| Fleet Manager | `fleet.manager@transitops.dev` |
| Dispatcher | `dispatcher@transitops.dev` |
| Safety Officer | `safety.officer@transitops.dev` |
| Financial Analyst | `financial.analyst@transitops.dev` |

## Business rules enforced

- Vehicle registration numbers and driver license numbers are unique.
- Retired / In Shop vehicles and Suspended / license-expired drivers are excluded from trip dispatch.
- A vehicle or driver already on a trip cannot be double-booked.
- Cargo weight is validated against vehicle capacity.
- Dispatch → Complete/Cancel and Maintenance open/close atomically flip vehicle/driver status (wrapped in Prisma `$transaction`s, so there is no partial-state window).

## Known limitations

- Vehicle Type, Odometer, Acquisition Cost, Driver License Category, Contact Number, and Trip Planned Distance are not modeled — the schema tracks a reduced field set relative to the original spec.
- "Vehicle ROI" is computed as a cost-efficiency proxy (`completed trips / operational cost`), since there is no revenue or acquisition-cost tracking to support the literal ROI formula.
- The topbar search box (`frontend/lib/searchindex.ts`) uses static placeholder data, not live API results.
- The Settings page has no backend — changes are not persisted.
