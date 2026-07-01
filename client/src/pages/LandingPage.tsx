import { useEffect, useState } from "react";
import { listCourses, Course } from "../api/courses.api";
import { CourseCard } from "../components/CourseCard";

export function LandingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listCourses()
      .then(setCourses)
      .catch(() => setError("Не вдалося завантажити курси."));
  }, []);

  return (
    <div className="page landing-page">
      <section className="hero">
        <h1>Підготовка до НМТ 2027</h1>
        <p>Історія України та українська мова — конспекти, шпаргалки, тести та практикуми.</p>
      </section>

      {error && <p className="form-error">{error}</p>}

      <div className="course-grid">
        {courses.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>
    </div>
  );
}
