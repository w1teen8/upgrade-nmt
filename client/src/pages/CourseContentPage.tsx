import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCourseContent, Course, TopicWithMaterials } from "../api/courses.api";
import { ApiError } from "../api/client";

const MATERIAL_LABELS: Record<string, string> = {
  conspect: "Конспект",
  shpargalka: "Шпаргалка",
  test: "Тест",
  video: "Відео",
  other: "Матеріал",
};

export function CourseContentPage() {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<(Course & { topics: TopicWithMaterials[] }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    getCourseContent(slug)
      .then(setCourse)
      .catch((err) => {
        if (err instanceof ApiError && err.code === "NOT_PURCHASED") {
          setError("У вас немає доступу до цього курсу.");
        } else {
          setError("Не вдалося завантажити курс.");
        }
      });
  }, [slug]);

  if (error) return <div className="page"><p className="form-error">{error}</p></div>;
  if (!course) return <div className="page">Завантаження...</div>;

  return (
    <div className="page course-content-page">
      <h1>{course.title}</h1>
      {course.topics.map((topic) => (
        <details key={topic.id} className="topic-block">
          <summary>{topic.title}</summary>
          {topic.description && <p>{topic.description}</p>}
          <ul>
            {topic.materials.map((m) => (
              <li key={m.id}>
                <span className="material-type">{MATERIAL_LABELS[m.type] ?? m.type}:</span>{" "}
                <a href={m.url} target="_blank" rel="noreferrer">
                  {m.title}
                </a>
              </li>
            ))}
            {topic.materials.length === 0 && <li>Матеріали ще не додано.</li>}
          </ul>
        </details>
      ))}
      {course.topics.length === 0 && <p>Теми ще не додано. Скоро тут з'явиться контент курсу.</p>}
    </div>
  );
}
