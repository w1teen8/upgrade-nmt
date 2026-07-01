import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth } from "../middleware/auth";
import * as coursesController from "../controllers/courses.controller";

const router = Router();

router.get("/", asyncHandler(coursesController.listCourses));
router.get("/:slug", asyncHandler(coursesController.getCourse));
router.get("/:slug/content", requireAuth, asyncHandler(coursesController.getCourseContent));

export default router;
