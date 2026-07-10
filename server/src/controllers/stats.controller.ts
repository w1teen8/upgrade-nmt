import { Request, Response } from "express";
import * as usersRepo from "../repositories/users.repo";

export async function getPublicStats(_req: Request, res: Response) {
  const registeredUsers = await usersRepo.countUsers();
  return res.json({ registeredUsers });
}
