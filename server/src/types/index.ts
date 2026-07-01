export type UserRole = "student" | "admin";
export type MaterialType = "conspect" | "shpargalka" | "test" | "video" | "other";
export type PurchaseStatus = "pending" | "paid" | "failed" | "cancelled";

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: UserRole;
  is_verified: boolean;
  created_at: Date;
}

export interface Course {
  id: number;
  slug: string;
  title: string;
  subject: string;
  course_type: string;
  description: string;
  price_uah: string;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Topic {
  id: number;
  course_id: number;
  title: string;
  description: string;
  sort_order: number;
}

export interface Material {
  id: number;
  topic_id: number;
  type: MaterialType;
  title: string;
  url: string;
  sort_order: number;
}

export interface Purchase {
  id: number;
  user_id: number;
  course_id: number;
  order_id: string;
  amount_uah: string;
  status: PurchaseStatus;
  liqpay_payment_id: string | null;
  raw_callback: unknown;
  created_at: Date;
  paid_at: Date | null;
}

export interface AuthTokenPayload {
  sub: number;
  role: UserRole;
}
