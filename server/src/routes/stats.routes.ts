import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import * as statsController from "../controllers/stats.controller";

const router = Router();

router.get("/", asyncHandler(statsController.getPublicStats));

export default router;
