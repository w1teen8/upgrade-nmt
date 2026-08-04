import fs from "fs";
import path from "path";
import { pool } from "../db/pool";
import { uploadToR2 } from "../lib/r2";
import * as coursesRepo from "../repositories/courses.repo";
import * as topicsRepo from "../repositories/topics.repo";
import * as materialsRepo from "../repositories/materials.repo";
import { MaterialType, Topic } from "../types";

// Usage: tsx src/scripts/import-materials-folder.ts [--dry-run]
// One-off import of the four material folders prepared on this machine
// (history-full topic PDFs, ukrainian-full topic PDFs, and two turbo-course
// "day workbook" folders) into R2 + the materials table. --dry-run prints
// the file -> topic mapping without touching R2 or the DB.

const DRY_RUN = process.argv.includes("--dry-run");

const ADDITIONAL_TOPIC_TITLE = "Додаткові матеріали";

const FOLDERS = {
  historyFull: "C:\\Users\\Daniil\\Desktop\\upgrade-nmt\\Materials",
  ukrainianFull: "C:\\Users\\Daniil\\Desktop\\upgrade-nmt\\Materials Ukranian Language",
  ukrainianTurbo: "C:\\Users\\Daniil\\Desktop\\upgrade-nmt\\UpRush ukr",
  historyTurbo: "C:\\Users\\Daniil\\Desktop\\upgrade-nmt\\UpRush ist",
};

// ---------- shared helpers ----------

