import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCourse, myCourses, Course, Topic } from "../api/courses.api";
import { useAuth } from "../context/AuthContext";
import { SkeletonLine, SkeletonCard } from "../components/Skeleton";

const TELEGRAM_CONTACT = "https://t.me/w1teen0";

const OLD_PRICE: Record<string, number> = {
  full: 1500,
  turbo: 400,
};

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<(Course & { topics: Topic[] }) | null>(null);
  const [displayTopics, setDisplayTopics] = useState<Topic[]>([]);
  const [purchased, setPurchased] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    getCourse(slug)
      .then(setCourse)
      .catch(() => setError("Курс не знайдено."));
  }, [slug]);

  useEffect(() => {
    if (!course) return;
    if (course.course_type === "turbo") {
      getCourse(`${course.subject}-full`)
        .then((full) => setDisplayTopics(full.topics))
        .catch(() => setDisplayTopics(course.topics));
    } else {
      setDisplayTopics(course.topics);
    }
  }, [course]);

  useEffect(() => {
    if (!user || !course) return;
    myCourses()
      .then((list) => setPurchased(list.some((c) => c.id === course.id)))
      .catch(() => {});
  }, [user, course]);

  if (error) return <div className="page"><p className="form-error">{error}</p></div>;
  if (!course) {
    return (
      <div className="page course-detail-page">
        <SkeletonLine width="60%" />
        <div style={{ height: 12 }} />
        <SkeletonLine width="30%" />
        <div style={{ height: 24 }} />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="page course-detail-page">
      <h1>{course.title}</h1>
      <p className="course-price">
        {OLD_PRICE[course.course_type] && (
          <span className="price-old">{OLD_PRICE[course.course_type]} грн</span>
        )}
        {Number(course.price_uah)} грн
      </p>
      <p className="course-description">{course.description}</p>

      {displayTopics.length > 0 && (
        <div className="topic-list">
          <h2>Теми курсу</h2>
          <ol>
            {displayTopics.map((t) => (
              <li key={t.id}>{t.title}</li>
            ))}
          </ol>
        </div>
      )}

      {purchased ? (
        <Link to="/dashboard" className="btn btn-primary">
          Перейти до курсу
        </Link>
      ) : (
        <div className="buy-box">
          <p>
            Щоб оплатити курс, напишіть нам у Telegram, вкажіть назву курсу — і ми відкриємо
            доступ одразу після оплати.
          </p>
          <a
            href={TELEGRAM_CONTACT}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-lg"
          >
            Написати в Telegram @w1teen0
          </a>
        </div>
      )}
    </div>
  );
}
