import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/routes";
import { tripsRouter } from "./modules/trips/routes";
import { fuelRouter } from "./modules/fuel/routes";
import { expenseRouter } from "./modules/expense/routes";
import { dashboardRouter, analyticsRouter } from "./modules/analytics/routes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/login", authRouter);
  app.use("/trips", tripsRouter);
  app.use("/fuel", fuelRouter);
  app.use("/expense", expenseRouter);
  app.use("/dashboard", dashboardRouter);
  app.use("/analytics", analyticsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
