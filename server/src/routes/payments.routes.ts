import { Router } from "express";
import express from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { requireAuth } from "../middleware/auth";
import * as paymentsController from "../controllers/payments.controller";

const router = Router();

router.post("/liqpay/create", requireAuth, asyncHandler(paymentsController.createPayment));
router.post(
  "/liqpay/webhook",
  express.urlencoded({ extended: false }),
  asyncHandler(paymentsController.liqpayWebhook)
);
router.get("/status/:orderId", requireAuth, asyncHandler(paymentsController.paymentStatus));

export default router;
