import { pool } from "../db/pool";
import { Purchase, PurchaseStatus } from "../types";

export async function createPendingPurchase(
  userId: number,
  courseId: number,
  orderId: string,
  amountUah: string
): Promise<Purchase> {
  const { rows } = await pool.query<Purchase>(
    `INSERT INTO purchases (user_id, course_id, order_id, amount_uah, status)
     VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
    [userId, courseId, orderId, amountUah]
  );
  return rows[0];
}

export async function findPurchaseByOrderId(orderId: string): Promise<Purchase | null> {
  const { rows } = await pool.query<Purchase>(`SELECT * FROM purchases WHERE order_id = $1`, [
    orderId,
  ]);
  return rows[0] ?? null;
}

export async function updatePurchaseStatus(
  orderId: string,
  status: PurchaseStatus,
  liqpayPaymentId: string | null,
  rawCallback: unknown
): Promise<void> {
  const paidAtClause = status === "paid" ? ", paid_at = now()" : "";
  await pool.query(
    `UPDATE purchases SET status = $2, liqpay_payment_id = $3, raw_callback = $4${paidAtClause}
     WHERE order_id = $1`,
    [orderId, status, liqpayPaymentId, JSON.stringify(rawCallback)]
  );
}

export async function hasUserPaidForCourse(userId: number, courseId: number): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT 1 FROM purchases WHERE user_id = $1 AND course_id = $2 AND status = 'paid'`,
    [userId, courseId]
  );
  return rows.length > 0;
}

export async function listPaidCoursesForUser(userId: number): Promise<number[]> {
  const { rows } = await pool.query<{ course_id: number }>(
    `SELECT course_id FROM purchases WHERE user_id = $1 AND status = 'paid'`,
    [userId]
  );
  return rows.map((r) => r.course_id);
}

export async function listAllPurchases(): Promise<Purchase[]> {
  const { rows } = await pool.query<Purchase>(
    `SELECT * FROM purchases ORDER BY created_at DESC LIMIT 200`
  );
  return rows;
}

export async function grantManualAccess(
  userId: number,
  courseId: number,
  amountUah: string
): Promise<void> {
  const already = await hasUserPaidForCourse(userId, courseId);
  if (already) return;
  const orderId = `manual_${userId}_${courseId}_${Date.now()}`;
  await pool.query(
    `INSERT INTO purchases (user_id, course_id, order_id, amount_uah, status, paid_at)
     VALUES ($1, $2, $3, $4, 'paid', now())`,
    [userId, courseId, orderId, amountUah]
  );
}

export async function revokeAccess(userId: number, courseId: number): Promise<void> {
  await pool.query(
    `UPDATE purchases SET status = 'cancelled' WHERE user_id = $1 AND course_id = $2 AND status = 'paid'`,
    [userId, courseId]
  );
}
