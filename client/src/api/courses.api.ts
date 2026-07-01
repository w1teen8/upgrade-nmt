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
}

export interface Material {
  id: number;
  type: string;
  title: string;
  url: string;
}

export interface TopicWithMaterials extends Topic {
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
