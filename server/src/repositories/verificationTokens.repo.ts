import { pool } from "../db/pool";

export interface VerificationToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  used_at: Date | null;
}

export async function createVerificationToken(
  userId: number,
  token: string,
  expiresAt: Date
): Promise<void> {
  await pool.query(
    `INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );
}

export async function findValidToken(token: string): Promise<VerificationToken | null> {
  const { rows } = await pool.query<VerificationToken>(
    `SELECT * FROM email_verification_tokens
     WHERE token = $1 AND used_at IS NULL AND expires_at > now()`,
    [token]
  );
  return rows[0] ?? null;
}

export async function markTokenUsed(id: number): Promise<void> {
  await pool.query(`UPDATE email_verification_tokens SET used_at = now() WHERE id = $1`, [id]);
}
