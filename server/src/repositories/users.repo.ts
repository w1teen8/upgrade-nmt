import { pool } from "../db/pool";
import { User } from "../types";

export async function createUser(email: string, passwordHash: string): Promise<User> {
  const { rows } = await pool.query<User>(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *`,
    [email.toLowerCase(), passwordHash]
  );
  return rows[0];
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const { rows } = await pool.query<User>(`SELECT * FROM users WHERE email = $1`, [
    email.toLowerCase(),
  ]);
  return rows[0] ?? null;
}

export async function findUserById(id: number): Promise<User | null> {
  const { rows } = await pool.query<User>(`SELECT * FROM users WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function markUserVerified(userId: number): Promise<void> {
  await pool.query(`UPDATE users SET is_verified = TRUE WHERE id = $1`, [userId]);
}

export async function countUsers(): Promise<number> {
  const { rows } = await pool.query<{ count: number }>(`SELECT COUNT(*)::int AS count FROM users`);
  return rows[0].count;
}

export async function searchUsersByEmail(query: string): Promise<User[]> {
  const { rows } = await pool.query<User>(
    `SELECT * FROM users WHERE email ILIKE $1 ORDER BY created_at DESC LIMIT 20`,
    [`%${query}%`]
  );
  return rows;
}
