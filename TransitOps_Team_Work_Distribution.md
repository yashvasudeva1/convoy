# TransitOps Hackathon - Team Work Distribution

## Project Stack

-   Frontend: Next.js, Tailwind CSS, shadcn/ui, React Hook Form,
    TanStack Query, Recharts
-   Backend: Node.js + Express/NestJS
-   Database: PostgreSQL + Prisma ORM
-   Authentication: JWT + RBAC

------------------------------------------------------------------------

# 👨‍💻 Member 1 --- Backend (Fleet & User Management)

## Responsibilities

Owns all master-data modules and authentication.

### 1. Authentication & RBAC

-   JWT Authentication
-   Login API
-   Password hashing
-   Role-Based Access Control (RBAC)
-   Seed demo users:
    -   Fleet Manager
    -   Dispatcher
    -   Safety Officer
    -   Financial Analyst

### 2. Database Models

Implement: - Users - Roles - Vehicles - Drivers - MaintenanceLogs

### 3. Vehicle Module

-   Vehicle CRUD
-   Unique Registration Number validation
-   Vehicle Status management
    -   Available
    -   On Trip
    -   In Shop
    -   Retired

### 4. Driver Module

-   Driver CRUD
-   License Expiry validation
-   Safety Score
-   Driver Status management
    -   Available
    -   On Trip
    -   Off Duty
    -   Suspended

### 5. Maintenance Module

-   Create Maintenance Record
-   Close Maintenance Record
-   Automatic status updates:
    -   Available → In Shop
    -   In Shop → Available

### APIs

``` text
POST /login

GET /vehicles
POST /vehicles
PUT /vehicles/:id
DELETE /vehicles/:id

GET /drivers
POST /drivers
PUT /drivers/:id
DELETE /drivers/:id

POST /maintenance
PATCH /maintenance/:id/close
```

### Deliverables Checklist

-   [ ] Authentication working
-   [ ] RBAC implemented
-   [ ] Vehicle CRUD complete
-   [ ] Driver CRUD complete
-   [ ] Maintenance workflow complete
-   [ ] Vehicle status automation working

------------------------------------------------------------------------

# 👨‍💻 Member 2 --- Backend (Trips, Fuel, Analytics & Business Rules)

## Responsibilities

Owns the transport workflow and business logic.

### 1. Trip Module

-   Create Trip
-   Dispatch Trip
-   Complete Trip
-   Cancel Trip

### 2. Business Rule Engine

Implement validations: - Vehicle must be Available - Vehicle must not be
In Shop - Vehicle must not be Retired - Driver must be Available -
Driver must not be Suspended - Driver license must not be expired -
Cargo Weight ≤ Vehicle Capacity - Vehicle cannot already be On Trip -
Driver cannot already be On Trip

### 3. Automatic Status Changes

Dispatch: - Vehicle → On Trip - Driver → On Trip

Complete: - Vehicle → Available - Driver → Available

Cancel: - Vehicle → Available - Driver → Available

### 4. Fuel & Expense Module

-   Fuel Logs
-   Expense Logs
-   Total Operational Cost calculation

### 5. Dashboard & Analytics APIs

Return: - Active Vehicles - Available Vehicles - Vehicles in
Maintenance - Active Trips - Pending Trips - Drivers On Duty - Fleet
Utilization - Fuel Efficiency - Operational Cost - Vehicle ROI

### APIs

``` text
POST /trips
PATCH /trips/:id/dispatch
PATCH /trips/:id/complete
PATCH /trips/:id/cancel

POST /fuel
POST /expense

GET /dashboard
GET /analytics
```

### Deliverables Checklist

-   [ ] Trip lifecycle complete
-   [ ] Business rules enforced
-   [ ] Status transitions automated
-   [ ] Fuel & Expense module complete
-   [ ] Dashboard APIs complete
-   [ ] Analytics calculations complete

------------------------------------------------------------------------

# 👩‍🎨 Member 3 --- Frontend (Complete UI)

## Responsibilities

Owns the complete user interface and user experience.

### Pages

#### Authentication

-   Login Page

#### Dashboard

-   KPI Cards
-   Fleet Overview
-   Charts
-   Recent Trips

#### Vehicle Management

-   Vehicle Table
-   Add/Edit/Delete Vehicle
-   Search & Filters

#### Driver Management

-   Driver Table
-   Status Badges
-   License Expiry Indicators

#### Trip Management

-   Create Trip Form
-   Dispatch Trip
-   Complete Trip
-   Cancel Trip
-   Validation Messages

#### Maintenance

-   Maintenance List
-   Create Maintenance
-   Close Maintenance

#### Fuel & Expenses

-   Fuel Log Form
-   Expense Form
-   Tables

#### Analytics

-   Fleet Utilization Chart
-   Fuel Efficiency Chart
-   Cost Breakdown
-   ROI Chart

### UI Stack

-   Next.js
-   Tailwind CSS
-   shadcn/ui
-   React Hook Form
-   TanStack Query
-   Recharts

### Deliverables Checklist

-   [ ] Responsive UI
-   [ ] Login page
-   [ ] Dashboard
-   [ ] Vehicle pages
-   [ ] Driver pages
-   [ ] Trip pages
-   [ ] Maintenance pages
-   [ ] Fuel & Expense pages
-   [ ] Analytics pages
-   [ ] API integration ready

------------------------------------------------------------------------

# Development Timeline

## Hour 0--2

### Member 1

-   Database setup
-   Authentication
-   Vehicle CRUD
-   Driver CRUD

### Member 2

-   Trip schema
-   Trip APIs
-   Business rule implementation

### Member 3

-   Project setup
-   Layout
-   Login page
-   Dashboard skeleton
-   Routing

------------------------------------------------------------------------

## Hour 2--4

### Member 1

-   Maintenance module
-   Status APIs

### Member 2

-   Fuel & Expense APIs
-   Dashboard aggregation APIs

### Member 3

-   Vehicle pages
-   Driver pages
-   Trip pages
-   Maintenance pages

------------------------------------------------------------------------

## Hour 4--6

### Member 1

-   Backend testing
-   Bug fixes

### Member 2

-   Analytics calculations
-   Complete remaining business rules

### Member 3

-   Connect frontend with backend
-   Charts
-   UI polish

------------------------------------------------------------------------

## Hour 6--8 (Entire Team)

-   End-to-end integration
-   Seed demo data
-   Bug fixing
-   Optional AI enhancement
-   Deployment
-   Demo rehearsal

------------------------------------------------------------------------

# Before Coding (30-Minute Team Sync)

Agree on: 1. Database schema 2. API request/response formats 3. Enum
values (Vehicle, Driver, Trip statuses) 4. Git branching strategy

Recommended branches:

``` text
main
backend-fleet
backend-trips
frontend
```
