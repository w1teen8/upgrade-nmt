import { Request, Response } from "express";
import { listActiveCourses, findCourseBySlug } from "../repositories/courses.repo";
import { listTopicsByCourse } from "../repositories/topics.repo";
import { listMaterialsByTopicIds } from "../repositories/materials.repo";
import { hasUserPaidForCourse, listPaidCoursesForUser } from "../repositories/purchases.repo";
import { listDoneMaterialIds, listCompletedTopicIds } from "../repositories/progress.repo";

export async function listCourses(_req: Request, res: Response) {
  const courses = await listActiveCourses();
  return res.json(courses);
}

export async function getCourse(req: Request, res: Response) {
  const course = await findCourseBySlug(req.params.slug);
  if (!course || !course.is_active) {
    return res.status(404).json({ error: "NOT_FOUND" });
  }
  const topics = await listTopicsByCourse(course.id);
  return res.json({
    ...course,
    topics: topics.map((t) => ({ id: t.id, title: t.title, description: t.description })),
  });
}

export async function getCourseContent(req: Request, res: Response) {
  const course = await findCourseBySlug(req.params.slug);
  if (!course || !course.is_active) {
    return res.status(404).json({ error: "NOT_FOUND" });
  }

  const paid = await hasUserPaidForCourse(req.user!.sub, course.id);
  if (!paid) {
    return res.status(403).json({ error: "NOT_PURCHASED" });
  }

  const topics = await listTopicsByCourse(course.id);
  const topicIds = topics.map((t) => t.id);
  const materials = await listMaterialsByTopicIds(topicIds);
  const materialsByTopic = new Map<number, typeof materials>();
  for (const m of materials) {
    const list = materialsByTopic.get(m.topic_id) ?? [];
    list.push(m);
    materialsByTopic.set(m.topic_id, list);
  }

  const doneMaterialIds = new Set(await listDoneMaterialIds(req.user!.sub, topicIds));
  const completedTopicIds = new Set(await listCompletedTopicIds(req.user!.sub, topicIds));

  return res.json({
    ...course,
    topics: topics.map((t) => ({
      ...t,
      completed: completedTopicIds.has(t.id),
      materials: (materialsByTopic.get(t.id) ?? []).map((m) => ({
        ...m,
        done: doneMaterialIds.has(m.id),
      })),
    })),
  });
}

export async function myCourses(req: Request, res: Response) {
  const courseIds = await listPaidCoursesForUser(req.user!.sub);
  const all = await listActiveCourses();
  const purchased = all.filter((c) => courseIds.includes(c.id));
  return res.json(purchased);
}
