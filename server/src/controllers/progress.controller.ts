import { Request, Response } from "express";
import * as topicsRepo from "../repositories/topics.repo";
import * as materialsRepo from "../repositories/materials.repo";
import * as progressRepo from "../repositories/progress.repo";
import { hasUserPaidForCourse } from "../repositories/purchases.repo";

export async function setMaterialProgress(req: Request, res: Response) {
  const materialId = Number(req.params.id);
  const done = Boolean(req.body?.done);

  const material = await materialsRepo.findMaterialById(materialId);
  if (!material) return res.status(404).json({ error: "NOT_FOUND" });
  const topic = await topicsRepo.findTopicById(material.topic_id);
  if (!topic) return res.status(404).json({ error: "NOT_FOUND" });

  const paid = await hasUserPaidForCourse(req.user!.sub, topic.course_id);
  if (!paid) return res.status(403).json({ error: "NOT_PURCHASED" });

  await progressRepo.setMaterialDone(req.user!.sub, materialId, done);
  return res.status(204).send();
}

export async function setTopicProgress(req: Request, res: Response) {
  const topicId = Number(req.params.id);
  const completed = Boolean(req.body?.completed);

  const topic = await topicsRepo.findTopicById(topicId);
  if (!topic) return res.status(404).json({ error: "NOT_FOUND" });

  const paid = await hasUserPaidForCourse(req.user!.sub, topic.course_id);
  if (!paid) return res.status(403).json({ error: "NOT_PURCHASED" });

  await progressRepo.setTopicCompleted(req.user!.sub, topicId, completed);
  return res.status(204).send();
}
