import fs from "fs";
import path from "path";
import { pool } from "../db/pool";
import { env } from "../config/env";
import { UPLOADS_DIR } from "../middleware/upload";
import * as coursesRepo from "../repositories/courses.repo";
import * as topicsRepo from "../repositories/topics.repo";
import * as materialsRepo from "../repositories/materials.repo";
import { MaterialType } from "../types";

// Usage: tsx src/scripts/import-materials-folder.ts [folder-path]
// Scans a flat folder of PDFs/images (manually saved from Telegram), figures out
// which topic (2-32, matched by Topic.sort_order) each file belongs to from its
// filename, copies the file into /uploads and creates a Material row.

const DEFAULT_FOLDER = "C:\\Users\\zdani\\OneDrive\\Desktop\\материалы";
const COURSE_SLUG = "history-full";
const ADDITIONAL_TOPIC_TITLE = "Додаткові матеріали";

// Files whose names don't encode a topic number (screenshots saved with a hash name).
const IMAGE_OVERRIDES: Record<string, { topic: number; title: string }> = {
  "686e29f1e308f69496b91de4.png": { topic: 2, title: "Таблиця: кіммерійці, скіфи, сармати" },
  "686e29f4e308f69496b91e19.jpg": { topic: 3, title: "Схема: князі Русі-України" },
  "686e29f8e308f69496b91f1e.jpg": { topic: 7, title: "Таблиця: козацькі повстання кінця XVI — першої половини XVII ст." },
  "686e29f8e308f69496b91f9c.png": { topic: 9, title: "Таблиця: гетьмани розділеної України (Руїна)" },
  "686e2a01e308f69496b921bf.jpg": { topic: 21, title: "Таблиця: універсали Центральної Ради" },
};

function guessType(filename: string): MaterialType {
  const lower = filename.toLowerCase();
  if (lower.includes("шпаргал") || lower.includes("шпор")) return "shpargalka";
  if (lower.includes("конспект")) return "conspect";
  return "other";
}

function parseTopicNumbers(filename: string): number[] | null {
  const range = filename.match(/\((\d{1,2})\s*-\s*(\d{1,2})\s*тем/i);
  if (range) {
    const from = Number(range[1]);
    const to = Number(range[2]);
    const nums: number[] = [];
    for (let n = from; n <= to; n++) nums.push(n);
    return nums;
  }
  const wordFirst = filename.match(/тема\.?\s*(\d{1,2})/i);
  if (wordFirst) return [Number(wordFirst[1])];
  const numberFirst = filename.match(/(\d{1,2})\s*тема/i);
  if (numberFirst) return [Number(numberFirst[1])];
  return null;
}

function copyIntoUploads(sourcePath: string, filename: string): string {
  const destPath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(destPath)) {
    fs.copyFileSync(sourcePath, destPath);
  }
  return `${env.serverUrl}/uploads/${encodeURIComponent(filename)}`;
}

async function main() {
  const folder = process.argv[2] || DEFAULT_FOLDER;

  const course = await coursesRepo.findCourseBySlug(COURSE_SLUG);
  if (!course) throw new Error(`Course "${COURSE_SLUG}" not found`);

  const topics = await topicsRepo.listTopicsByCourse(course.id);
  const topicByN = new Map(topics.map((t) => [t.sort_order, t]));

  let additionalTopic = topics.find((t) => t.title === ADDITIONAL_TOPIC_TITLE) ?? null;
  async function getAdditionalTopic() {
    if (!additionalTopic) {
      additionalTopic = await topicsRepo.createTopic(course!.id, ADDITIONAL_TOPIC_TITLE, "", -2);
      console.log(`+ topic: ${ADDITIONAL_TOPIC_TITLE}`);
    }
    return additionalTopic;
  }

  const materialsCache = new Map<number, Awaited<ReturnType<typeof materialsRepo.listMaterialsByTopic>>>();
  async function getMaterials(topicId: number) {
    if (!materialsCache.has(topicId)) {
      materialsCache.set(topicId, await materialsRepo.listMaterialsByTopic(topicId));
    }
    return materialsCache.get(topicId)!;
  }

  async function addMaterial(topicId: number, type: MaterialType, title: string, url: string) {
    const existing = await getMaterials(topicId);
    if (existing.some((m) => m.title === title)) {
      console.log(`  = skip (already exists): ${title}`);
      return;
    }
    const created = await materialsRepo.createMaterial(topicId, type, title, url, existing.length);
    existing.push(created);
    console.log(`  + ${type}: ${title}`);
  }

  const files = fs
    .readdirSync(folder)
    .filter((f) => fs.statSync(path.join(folder, f)).isFile());

  for (const file of files) {
    const sourcePath = path.join(folder, file);
    const ext = path.extname(file);
    const baseName = path.basename(file, ext).replace(/\s+/g, " ").trim();

    if (IMAGE_OVERRIDES[file]) {
      const { topic: n, title } = IMAGE_OVERRIDES[file];
      const topic = topicByN.get(n);
      if (!topic) {
        console.warn(`! topic ${n} not found for override ${file}`);
        continue;
      }
      const url = copyIntoUploads(sourcePath, file);
      await addMaterial(topic.id, "other", title, url);
      continue;
    }

    const nums = parseTopicNumbers(baseName);
    const type = guessType(baseName);
    const url = copyIntoUploads(sourcePath, file);

    if (!nums) {
      const topic = await getAdditionalTopic();
      await addMaterial(topic.id, type, baseName, url);
      continue;
    }

    for (const n of nums) {
      const topic = topicByN.get(n);
      if (!topic) {
        console.warn(`! topic ${n} not found for file ${file}`);
        continue;
      }
      await addMaterial(topic.id, type, baseName, url);
    }
  }

  console.log("Import complete.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
