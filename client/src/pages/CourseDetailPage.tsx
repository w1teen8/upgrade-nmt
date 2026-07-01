import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCourse, myCourses, Course, Topic } from "../api/courses.api";
import { useAuth } from "../context/AuthContext";
import { LiqPayButton } from "../components/LiqPayButton";

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<(Course & { topics: Topic[] }) | null>(null);
  const [purchased, setPurchased] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    getCourse(slug)
      .then(setCourse)
      .catch(() => setError("Курс не знайдено."));
  }, [slug]);

  useEffect(() => {
    if (!user || !course) return;
    myCourses()
      .then((list) => setPurchased(list.some((c) => c.id === course.id)))
      .catch(() => {});
  }, [user, course]);

  if (error) return <div className="page"><p className="form-error">{error}</p></div>;
  if (!course) return <div className="page">Завантаження...</div>;

  return (
    <div className="page course-detail-page">
      <h1>{course.title}</h1>
      <p className="course-price">{Number(course.price_uah)} грн</p>
      <p className="course-description">{course.description}</p>

      {course.topics.length > 0 && (
        <div className="topic-list">
          <h2>Теми курсу</h2>
          <ol>
            {course.topics.map((t) => (
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
        <LiqPayButton courseId={course.id} />
      )}
    </div>
  );
}
