import { Request, Response } from "express";
import { findCourseById } from "../repositories/courses.repo";
import {
  createPendingPurchase,
  findPurchaseByOrderId,
  updatePurchaseStatus,
} from "../repositories/purchases.repo";
import { generateOrderId } from "../services/token.service";
import { buildPaymentForm, verifyCallback, decodeCallbackData } from "../services/liqpay.service";

export async function createPayment(req: Request, res: Response) {
  const courseId = Number(req.body?.courseId);
  if (!Number.isInteger(courseId)) {
    return res.status(400).json({ error: "INVALID_COURSE" });
  }

  const course = await findCourseById(courseId);
  if (!course || !course.is_active) {
    return res.status(404).json({ error: "NOT_FOUND" });
  }

  const orderId = generateOrderId();
  await createPendingPurchase(req.user!.sub, course.id, orderId, course.price_uah);

  const form = buildPaymentForm(course, orderId);
  return res.json({ ...form, orderId, checkoutUrl: "https://www.liqpay.ua/api/3/checkout" });
}

export async function liqpayWebhook(req: Request, res: Response) {
  const data = typeof req.body?.data === "string" ? req.body.data : "";
  const signature = typeof req.body?.signature === "string" ? req.body.signature : "";

  if (!data || !signature || !verifyCallback(data, signature)) {
    return res.status(403).send("invalid signature");
  }

  const payload = decodeCallbackData(data);
  const purchase = await findPurchaseByOrderId(payload.order_id);
  if (!purchase) {
    return res.status(200).send("ok");
  }

  if (["success", "sandbox"].includes(payload.status)) {
    await updatePurchaseStatus(
      payload.order_id,
      "paid",
      payload.payment_id ? String(payload.payment_id) : null,
      payload
    );
  } else if (["failure", "error", "reversed"].includes(payload.status)) {
    await updatePurchaseStatus(
      payload.order_id,
      "failed",
      payload.payment_id ? String(payload.payment_id) : null,
      payload
    );
  }

  return res.status(200).send("ok");
}

export async function paymentStatus(req: Request, res: Response) {
  const purchase = await findPurchaseByOrderId(req.params.orderId);
  if (!purchase || purchase.user_id !== req.user!.sub) {
    return res.status(404).json({ error: "NOT_FOUND" });
  }
  return res.json({ status: purchase.status, courseId: purchase.course_id });
}
