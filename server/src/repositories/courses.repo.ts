import { pool } from "../db/pool";
import { Course } from "../types";

export async function listActiveCourses(): Promise<Course[]> {
  const { rows } = await pool.query<Course>(
    `SELECT * FROM courses WHERE is_active = TRUE ORDER BY sort_order ASC`
  );
  return rows;
}

export async function findCourseBySlug(slug: string): Promise<Course | null> {
  const { rows } = await pool.query<Course>(`SELECT * FROM courses WHERE slug = $1`, [slug]);
  return rows[0] ?? null;
}

export async function findCourseById(id: number): Promise<Course | null> {
  const { rows } = await pool.query<Course>(`SELECT * FROM courses WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function listAllCourses(): Promise<Course[]> {
  const { rows } = await pool.query<Course>(`SELECT * FROM courses ORDER BY sort_order ASC`);
  return rows;
}

export async function updateCourse(
  id: number,
  fields: Partial<Pick<Course, "title" | "description" | "price_uah" | "icon" | "is_active" | "sort_order">>
): Promise<Course | null> {
  const keys = Object.keys(fields);
  if (keys.length === 0) return findCourseById(id);
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
  const values = keys.map((k) => (fields as Record<string, unknown>)[k]);
  const { rows } = await pool.query<Course>(
    `UPDATE courses SET ${setClause}, updated_at = now() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return rows[0] ?? null;
}
