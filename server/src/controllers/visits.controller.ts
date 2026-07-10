import { Request, Response } from "express";
import * as visitsRepo from "../repositories/visits.repo";

export async function recordVisit(req: Request, res: Response) {
  const { sessionId } = req.body ?? {};
  if (typeof sessionId !== "string" || !sessionId.trim()) {
    return res.status(400).json({ error: "INVALID_SESSION_ID" });
  }
  await visitsRepo.recordVisit(sessionId.trim().slice(0, 64));
  return res.status(204).end();
}

export async function getVisitStats(_req: Request, res: Response) {
  const stats = await visitsRepo.getVisitStats();
  return res.json(stats);
}
