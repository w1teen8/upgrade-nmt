import { apiFetch } from "./client";

export interface LiqPayForm {
  data: string;
  signature: string;
  orderId: string;
  checkoutUrl: string;
}

export function createPayment(courseId: number) {
  return apiFetch<LiqPayForm>("/api/payments/liqpay/create", {
    method: "POST",
    body: { courseId },
  });
}

export function paymentStatus(orderId: string) {
  return apiFetch<{ status: string; courseId: number }>(`/api/payments/status/${orderId}`);
}
