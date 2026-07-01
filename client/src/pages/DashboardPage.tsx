import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { myCourses, Course } from "../api/courses.api";

export function DashboardPage() {
  const [courses, setCourses] = useState<Course[] | null>(null);

  useEffect(() => {
    myCourses().then(setCourses).catch(() => setCourses([]));
  }, []);

  return (
    <div className="page dashboard-page">
      <h1>Мої курси</h1>
      {courses === null && <p>Завантаження...</p>}
      {courses?.length === 0 && (
        <p>
          У вас ще немає придбаних курсів. <Link to="/">Переглянути курси</Link>
        </p>
      )}
      <div className="course-grid">
        {courses?.map((c) => (
          <Link key={c.id} to={`/dashboard/courses/${c.slug}`} className="course-card">
            <h3>{c.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
