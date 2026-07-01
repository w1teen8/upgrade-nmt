import { Link } from "react-router-dom";
import { Course } from "../api/courses.api";

const ICONS: Record<string, string> = {
  history: "🏛️",
  ukrainian: "🖋️",
  "history-turbo": "🚀",
  "ukrainian-turbo": "🚀",
};

export function CourseCard({ course }: { course: Course }) {
  const icon = ICONS[course.icon ?? ""] ?? "📘";
  return (
    <Link to={`/courses/${course.slug}`} className="course-card">
      <div className="course-card-icon">{icon}</div>
      <h3>{course.title}</h3>
      <p className="course-card-price">{Number(course.price_uah)} грн</p>
    </Link>
  );
}
