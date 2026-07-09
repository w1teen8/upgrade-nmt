import { Link } from "react-router-dom";
import { Course } from "../api/courses.api";

const OLD_PRICE: Record<string, number> = {
  full: 1500,
  turbo: 400,
};

export function CourseCard({ course }: { course: Course }) {
  const isTurbo = course.course_type === "turbo";
  const subjectClass = course.subject === "ukrainian" ? "subject-ukrainian" : "subject-history";
  const oldPrice = OLD_PRICE[course.course_type];

  return (
    <Link to={`/courses/${course.slug}`} className={`course-card ${subjectClass}`}>
      {isTurbo && <span className="course-card-tag">UpRush</span>}
      <div className="course-card-cover">
        <img src={`/covers/${course.slug}.jpg`} alt={course.title} loading="lazy" />
      </div>
      <h3>{course.title}</h3>
      {course.description && <p className="course-card-desc">{course.description}</p>}
      <div className="course-card-footer">
        <span className="course-card-price">
          {oldPrice && <span className="price-old">{oldPrice} грн</span>}
          {Number(course.price_uah)} грн
        </span>
        <span className="course-card-arrow">Детальніше →</span>
      </div>
    </Link>
  );
}
