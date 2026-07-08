import { apiFetch } from "./client";
import { Course } from "./courses.api";

export interface AdminTopic {
  id: number;
  course_id: number;
  title: string;
  description: string;
  sort_order: number;
}

export interface AdminMaterial {
  id: number;
  topic_id: number;
  type: string;
  title: string;
  url: string;
  sort_order: number;
}

export function listCourses() {
  return apiFetch<Course[]>("/api/admin/courses");
}

export function updateCourse(id: number, fields: Partial<Course>) {
  return apiFetch<Course>(`/api/admin/courses/${id}`, { method: "PUT", body: fields });
}

export function listTopics(courseId: number) {
  return apiFetch<AdminTopic[]>(`/api/admin/courses/${courseId}/topics`);
}

export function createTopic(courseId: number, title: string, description: string, sort_order: number) {
  return apiFetch<AdminTopic>(`/api/admin/courses/${courseId}/topics`, {
    method: "POST",
    body: { title, description, sort_order },
  });
}

export function updateTopic(id: number, fields: Partial<AdminTopic>) {
  return apiFetch<AdminTopic>(`/api/admin/topics/${id}`, { method: "PUT", body: fields });
}

export function deleteTopic(id: number) {
  return apiFetch<void>(`/api/admin/topics/${id}`, { method: "DELETE" });
}

export function listMaterials(topicId: number) {
  return apiFetch<AdminMaterial[]>(`/api/admin/topics/${topicId}/materials`);
}

export function createMaterial(
  topicId: number,
  type: string,
  title: string,
  url: string,
  sort_order: number
) {
  return apiFetch<AdminMaterial>(`/api/admin/topics/${topicId}/materials`, {
    method: "POST",
    body: { type, title, url, sort_order },
  });
}

export function updateMaterial(id: number, fields: Partial<AdminMaterial>) {
  return apiFetch<AdminMaterial>(`/api/admin/materials/${id}`, { method: "PUT", body: fields });
}

export function deleteMaterial(id: number) {
  return apiFetch<void>(`/api/admin/materials/${id}`, { method: "DELETE" });
}

export interface AdminUser {
  id: number;
  email: string;
  role: "student" | "admin";
  is_verified: boolean;
}

export interface UserAccess {
  user: AdminUser;
  courses: { id: number; slug: string; title: string; hasAccess: boolean }[];
}

export function searchUsers(email: string) {
  return apiFetch<AdminUser[]>(`/api/admin/users?email=${encodeURIComponent(email)}`);
}

export interface CreatedUser {
  id: number;
  email: string;
  password: string;
  granted: number[];
}

export function createUser(email: string, courseIds?: number[]) {
  return apiFetch<CreatedUser>("/api/admin/users", {
    method: "POST",
    body: { email, courseIds },
  });
}

export function getUserAccess(userId: number) {
  return apiFetch<UserAccess>(`/api/admin/users/${userId}/access`);
}

export function grantAccess(userId: number, courseId: number) {
  return apiFetch<void>(`/api/admin/users/${userId}/courses/${courseId}/grant`, {
    method: "POST",
  });
}

export function revokeAccess(userId: number, courseId: number) {
  return apiFetch<void>(`/api/admin/users/${userId}/courses/${courseId}/revoke`, {
    method: "POST",
  });
}
