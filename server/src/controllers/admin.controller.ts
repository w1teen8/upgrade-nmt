import crypto from "crypto";
import { Request, Response } from "express";
import { uploadToR2 } from "../lib/r2";
import * as coursesRepo from "../repositories/courses.repo";
import * as topicsRepo from "../repositories/topics.repo";
import * as materialsRepo from "../repositories/materials.repo";
import * as purchasesRepo from "../repositories/purchases.repo";
import * as usersRepo from "../repositories/users.repo";
import { hashPassword } from "../services/password.service";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generatePassword(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(10);
  let out = "";
  for (let i = 0; i < 10; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

const MATERIAL_TYPES = new Set(["conspect", "shpargalka", "test", "video", "other"]);

export async function listCourses(_req: Request, res: Response) {
  const courses = await coursesRepo.listAllCourses();
  return res.json(courses);
}

export async function updateCourse(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { title, description, price_uah, icon, is_active, sort_order } = req.body ?? {};
  const fields: Record<string, unknown> = {};
  if (typeof title === "string") fields.title = title;
  if (typeof description === "string") fields.description = description;
  if (price_uah !== undefined) fields.price_uah = price_uah;
  if (icon !== undefined) fields.icon = icon;
  if (typeof is_active === "boolean") fields.is_active = is_active;
  if (sort_order !== undefined) fields.sort_order = sort_order;

  const course = await coursesRepo.updateCourse(id, fields);
  if (!course) return res.status(404).json({ error: "NOT_FOUND" });
  return res.json(course);
}

export async function listTopics(req: Request, res: Response) {
  const courseId = Number(req.params.courseId);
  const topics = await topicsRepo.listTopicsByCourse(courseId);
  return res.json(topics);
}

export async function createTopic(req: Request, res: Response) {
  const courseId = Number(req.params.courseId);
  const { title, description, sort_order } = req.body ?? {};
  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "INVALID_TITLE" });
  }
  const topic = await topicsRepo.createTopic(
    courseId,
    title,
    typeof description === "string" ? description : "",
    Number.isInteger(sort_order) ? sort_order : 0
  );
  return res.status(201).json(topic);
}

export async function updateTopic(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { title, description, sort_order } = req.body ?? {};
  const fields: Record<string, unknown> = {};
  if (typeof title === "string") fields.title = title;
  if (typeof description === "string") fields.description = description;
  if (sort_order !== undefined) fields.sort_order = sort_order;

  const topic = await topicsRepo.updateTopic(id, fields);
  if (!topic) return res.status(404).json({ error: "NOT_FOUND" });
  return res.json(topic);
}

export async function deleteTopic(req: Request, res: Response) {
  await topicsRepo.deleteTopic(Number(req.params.id));
  return res.status(204).send();
}

export async function listMaterials(req: Request, res: Response) {
  const topicId = Number(req.params.topicId);
  const materials = await materialsRepo.listMaterialsByTopic(topicId);
  return res.json(materials);
}

export async function createMaterial(req: Request, res: Response) {
  const topicId = Number(req.params.topicId);
  const { type, title, url, sort_order } = req.body ?? {};
  if (typeof type !== "string" || !MATERIAL_TYPES.has(type)) {
    return res.status(400).json({ error: "INVALID_TYPE" });
  }
  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "INVALID_TITLE" });
  }
  if (typeof url !== "string" || !url.trim()) {
    return res.status(400).json({ error: "INVALID_URL" });
  }
  const material = await materialsRepo.createMaterial(
    topicId,
    type as never,
    title,
    url,
    Number.isInteger(sort_order) ? sort_order : 0
  );
  return res.status(201).json(material);
}

export async function updateMaterial(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { type, title, url, sort_order } = req.body ?? {};
  const fields: Record<string, unknown> = {};
  if (typeof type === "string" && MATERIAL_TYPES.has(type)) fields.type = type;
  if (typeof title === "string") fields.title = title;
  if (typeof url === "string") fields.url = url;
  if (sort_order !== undefined) fields.sort_order = sort_order;

  const material = await materialsRepo.updateMaterial(id, fields);
  if (!material) return res.status(404).json({ error: "NOT_FOUND" });
  return res.json(material);
}

export async function deleteMaterial(req: Request, res: Response) {
  await materialsRepo.deleteMaterial(Number(req.params.id));
  return res.status(204).send();
}

export async function uploadFile(req: Request, res: Response) {
  if (!req.file) return res.status(400).json({ error: "NO_FILE" });
  const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `admin-uploads/${Date.now()}-${safeName}`;
  const url = await uploadToR2(key, req.file.buffer, safeName);
  return res.status(201).json({ url });
}

export async function listPurchases(_req: Request, res: Response) {
  const purchases = await purchasesRepo.listAllPurchases();
  return res.json(purchases);
}

export async function searchUsers(req: Request, res: Response) {
  const query = typeof req.query.email === "string" ? req.query.email : "";
  if (!query.trim()) {
    return res.json([]);
  }
  const users = await usersRepo.searchUsersByEmail(query);
  return res.json(
    users.map((u) => ({ id: u.id, email: u.email, role: u.role, is_verified: u.is_verified }))
  );
}

export async function createUser(req: Request, res: Response) {
  const { email, courseIds } = req.body ?? {};
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "INVALID_EMAIL" });
  }

  const existing = await usersRepo.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: "EMAIL_TAKEN" });
  }

  const password = generatePassword();
  const passwordHash = await hashPassword(password);
  const user = await usersRepo.createUser(email, passwordHash);
  await usersRepo.markUserVerified(user.id);

  const granted: number[] = [];
  if (Array.isArray(courseIds)) {
    for (const rawId of courseIds) {
      const course = await coursesRepo.findCourseById(Number(rawId));
      if (course) {
        await purchasesRepo.grantManualAccess(user.id, course.id, course.price_uah);
        granted.push(course.id);
      }
    }
  }

  return res.status(201).json({ id: user.id, email: user.email, password, granted });
}

export async function getUserAccess(req: Request, res: Response) {
  const userId = Number(req.params.id);
  const user = await usersRepo.findUserById(userId);
  if (!user) return res.status(404).json({ error: "NOT_FOUND" });

  const courses = await coursesRepo.listAllCourses();
  const paidCourseIds = new Set(await purchasesRepo.listPaidCoursesForUser(userId));
  return res.json({
    user: { id: user.id, email: user.email, role: user.role, is_verified: user.is_verified },
    courses: courses.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      hasAccess: paidCourseIds.has(c.id),
    })),
  });
}

export async function grantAccess(req: Request, res: Response) {
  const userId = Number(req.params.id);
  const courseId = Number(req.params.courseId);
  const course = await coursesRepo.findCourseById(courseId);
  if (!course) return res.status(404).json({ error: "NOT_FOUND" });
  await purchasesRepo.grantManualAccess(userId, courseId, course.price_uah);
  return res.status(204).send();
}

export async function revokeAccess(req: Request, res: Response) {
  const userId = Number(req.params.id);
  const courseId = Number(req.params.courseId);
  await purchasesRepo.revokeAccess(userId, courseId);
  return res.status(204).send();
}
