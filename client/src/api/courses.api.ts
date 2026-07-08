import { apiFetch } from "./client";

export interface Course {
  id: number;
  slug: string;
  title: string;
  subject: string;
  course_type: string;
  description: string;
  price_uah: string;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Topic {
  id: number;
  title: string;
  description: string;
  sort_order: number;
}

export interface Material {
  id: number;
  type: string;
  title: string;
  url: string;
  done?: boolean;
}

export interface TopicWithMaterials extends Topic {
  completed: boolean;
  materials: Material[];
}

export function listCourses() {
  return apiFetch<Course[]>("/api/courses", { auth: false });
}

export function getCourse(slug: string) {
  return apiFetch<Course & { topics: Topic[] }>(`/api/courses/${slug}`, { auth: false });
}

export function getCourseContent(slug: string) {
  return apiFetch<Course & { topics: TopicWithMaterials[] }>(`/api/courses/${slug}/content`);
}

export function myCourses() {
  return apiFetch<Course[]>("/api/me/courses");
}

export function setMaterialDone(materialId: number, done: boolean) {
  return apiFetch<void>(`/api/materials/${materialId}/progress`, {
    method: "POST",
    body: { done },
  });
}

export function setTopicCompleted(topicId: number, completed: boolean) {
  return apiFetch<void>(`/api/topics/${topicId}/progress`, {
    method: "POST",
    body: { completed },
  });
}
