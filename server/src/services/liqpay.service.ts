import crypto from "crypto";
import { env } from "../config/env";
import { Course } from "../types";

export interface LiqPayFormData {
  data: string;
  signature: string;
}

function sign(data: string): string {
  return crypto
    .createHash("sha1")
    .update(env.liqpayPrivateKey + data + env.liqpayPrivateKey)
    .digest("base64");
}

export function buildPaymentForm(course: Course, orderId: string): LiqPayFormData {
  const payload: Record<string, unknown> = {
    public_key: env.liqpayPublicKey,
    version: "3",
    action: "pay",
    amount: course.price_uah,
    currency: "UAH",
    description: course.title,
    order_id: orderId,
    result_url: `${env.appUrl}/#/payment/result?orderId=${orderId}`,
    server_url: `${env.serverUrl}/api/payments/liqpay/webhook`,
  };
  if (env.liqpaySandbox) {
    payload.sandbox = 1;
  }

  const data = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = sign(data);
  return { data, signature };
}

export function verifyCallback(data: string, signature: string): boolean {
  const expected = sign(data);
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

export interface LiqPayCallbackPayload {
  order_id: string;
  status: string;
  payment_id?: number;
  [key: string]: unknown;
}

export function decodeCallbackData(data: string): LiqPayCallbackPayload {
  return JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
}
