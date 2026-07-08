import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth } from "../middleware/auth";
import * as progressController from "../controllers/progress.controller";

const router = Router();
router.use(requireAuth);

router.post("/materials/:id/progress", asyncHandler(progressController.setMaterialProgress));
router.post("/topics/:id/progress", asyncHandler(progressController.setTopicProgress));

export default router;
