import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthTokenPayload } from "../types";

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.jwtSecret) as unknown as AuthTokenPayload;
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function verificationExpiry(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

export function generateOrderId(): string {
  return `pur_${crypto.randomBytes(12).toString("hex")}`;
}
