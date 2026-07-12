import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { asyncHandler } from "../../utils/asyncHandler";
import { createTripSchema } from "./schemas";
import {
  cancelTrip,
  completeTrip,
  createTrip,
  dispatchTrip,
  listTrips,
} from "./service";

export const tripsRouter = Router();

tripsRouter.use(authenticate);

tripsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const trips = await listTrips();
    res.json(trips);
  })
);

tripsRouter.post(
  "/",
  requireRole("FLEET_MANAGER", "DISPATCHER"),
  asyncHandler(async (req, res) => {
    const input = createTripSchema.parse(req.body);
    const trip = await createTrip(input);
    res.status(201).json(trip);
  })
);

tripsRouter.patch(
  "/:id/dispatch",
  requireRole("FLEET_MANAGER", "DISPATCHER"),
  asyncHandler(async (req, res) => {
    const trip = await dispatchTrip(req.params.id);
    res.json(trip);
  })
);

tripsRouter.patch(
  "/:id/complete",
  requireRole("FLEET_MANAGER", "DISPATCHER"),
  asyncHandler(async (req, res) => {
    const trip = await completeTrip(req.params.id);
    res.json(trip);
  })
);

tripsRouter.patch(
  "/:id/cancel",
  requireRole("FLEET_MANAGER", "DISPATCHER"),
  asyncHandler(async (req, res) => {
    const trip = await cancelTrip(req.params.id);
    res.json(trip);
  })
);
