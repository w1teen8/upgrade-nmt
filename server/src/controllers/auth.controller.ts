import { Request, Response } from "express";
import {
  createUser,
  findUserByEmail,
  findUserById,
  markUserVerified,
} from "../repositories/users.repo";
import {
  createVerificationToken,
  findValidToken,
  markTokenUsed,
} from "../repositories/verificationTokens.repo";
import { hashPassword, comparePassword } from "../services/password.service";
import {
  generateVerificationToken,
  verificationExpiry,
  signAuthToken,
} from "../services/token.service";
import { sendVerificationEmail } from "../services/email.service";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const resendAttempts = new Map<string, number>();
const RESEND_COOLDOWN_MS = 60_000;

export async function register(req: Request, res: Response) {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "INVALID_EMAIL" });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "PASSWORD_TOO_SHORT" });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: "EMAIL_TAKEN" });
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser(email, passwordHash);

  const token = generateVerificationToken();
  await createVerificationToken(user.id, token, verificationExpiry());
  await sendVerificationEmail(user.email, token);

  return res.status(201).json({
    message: "Реєстрація успішна. Перевірте пошту, щоб підтвердити акаунт.",
  });
}

export async function verifyEmail(req: Request, res: Response) {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  if (!token) {
    return res.status(400).json({ error: "MISSING_TOKEN" });
  }

  const record = await findValidToken(token);
  if (!record) {
    return res.status(400).json({ error: "TOKEN_INVALID_OR_EXPIRED" });
  }

  await markUserVerified(record.user_id);
  await markTokenUsed(record.id);

  return res.json({ message: "Email підтверджено. Тепер ви можете увійти." });
}

export async function resendVerification(req: Request, res: Response) {
  const { email } = req.body ?? {};
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "INVALID_EMAIL" });
  }

  const key = email.toLowerCase();
  const last = resendAttempts.get(key) ?? 0;
  if (Date.now() - last < RESEND_COOLDOWN_MS) {
    return res.status(429).json({ error: "TOO_MANY_REQUESTS" });
  }
  resendAttempts.set(key, Date.now());

  const user = await findUserByEmail(email);
  if (user && !user.is_verified) {
    const token = generateVerificationToken();
    await createVerificationToken(user.id, token, verificationExpiry());
    await sendVerificationEmail(user.email, token);
  }

  return res.json({ message: "Якщо акаунт існує і не підтверджений, лист надіслано." });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "INVALID_CREDENTIALS" });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: "INVALID_CREDENTIALS" });
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "INVALID_CREDENTIALS" });
  }

  if (!user.is_verified) {
    return res.status(403).json({ error: "EMAIL_NOT_VERIFIED" });
  }

  const token = signAuthToken({ sub: user.id, role: user.role });
  return res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role },
  });
}

export async function me(req: Request, res: Response) {
  const user = await findUserById(req.user!.sub);
  if (!user) {
    return res.status(404).json({ error: "NOT_FOUND" });
  }
  return res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    is_verified: user.is_verified,
  });
}
