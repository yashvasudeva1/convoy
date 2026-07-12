import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { createTripSchema } from "./schemas";
import {
  cancelTrip,
  completeTrip,
  createTrip,
  dispatchTrip,
  listTrips,
} from "./service";

export const tripsRouter = Router();

tripsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const trips = await listTrips();
    res.json(trips);
  })
);

tripsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createTripSchema.parse(req.body);
    const trip = await createTrip(input);
    res.status(201).json(trip);
  })
);

tripsRouter.patch(
  "/:id/dispatch",
  asyncHandler(async (req, res) => {
    const trip = await dispatchTrip(req.params.id);
    res.json(trip);
  })
);

tripsRouter.patch(
  "/:id/complete",
  asyncHandler(async (req, res) => {
    const trip = await completeTrip(req.params.id);
    res.json(trip);
  })
);

tripsRouter.patch(
  "/:id/cancel",
  asyncHandler(async (req, res) => {
    const trip = await cancelTrip(req.params.id);
    res.json(trip);
  })
);
