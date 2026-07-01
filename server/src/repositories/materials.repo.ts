import { pool } from "../db/pool";
import { Material } from "../types";

export async function listMaterialsByTopic(topicId: number): Promise<Material[]> {
  const { rows } = await pool.query<Material>(
    `SELECT * FROM materials WHERE topic_id = $1 ORDER BY sort_order ASC`,
    [topicId]
  );
  return rows;
}

export async function listMaterialsByTopicIds(topicIds: number[]): Promise<Material[]> {
  if (topicIds.length === 0) return [];
  const { rows } = await pool.query<Material>(
    `SELECT * FROM materials WHERE topic_id = ANY($1::int[]) ORDER BY sort_order ASC`,
    [topicIds]
  );
  return rows;
}

export async function findMaterialById(id: number): Promise<Material | null> {
  const { rows } = await pool.query<Material>(`SELECT * FROM materials WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function createMaterial(
  topicId: number,
  type: Material["type"],
  title: string,
  url: string,
  sortOrder: number
): Promise<Material> {
  const { rows } = await pool.query<Material>(
    `INSERT INTO materials (topic_id, type, title, url, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [topicId, type, title, url, sortOrder]
  );
  return rows[0];
}

export async function updateMaterial(
  id: number,
  fields: Partial<Pick<Material, "type" | "title" | "url" | "sort_order">>
): Promise<Material | null> {
  const keys = Object.keys(fields);
  if (keys.length === 0) return findMaterialById(id);
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
  const values = keys.map((k) => (fields as Record<string, unknown>)[k]);
  const { rows } = await pool.query<Material>(
    `UPDATE materials SET ${setClause}, updated_at = now() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return rows[0] ?? null;
}

export async function deleteMaterial(id: number): Promise<void> {
  await pool.query(`DELETE FROM materials WHERE id = $1`, [id]);
}
