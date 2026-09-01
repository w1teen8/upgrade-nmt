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

function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

function toEmbedUrl(url: string): string | null {
  const byShortLink = url.match(/youtu\.be\/([\w-]+)/);
  if (byShortLink) return `https://www.youtube.com/embed/${byShortLink[1]}`;
  const byWatchParam = url.match(/[?&]v=([\w-]+)/);
  if (byWatchParam) return `https://www.youtube.com/embed/${byWatchParam[1]}`;
  const alreadyEmbed = url.match(/youtube\.com\/embed\/([\w-]+)/);
  if (alreadyEmbed) return url;
  return null;
}

function VideoBlock({ material }: { material: Material }) {
  const [started, setStarted] = useState(false);
  const embedUrl = toEmbedUrl(material.url);

  if (!embedUrl) {
    return (
      <p>
        <a href={material.url} target="_blank" rel="noreferrer">
          {material.title}
        </a>
      </p>
    );
  }

  return (
    <div className="video">
      {started ? (
        <iframe
          src={`${embedUrl}?autoplay=1`}
          title={material.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <>
          <button
            type="button"
            className="play"
            aria-label={`Відтворити: ${material.title}`}
            onClick={() => setStarted(true)}
          />
          <p className="video-cap">{material.title}</p>
        </>
      )}
    </div>
  );
}

export function CourseContentPage() {
  const { slug, topicId } = useParams<{ slug: string; topicId?: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<(Course & { topics: TopicWithMaterials[] }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sideOpen, setSideOpen] = useState(true);

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

  const activeIndex = course.topics.findIndex((t) => String(t.id) === topicId);
  const activeTopic = activeIndex >= 0 ? course.topics[activeIndex] : course.topics[0];
  const prevTopic = activeIndex > 0 ? course.topics[activeIndex - 1] : null;
  const nextTopic = activeIndex >= 0 && activeIndex < course.topics.length - 1 ? course.topics[activeIndex + 1] : null;

  const numberedTopics = course.topics.filter((t) => t.sort_order >= 0);
  const doneCount = numberedTopics.filter((t) => t.completed).length;
  const progressPct = numberedTopics.length > 0 ? Math.round((doneCount / numberedTopics.length) * 100) : 0;

  const videoMaterials = activeTopic.materials.filter((m) => m.type === "video");
  const testMaterials = activeTopic.materials.filter((m) => m.type === "test");
  const otherMaterials = activeTopic.materials.filter((m) => m.type !== "video" && m.type !== "test");

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

  function goToTopic(id: number) {
    navigate(`/dashboard/courses/${slug}/topics/${id}`);
  }

  return (
    <div className="topic-shell">
      <aside className="side">
        <div className="side-head">
          <Link to="/dashboard" className="side-back">
            ← Мої курси
          </Link>
          <h2>{course.title}</h2>
          <div className="side-bar">
            <i style={{ width: `${progressPct}%` }} />
          </div>
          <p className="side-bar-note">
            {doneCount} з {numberedTopics.length} {pluralize(numberedTopics.length, "тема", "теми", "тем")} пройдено
          </p>
        </div>

        <button
          type="button"
          className="side-toggle"
          aria-expanded={sideOpen}
          onClick={() => setSideOpen((v) => !v)}
        >
          {sideOpen ? "Список тем ▾" : "Список тем ▸"}
        </button>

        <div className="side-list" hidden={!sideOpen}>
          {course.topics
            .filter((t) => t.sort_order < 0)
            .map((t) => (
              <button key={t.id} type="button" className="pin" onClick={() => goToTopic(t.id)}>
                <span aria-hidden="true">{/бонус|подкаст/i.test(t.title) ? "🎧" : "📎"}</span>
                <span>{t.title}</span>
              </button>
            ))}

          {numberedTopics.length > 0 && <p className="side-sep">ТЕМИ КУРСУ</p>}

          {numberedTopics.map((t) => (
            <button
              key={t.id}
              type="button"
              className={["tp", t.completed ? "done" : "", String(t.id) === topicId ? "now" : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => goToTopic(t.id)}
            >
              <span className="tp-num">{t.sort_order}</span>
              <span className="tp-title">{t.title}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="topic-main">
        <p className="crumb">
          <Link to="/dashboard">Мої курси</Link> · <Link to={`/dashboard/courses/${slug}`}>{course.title}</Link> ·{" "}
          {activeTopic.sort_order >= 0 ? `Тема ${activeTopic.sort_order}` : activeTopic.title}
        </p>
        <h1>{activeTopic.title}</h1>

        <div className="topic-meta">
          {videoMaterials.length > 0 && (
            <span className="chip">
              {videoMaterials.length === 1 ? "Відеолекція" : `Відео: ${videoMaterials.length}`}
            </span>
          )}
          {testMaterials.length > 0 && (
            <span className="chip">
              {testMaterials.length} {pluralize(testMaterials.length, "тест", "тести", "тестів")}
            </span>
          )}
          {otherMaterials.length > 0 && (
            <span className="chip">
              {otherMaterials.length} {pluralize(otherMaterials.length, "матеріал", "матеріали", "матеріалів")}
            </span>
          )}
          {activeTopic.completed && <span className="chip ok">Тему пройдено</span>}
        </div>

        {videoMaterials.map((v) => (
          <VideoBlock key={v.id} material={v} />
        ))}

        {testMaterials.length > 0 && (
          <>
            <h2 className="sec-h">Перевір себе</h2>
            <div className="tasks">
              {testMaterials.map((m) => (
                <div key={m.id} className={`task ${m.done ? "done" : ""}`}>
                  <button
                    type="button"
                    className="tick"
                    aria-pressed={!!m.done}
                    aria-label={m.done ? "Позначити тест непройденим" : "Позначити тест пройденим"}
                    onClick={() => toggleMaterial(m)}
                  >
                    <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                      <path
                        d="M1 5.5 5 9.5 13 1.5"
                        stroke="#fff"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <span className="task-body">
                    <b>{m.title}</b>
                    <span>{m.done ? "Пройдено" : "Ще не пройдено"}</span>
                  </span>
                  <a className="btn btn-alt go" href={m.url} target="_blank" rel="noreferrer">
                    {m.done ? "Перепройти" : "Пройти"}
                  </a>
                </div>
              ))}
            </div>
          </>
        )}

        {otherMaterials.length > 0 && (
          <>
            <h2 className="sec-h">Матеріали теми</h2>
            <div className="tasks">
              {otherMaterials.map((m) => (
                <div key={m.id} className="task">
                  <span className="tick" aria-hidden="true" />
                  <span className="task-body">
                    <b>{m.title}</b>
                    <span>{MATERIAL_LABELS[m.type] ?? m.type}</span>
                  </span>
                  <a className="btn btn-alt go" href={m.url} target="_blank" rel="noreferrer">
                    Відкрити
                  </a>
                </div>
              ))}
            </div>
          </>
        )}

        {!activeTopic.completed ? (
          <button type="button" className="btn btn-green btn-lg" onClick={toggleTopic}>
            Позначити тему завершеною
          </button>
        ) : (
          <div className="done-bar">
            <div>
              <h3>Тему закрито</h3>
              <p>Повернись до неї через 10 днів — так матеріал утримується в пам'яті надовше.</p>
            </div>
            {nextTopic ? (
              <button type="button" className="btn btn-green btn-lg" onClick={() => goToTopic(nextTopic.id)}>
                Наступна тема
              </button>
            ) : (
              <button type="button" className="btn btn-alt btn-lg" onClick={toggleTopic}>
                Скасувати позначку
              </button>
            )}
          </div>
        )}

        {(prevTopic || nextTopic) && (
          <div className="pager">
            {prevTopic ? (
              <button type="button" className="pg" onClick={() => goToTopic(prevTopic.id)}>
                <span>← Попередня тема</span>
                <b>{prevTopic.title}</b>
              </button>
            ) : (
              <span />
            )}
            {nextTopic && (
              <button type="button" className="pg next" onClick={() => goToTopic(nextTopic.id)}>
                <span>Наступна тема →</span>
                <b>{nextTopic.title}</b>
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
