import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  getCourseContent,
  setMaterialDone,
  setTopicCompleted,
  Course,
  Material,
  TopicWithMaterials,
} from "../api/courses.api";
import { ApiError } from "../api/client";

const MATERIAL_LABELS: Record<string, string> = {
  conspect: "Конспект",
  shpargalka: "Шпаргалка",
  test: "Тест",
  video: "Відео",
  other: "Матеріал",
};

function toEmbedUrl(url: string): string | null {
  const byShortLink = url.match(/youtu\.be\/([\w-]+)/);
  if (byShortLink) return `https://www.youtube.com/embed/${byShortLink[1]}`;
  const byWatchParam = url.match(/[?&]v=([\w-]+)/);
  if (byWatchParam) return `https://www.youtube.com/embed/${byWatchParam[1]}`;
  const alreadyEmbed = url.match(/youtube\.com\/embed\/([\w-]+)/);
  if (alreadyEmbed) return url;
  return null;
}

export function CourseContentPage() {
  const { slug, topicId } = useParams<{ slug: string; topicId?: string }>();
  const navigate = useNavigate();
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
  if (!course) return <div className="page-loading">Завантаження...</div>;

  if (course.topics.length === 0) {
    return (
      <div className="page">
        <h1>{course.title}</h1>
        <p>Теми ще не додано. Скоро тут з'явиться контент курсу.</p>
      </div>
    );
  }

  if (!topicId) {
    return <Navigate to={`/dashboard/courses/${slug}/topics/${course.topics[0].id}`} replace />;
  }

  const activeTopic = course.topics.find((t) => String(t.id) === topicId) ?? course.topics[0];
  const videoMaterials = activeTopic.materials.filter((m) => m.type === "video");
  const listMaterials = activeTopic.materials.filter((m) => m.type !== "video");

  function patchMaterial(materialId: number, done: boolean) {
    setCourse((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        topics: prev.topics.map((t) => ({
          ...t,
          materials: t.materials.map((m) => (m.id === materialId ? { ...m, done } : m)),
        })),
      };
    });
  }

  function patchTopic(topicIdToPatch: number, completed: boolean) {
    setCourse((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        topics: prev.topics.map((t) => (t.id === topicIdToPatch ? { ...t, completed } : t)),
      };
    });
  }

  async function toggleMaterial(m: Material) {
    const next = !m.done;
    patchMaterial(m.id, next);
    try {
      await setMaterialDone(m.id, next);
    } catch {
      patchMaterial(m.id, !next);
    }
  }

  async function toggleTopic() {
    const next = !activeTopic.completed;
    patchTopic(activeTopic.id, next);
    try {
      await setTopicCompleted(activeTopic.id, next);
    } catch {
      patchTopic(activeTopic.id, !next);
    }
  }

  return (
    <div className="course-content-layout">
      <aside className="course-sidebar">
        <Link to="/dashboard" className="course-sidebar-back">
          ← Мої курси
        </Link>
        <h2>{course.title}</h2>
        <nav className="course-sidebar-nav">
          {course.topics.map((t) => (
            <button
              key={t.id}
              type="button"
              className={[
                "sidebar-topic",
                String(t.id) === topicId ? "active" : "",
                t.sort_order < 0 ? "bonus" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => navigate(`/dashboard/courses/${slug}/topics/${t.id}`)}
            >
              <span className="sidebar-topic-check">{t.completed ? "✓" : ""}</span>
              {t.title}
            </button>
          ))}
        </nav>
      </aside>

      <main className="course-main">
        <h1>{activeTopic.title}</h1>

        {videoMaterials.map((v) => {
          const embedUrl = toEmbedUrl(v.url);
          return (
            <div key={v.id} className="video-block">
              {videoMaterials.length > 1 && <h3 className="video-block-title">{v.title}</h3>}
              {embedUrl ? (
                <div className="video-frame">
                  <iframe
                    src={embedUrl}
                    title={v.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <p>
                  <a href={v.url} target="_blank" rel="noreferrer">
                    {v.title}
                  </a>
                </p>
              )}
            </div>
          );
        })}

        <ul className="material-checklist">
          {listMaterials.map((m) => (
            <li key={m.id} className={m.done ? "done" : ""}>
              {m.type === "test" ? (
                <label>
                  <input type="checkbox" checked={!!m.done} onChange={() => toggleMaterial(m)} />
                  <span className="material-type">{MATERIAL_LABELS[m.type] ?? m.type}:</span>{" "}
                  <a href={m.url} target="_blank" rel="noreferrer">
                    {m.title}
                  </a>
                </label>
              ) : (
                <span className="material-row">
                  <span className="material-type">{MATERIAL_LABELS[m.type] ?? m.type}:</span>{" "}
                  <a href={m.url} target="_blank" rel="noreferrer">
                    {m.title}
                  </a>
                </span>
              )}
            </li>
          ))}
          {listMaterials.length === 0 && videoMaterials.length === 0 && <li>Матеріали ще не додано.</li>}
        </ul>

        <button
          type="button"
          className={`btn btn-lg ${activeTopic.completed ? "btn-done" : "btn-primary"}`}
          onClick={toggleTopic}
        >
          {activeTopic.completed ? "✓ Тему завершено" : "Позначити тему завершеною"}
        </button>
      </main>
    </div>
  );
}
