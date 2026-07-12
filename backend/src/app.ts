import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/auth.routes";
import { vehicleRouter } from "./modules/vehicles/vehicle.routes";
import { driverRouter } from "./modules/drivers/driver.routes";
import { maintenanceRouter } from "./modules/maintenance/maintenance.routes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(authRouter);
  app.use("/vehicles", vehicleRouter);
  app.use("/drivers", driverRouter);
  app.use("/maintenance", maintenanceRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
