import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { tripsRouter } from "./modules/trips/routes";
import { fuelRouter } from "./modules/fuel/routes";
import { expenseRouter } from "./modules/expense/routes";
import { dashboardRouter, analyticsRouter } from "./modules/analytics/routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/trips", tripsRouter);
app.use("/fuel", fuelRouter);
app.use("/expense", expenseRouter);
app.use("/dashboard", dashboardRouter);
app.use("/analytics", analyticsRouter);

app.use(errorHandler);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`Member 2 backend (trips/fuel/analytics) listening on :${port}`);
});
