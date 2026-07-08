import { Link } from "react-router-dom";
import { Course } from "../api/courses.api";

const ICONS: Record<string, string> = {
  history: "🏛️",
  ukrainian: "🖋️",
  "history-turbo": "⚡",
  "ukrainian-turbo": "⚡",
};

export function CourseCard({ course }: { course: Course }) {
  const icon = ICONS[course.icon ?? ""] ?? "📘";
  const isTurbo = course.course_type === "turbo";
  const subjectClass = course.subject === "ukrainian" ? "subject-ukrainian" : "subject-history";

  return (
    <Link to={`/courses/${course.slug}`} className={`course-card ${subjectClass}`}>
      {isTurbo && <span className="course-card-tag">ТурбоБум</span>}
      <div className="course-card-icon">{icon}</div>
      <h3>{course.title}</h3>
      {course.description && <p className="course-card-desc">{course.description}</p>}
      <div className="course-card-footer">
        <span className="course-card-price">{Number(course.price_uah)} грн</span>
        <span className="course-card-arrow">Детальніше →</span>
      </div>
    </Link>
  );
}
