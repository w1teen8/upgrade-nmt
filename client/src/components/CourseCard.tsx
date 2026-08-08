import { Link } from "react-router-dom";
import { Course } from "../api/courses.api";
import { ArrowRightIcon, HistoryIcon, QuillIcon, BoltIcon, BookIcon } from "./icons";

const ICONS: Record<string, JSX.Element> = {
  history: <HistoryIcon />,
  ukrainian: <QuillIcon />,
  "history-turbo": <BoltIcon />,
  "ukrainian-turbo": <BoltIcon />,
};

const OLD_PRICE: Record<string, number> = {
  full: 1500,
  turbo: 400,
};

const TOPIC_COUNT: Record<string, number> = {
  history: 32,
  ukrainian: 37,
};

const CHIPS: Record<string, string[]> = {
  full: ["Відеолекції", "Конспекти", "Шпаргалки", "Тести"],
  turbo: ["Практика", "Шпаргалки", "Тести"],
};

export function CourseCard({
  course,
  owned = false,
  variant = "secondary",
}: {
  course: Course;
  owned?: boolean;
  variant?: "featured" | "secondary";
}) {
  const icon = ICONS[course.icon ?? ""] ?? <BookIcon />;
  const isTurbo = course.course_type === "turbo";
  const subjectClass = course.subject === "ukrainian" ? "subject-ukrainian" : "subject-history";
  const oldPrice = OLD_PRICE[course.course_type];
  const topics = TOPIC_COUNT[course.subject];
  const chips = CHIPS[course.course_type] ?? [];
  const linkTo = owned ? `/dashboard/courses/${course.slug}` : `/courses/${course.slug}`;
  const sizeClass = variant === "featured" ? "course-card-featured" : "course-card-secondary";

  return (
    <Link to={linkTo} className={`course-card ${sizeClass} ${subjectClass}`}>
      {isTurbo && <span className="course-card-tag">UpRush</span>}
      <div className="course-card-icon">{icon}</div>
      <div>
        <h3>{course.title}</h3>
        {course.description && <p className="course-card-desc">{course.description}</p>}
      </div>
      {(topics || chips.length > 0) && (
        <div className="course-card-meta">
          {topics && <span className="course-card-chip">{topics} тем</span>}
          {chips.map((c) => (
            <span className="course-card-chip" key={c}>
              {c}
            </span>
          ))}
        </div>
      )}
      <div className="course-card-footer">
        {owned ? (
          <span className="course-card-arrow">
            Перейти до курсу <ArrowRightIcon />
          </span>
        ) : (
          <>
            <span className="course-card-price-wrap">
              <span className="course-card-price-label">Вартість</span>
              <span className="course-card-price">
                {oldPrice && <span className="price-old">{oldPrice} грн</span>}
                {Number(course.price_uah)} грн
              </span>
            </span>
            <span className="course-card-arrow">
              Детальніше <ArrowRightIcon />
            </span>
          </>
        )}
      </div>
    </Link>
  );
}
