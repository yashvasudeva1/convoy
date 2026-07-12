import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { asyncHandler } from "../../utils/asyncHandler";
import { createExpenseLogSchema } from "./schemas";
import { createExpenseLog, listExpenseLogs } from "./service";

export const expenseRouter = Router();

expenseRouter.use(authenticate);

expenseRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await listExpenseLogs());
  })
);

expenseRouter.post(
  "/",
  requireRole("FLEET_MANAGER", "FINANCIAL_ANALYST"),
  asyncHandler(async (req, res) => {
    const input = createExpenseLogSchema.parse(req.body);
    const log = await createExpenseLog(input);
    res.status(201).json(log);
  })
);
