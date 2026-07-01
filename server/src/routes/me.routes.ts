import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth } from "../middleware/auth";
import { myCourses } from "../controllers/courses.controller";

const router = Router();

router.get("/courses", requireAuth, asyncHandler(myCourses));

export default router;
