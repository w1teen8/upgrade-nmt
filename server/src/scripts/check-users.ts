import { pool } from "../db/pool";

async function main() {
  const { rows } = await pool.query(
    "select id, email, role, is_verified, created_at from users order by id"
  );
  console.log("USERS_COUNT:", rows.length);
  for (const r of rows) {
    console.log(`- #${r.id} ${r.email} role=${r.role} verified=${r.is_verified} created=${r.created_at}`);
  }
  await pool.end();
}

main().catch((e) => {
  console.error("CHECK_USERS_ERROR:", e.message);
  process.exit(1);
});