function guessType(name: string): MaterialType {
  const l = name.toLowerCase();
  if (l.includes("шпаргал") || l.includes("шпарал") || l.includes("шпагал") || l.includes("шпор")) return "shpargalka";
  if (l.includes("конспект")) return "conspect";
  if (l.includes("тест")) return "test";
  return "other";
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[ʼ’']/g, "")
    .split(/[^\p{L}]+/u)
    .filter((t) => t.length > 2);
}

function rootsMatch(a: string, b: string): boolean {
  const len = Math.min(a.length, b.length, 8);
  if (len < 4) return a === b;
  return a.slice(0, len) === b.slice(0, len);
}

function listFiles(folder: string): string[] {
  return fs.readdirSync(folder).filter((f) => fs.statSync(path.join(folder, f)).isFile());
}

async function uploadFile(sourcePath: string, courseSlug: string, filename: string): Promise<string> {
  const key = `materials/${courseSlug}/${filename}`;
  if (DRY_RUN) return `[dry-run] ${key}`;
  const buffer = fs.readFileSync(sourcePath);
  return uploadToR2(key, buffer, filename);
}

function makeTopicCache(course: { id: number }, topics: Topic[]) {
  const materialsCache = new Map<number, Awaited<ReturnType<typeof materialsRepo.listMaterialsByTopic>>>();
  async function getMaterials(topicId: number) {
    if (!materialsCache.has(topicId)) {
      materialsCache.set(topicId, DRY_RUN ? [] : await materialsRepo.listMaterialsByTopic(topicId));
    }
    return materialsCache.get(topicId)!;
  }
  async function addMaterial(topicId: number, topicLabel: string, type: MaterialType, title: string, url: string) {
    const existing = await getMaterials(topicId);
    if (existing.some((m) => m.title === title)) {
      console.log(`  = skip (already exists) [${topicLabel}]: ${title}`);
      return;
    }
    if (DRY_RUN) {
      console.log(`  + ${type} [${topicLabel}]: ${title} -> ${url}`);
      existing.push({ id: -1, topic_id: topicId, type, title, url, sort_order: existing.length });
      return;
    }
    const created = await materialsRepo.createMaterial(topicId, type, title, url, existing.length);
    existing.push(created);
    console.log(`  + ${type} [${topicLabel}]: ${title}`);
  }
  return { addMaterial };
}

let dryRunTopicIdSeq = -1;

async function getOrCreateTopic(
  course: { id: number },
  topics: Topic[],
  title: string,
  sortOrder: number
): Promise<Topic> {
  let topic = topics.find((t) => t.title === title);
  if (!topic) {
    if (DRY_RUN) {
      topic = { id: dryRunTopicIdSeq--, course_id: course.id, title, description: "", sort_order: sortOrder };
    } else {
      topic = await topicsRepo.createTopic(course.id, title, "", sortOrder);
    }
    topics.push(topic);
    console.log(`+ topic: ${title}`);
  }
  return topic;
}

// ---------- history-full: files carry an explicit topic number ----------

const HISTORY_IMAGE_OVERRIDES: Record<string, { topic: number; title: string }> = {
  "686e29f1e308f69496b91de4.png": { topic: 2, title: "Таблиця: кіммерійці, скіфи, сармати" },
  "686e29f4e308f69496b91e19.jpg": { topic: 3, title: "Схема: князі Русі-України" },
  "686e29f8e308f69496b91f1e.jpg": { topic: 7, title: "Таблиця: козацькі повстання кінця XVI — першої половини XVII ст." },
  "686e29f8e308f69496b91f9c.png": { topic: 9, title: "Таблиця: гетьмани розділеної України (Руїна)" },
  "686e2a01e308f69496b921bf.jpg": { topic: 21, title: "Таблиця: універсали Центральної Ради" },
};

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

async function importHistoryFull(folder: string) {
  console.log(`\n=== history-full <- ${folder} ===`);
  const course = await coursesRepo.findCourseBySlug("history-full");
  if (!course) throw new Error('Course "history-full" not found');

  const topics = await topicsRepo.listTopicsByCourse(course.id);
  const topicByN = new Map(topics.map((t) => [t.sort_order, t]));
  const { addMaterial } = makeTopicCache(course, topics);

  async function additionalTopic() {
    return getOrCreateTopic(course!, topics, ADDITIONAL_TOPIC_TITLE, -2);
  }

  for (const file of listFiles(folder)) {
    const sourcePath = path.join(folder, file);
    const ext = path.extname(file);
    const baseName = path.basename(file, ext).replace(/\s+/g, " ").trim();

    if (HISTORY_IMAGE_OVERRIDES[file]) {
      const { topic: n, title } = HISTORY_IMAGE_OVERRIDES[file];
      const topic = topicByN.get(n);
      if (!topic) {
        console.warn(`! topic ${n} not found for override ${file}`);
        continue;
      }
      const url = await uploadFile(sourcePath, "history-full", file);
      await addMaterial(topic.id, topic.title, "other", title, url);
      continue;
    }

    const nums = parseTopicNumbers(baseName);
    const type = guessType(baseName);
    const url = await uploadFile(sourcePath, "history-full", file);

    if (!nums) {
      const topic = await additionalTopic();
      await addMaterial(topic.id, topic.title, type, baseName, url);
      continue;
    }

    for (const n of nums) {
      const topic = topicByN.get(n);
      if (!topic) {
        console.warn(`! topic ${n} not found for file ${file}`);
        continue;
      }
      await addMaterial(topic.id, topic.title, type, baseName, url);
    }
  }
}

// ---------- ukrainian-full: files carry a keyword phrase, matched fuzzily against topic titles ----------

const UKRAINIAN_IMAGE_OVERRIDES: Record<string, { keyword: string; title: string }> = {
  "68ebeeb133f5cbdb576c4bb9.png": { keyword: "дієприкметник", title: "Таблиця: дієприкметник (активний/пасивний стан, правильно/неправильно)" },
};

function extractUkrKeyword(baseName: string): string | null {
  const m = baseName.match(/^(конспект|шпаргалка|шпаралка|шпагалка|шпора)[\s_.:-]*/i);
  let rest = m ? baseName.slice(m[0].length) : baseName;
  rest = rest.replace(/\(\d+\)\s*$/, "");
  rest = rest.replace(/^[\s_.:,-]+|[\s_.:,-]+$/g, "");
  return rest || null;
}

function findBestTopicByKeyword(topics: Topic[], keyword: string): { topic: Topic | null; reason: string } {
  const fileTokens = [...new Set(tokenize(keyword))];
  if (fileTokens.length === 0) return { topic: null, reason: "no tokens" };

  let bestScore = 0;
  let bestTopics: Topic[] = [];
  for (const topic of topics) {
    if (topic.title === ADDITIONAL_TOPIC_TITLE) continue;
    const topicTokens = tokenize(topic.title);
    const score = fileTokens.filter((ft) => topicTokens.some((tt) => rootsMatch(ft, tt))).length;
    if (score > bestScore) {
      bestScore = score;
      bestTopics = [topic];
    } else if (score === bestScore && score > 0) {
      bestTopics.push(topic);
    }
  }

  const ratio = bestScore / fileTokens.length;
  if (bestTopics.length === 1 && ratio >= 0.6) {
    return { topic: bestTopics[0], reason: `score ${bestScore}/${fileTokens.length}` };
  }
  if (bestTopics.length > 1) {
    return { topic: null, reason: `ambiguous between: ${bestTopics.map((t) => t.title).join(" | ")}` };
  }
  return { topic: null, reason: `best score ${bestScore}/${fileTokens.length} (below threshold)` };
}

async function importUkrainianFull(folder: string) {
  console.log(`\n=== ukrainian-full <- ${folder} ===`);
  const course = await coursesRepo.findCourseBySlug("ukrainian-full");
  if (!course) throw new Error('Course "ukrainian-full" not found');

  const topics = await topicsRepo.listTopicsByCourse(course.id);
  const { addMaterial } = makeTopicCache(course, topics);

  async function additionalTopic() {
    return getOrCreateTopic(course!, topics, ADDITIONAL_TOPIC_TITLE, -2);
  }

  for (const file of listFiles(folder)) {
    const sourcePath = path.join(folder, file);
    const ext = path.extname(file);
    const baseName = path.basename(file, ext).replace(/\s+/g, " ").trim();

    if (UKRAINIAN_IMAGE_OVERRIDES[file]) {
      const { keyword, title } = UKRAINIAN_IMAGE_OVERRIDES[file];
      const { topic, reason } = findBestTopicByKeyword(topics, keyword);
      const url = await uploadFile(sourcePath, "ukrainian-full", file);
      if (!topic) {
        console.warn(`! override ${file}: ${reason}`);
        const fallback = await additionalTopic();
        await addMaterial(fallback.id, fallback.title, "other", title, url);
        continue;
      }
      await addMaterial(topic.id, topic.title, "other", title, url);
      continue;
    }

    const keyword = extractUkrKeyword(baseName);
    const type = guessType(baseName);
    const url = await uploadFile(sourcePath, "ukrainian-full", file);

    if (!keyword) {
      const fallback = await additionalTopic();
      await addMaterial(fallback.id, fallback.title, type, baseName, url);
      continue;
    }

    const { topic, reason } = findBestTopicByKeyword(topics, keyword);
    if (!topic) {
      console.warn(`! ${file}: ${reason} -> Додаткові матеріали`);
      const fallback = await additionalTopic();
      await addMaterial(fallback.id, fallback.title, type, baseName, url);
      continue;
    }
    await addMaterial(topic.id, topic.title, type, baseName, url);
  }
}

// ---------- turbo courses: "День N" workbooks + bonus reference PDFs ----------

function extractDay(baseName: string): number | null {
  const m = baseName.match(/день\s*(\d+)/i);
  return m ? Number(m[1]) : null;
}

function cleanTurboTitle(baseName: string): string {
  let s = baseName;
  s = s.replace(/день\s*\d+/i, "");
  s = s.replace(/[ІI]\s*TURBO\s*BOOM/gi, "");
  s = s.replace(/[ІI][\s_]*TURBO/gi, "");
  s = s.replace(/\(\d+\)\s*$/, "");
  s = s.replace(/_+/g, " ");
  s = s.replace(/\s{2,}/g, " ").trim();
  s = s.replace(/^[.,;:\-\s]+|[.,;:\-\s]+$/g, "");
  return s || "Матеріал";
}

async function importTurboFolder(folder: string, courseSlug: string) {
  console.log(`\n=== ${courseSlug} <- ${folder} ===`);
  const course = await coursesRepo.findCourseBySlug(courseSlug);
  if (!course) throw new Error(`Course "${courseSlug}" not found`);

  const topics = await topicsRepo.listTopicsByCourse(course.id);
  const { addMaterial } = makeTopicCache(course, topics);

  async function dayTopic(n: number) {
    return getOrCreateTopic(course!, topics, `День ${n}`, n);
  }
  async function additionalTopic() {
    return getOrCreateTopic(course!, topics, ADDITIONAL_TOPIC_TITLE, -2);
  }

  for (const file of listFiles(folder)) {
    const sourcePath = path.join(folder, file);
    const ext = path.extname(file);
    const baseName = path.basename(file, ext).replace(/\s+/g, " ").trim();

    const day = extractDay(baseName);
    const title = cleanTurboTitle(baseName);
    const type = guessType(baseName);
    const url = await uploadFile(sourcePath, courseSlug, file);

    const topic = day !== null ? await dayTopic(day) : await additionalTopic();
    await addMaterial(topic.id, topic.title, type, title, url);
  }
}

// ---------- main ----------

async function main() {
  if (DRY_RUN) console.log("*** DRY RUN: no files uploaded, no DB writes ***");

  await importHistoryFull(FOLDERS.historyFull);
  await importUkrainianFull(FOLDERS.ukrainianFull);
  await importTurboFolder(FOLDERS.ukrainianTurbo, "ukrainian-turbo");
  await importTurboFolder(FOLDERS.historyTurbo, "history-turbo");

  console.log("\nImport complete.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
