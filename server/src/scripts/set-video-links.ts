import { pool } from "../db/pool";

type Pair = { titleQuery: string; url: string };

function parseArgs(argv: string[]): { pairs: Pair[]; apply: boolean } {
  const apply = argv.includes("--apply");
  const pairs: Pair[] = [];
  for (const arg of argv) {
    if (arg.startsWith("--")) continue;
    const sep = arg.indexOf("=");
    if (sep === -1) throw new Error(`Bad pair (expected "<title>=<url>"): ${arg}`);
    const titleQuery = arg.slice(0, sep).trim();
    const url = arg.slice(sep + 1).trim();
    if (!titleQuery || !url) throw new Error(`Bad pair (empty part): ${arg}`);
    pairs.push({ titleQuery, url });
  }
  return { pairs, apply };
}

async function main() {
  const { pairs, apply } = parseArgs(process.argv.slice(2));
  if (pairs.length === 0) {
    console.log(
      'Usage: npm run set:video -- "<title substring>=<new url>" [...] [--apply]\n' +
        "Without --apply the script only shows what would change."
    );
    await pool.end();
    return;
  }

  let changed = 0;
  for (const { titleQuery, url } of pairs) {
    const { rows } = await pool.query<{ id: number; title: string; url: string; topic: string }>(
      `SELECT m.id, m.title, m.url, t.title AS topic
         FROM materials m
         JOIN topics t ON t.id = m.topic_id
        WHERE m.type = 'video' AND m.title ILIKE '%' || $1 || '%'
        ORDER BY m.id`,
      [titleQuery]
    );

    if (rows.length === 0) {
      console.log(`NO_MATCH: "${titleQuery}"`);
      continue;
    }

    for (const r of rows) {
      console.log(`${apply ? "UPDATE" : "WOULD UPDATE"} #${r.id} [${r.topic}] ${r.title}`);
      if (apply) {
        await pool.query(`UPDATE materials SET url = $2, updated_at = now() WHERE id = $1`, [r.id, url]);
        changed++;
      }
    }
  }

  console.log(apply ? `DONE: updated ${changed} material(s)` : "DRY RUN: nothing was written");
  await pool.end();
}

main().catch((e) => {
  console.error("SET_VIDEO_LINKS_ERROR:", e.message);
  process.exit(1);
});
