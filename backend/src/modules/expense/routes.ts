import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { createExpenseLogSchema } from "./schemas";
import { createExpenseLog, listExpenseLogs } from "./service";

export const expenseRouter = Router();

expenseRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await listExpenseLogs());
  })
);

expenseRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createExpenseLogSchema.parse(req.body);
    const log = await createExpenseLog(input);
    res.status(201).json(log);
  })
);
