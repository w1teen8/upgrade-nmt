import { pool } from "../db/pool";
import { Topic } from "../types";

export async function listTopicsByCourse(courseId: number): Promise<Topic[]> {
  const { rows } = await pool.query<Topic>(
    `SELECT * FROM topics WHERE course_id = $1 ORDER BY sort_order ASC`,
    [courseId]
  );
  return rows;
}

export async function findTopicById(id: number): Promise<Topic | null> {
  const { rows } = await pool.query<Topic>(`SELECT * FROM topics WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function createTopic(
  courseId: number,
  title: string,
  description: string,
  sortOrder: number
): Promise<Topic> {
  const { rows } = await pool.query<Topic>(
    `INSERT INTO topics (course_id, title, description, sort_order) VALUES ($1, $2, $3, $4) RETURNING *`,
    [courseId, title, description, sortOrder]
  );
  return rows[0];
}

export async function updateTopic(
  id: number,
  fields: Partial<Pick<Topic, "title" | "description" | "sort_order">>
): Promise<Topic | null> {
  const keys = Object.keys(fields);
  if (keys.length === 0) return findTopicById(id);
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
  const values = keys.map((k) => (fields as Record<string, unknown>)[k]);
  const { rows } = await pool.query<Topic>(
    `UPDATE topics SET ${setClause}, updated_at = now() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return rows[0] ?? null;
}

export async function deleteTopic(id: number): Promise<void> {
  await pool.query(`DELETE FROM topics WHERE id = $1`, [id]);
}
