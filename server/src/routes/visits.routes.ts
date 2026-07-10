import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import * as visitsController from "../controllers/visits.controller";

const router = Router();

router.post("/", asyncHandler(visitsController.recordVisit));

export default router;
