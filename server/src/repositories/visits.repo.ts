import { pool } from "../db/pool";

export async function recordVisit(sessionId: string) {
  await pool.query("INSERT INTO site_visits (session_id) VALUES ($1)", [sessionId]);
}

export async function getVisitStats() {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(DISTINCT session_id)::int AS unique_visitors,
      COUNT(*) FILTER (WHERE visited_at >= date_trunc('day', now()))::int AS today
    FROM site_visits
  `);
  return rows[0] as { total: number; unique_visitors: number; today: number };
}
