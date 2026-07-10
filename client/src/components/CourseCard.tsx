import { Link } from "react-router-dom";
import { Course } from "../api/courses.api";

const ICONS: Record<string, string> = {
  history: "🏛️",
  ukrainian: "🖋️",
  "history-turbo": "⚡",
  "ukrainian-turbo": "⚡",
};

const OLD_PRICE: Record<string, number> = {
  full: 1500,
  turbo: 400,
};

export function CourseCard({ course, owned = false }: { course: Course; owned?: boolean }) {
  const icon = ICONS[course.icon ?? ""] ?? "📘";
  const isTurbo = course.course_type === "turbo";
  const subjectClass = course.subject === "ukrainian" ? "subject-ukrainian" : "subject-history";
  const oldPrice = OLD_PRICE[course.course_type];
  const linkTo = owned ? `/dashboard/courses/${course.slug}` : `/courses/${course.slug}`;

  return (
    <Link to={linkTo} className={`course-card ${subjectClass}`}>
      {isTurbo && <span className="course-card-tag">UpRush</span>}
      <div className="course-card-icon">{icon}</div>
      <h3>{course.title}</h3>
      {course.description && <p className="course-card-desc">{course.description}</p>}
      <div className="course-card-footer">
        {owned ? (
          <span className="course-card-arrow">Перейти до курсу →</span>
        ) : (
          <>
            <span className="course-card-price">
              {oldPrice && <span className="price-old">{oldPrice} грн</span>}
              {Number(course.price_uah)} грн
            </span>
            <span className="course-card-arrow">Детальніше →</span>
          </>
        )}
      </div>
    </Link>
  );
}
