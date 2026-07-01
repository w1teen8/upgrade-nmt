import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth } from "../middleware/auth";
import * as authController from "../controllers/auth.controller";

const router = Router();

router.post("/register", asyncHandler(authController.register));
router.get("/verify-email", asyncHandler(authController.verifyEmail));
router.post("/resend-verification", asyncHandler(authController.resendVerification));
router.post("/login", asyncHandler(authController.login));
router.get("/me", requireAuth, asyncHandler(authController.me));

export default router;
