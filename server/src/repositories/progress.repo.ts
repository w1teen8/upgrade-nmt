import { pool } from "../db/pool";

export async function listDoneMaterialIds(userId: number, topicIds: number[]): Promise<number[]> {
  if (topicIds.length === 0) return [];
  const { rows } = await pool.query<{ material_id: number }>(
    `SELECT mp.material_id FROM material_progress mp
     JOIN materials m ON m.id = mp.material_id
     WHERE mp.user_id = $1 AND m.topic_id = ANY($2::int[])`,
    [userId, topicIds]
  );
  return rows.map((r) => r.material_id);
}

export async function setMaterialDone(userId: number, materialId: number, done: boolean): Promise<void> {
  if (done) {
    await pool.query(
      `INSERT INTO material_progress (user_id, material_id) VALUES ($1, $2)
       ON CONFLICT (user_id, material_id) DO NOTHING`,
      [userId, materialId]
    );
  } else {
    await pool.query(`DELETE FROM material_progress WHERE user_id = $1 AND material_id = $2`, [
      userId,
      materialId,
    ]);
  }
}

export async function listCompletedTopicIds(userId: number, topicIds: number[]): Promise<number[]> {
  if (topicIds.length === 0) return [];
  const { rows } = await pool.query<{ topic_id: number }>(
    `SELECT topic_id FROM topic_progress WHERE user_id = $1 AND topic_id = ANY($2::int[])`,
    [userId, topicIds]
  );
  return rows.map((r) => r.topic_id);
}

export async function setTopicCompleted(userId: number, topicId: number, completed: boolean): Promise<void> {
  if (completed) {
    await pool.query(
      `INSERT INTO topic_progress (user_id, topic_id) VALUES ($1, $2)
       ON CONFLICT (user_id, topic_id) DO NOTHING`,
      [userId, topicId]
    );
  } else {
    await pool.query(`DELETE FROM topic_progress WHERE user_id = $1 AND topic_id = $2`, [
      userId,
      topicId,
    ]);
  }
}
