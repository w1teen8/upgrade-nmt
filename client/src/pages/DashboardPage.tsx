import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { myCourses, getCourseContent, Course, TopicWithMaterials } from "../api/courses.api";
import { CourseCard } from "../components/CourseCard";
import { SkeletonGrid, SkeletonLine } from "../components/Skeleton";
import { recordActivityToday, getStreak, isTodayLogged } from "../lib/streak";
import { FlameIcon, TargetIcon, TrophyIcon, ArrowRightIcon, BookIcon } from "../components/icons";

type CourseWithProgress = Course & { topics: TopicWithMaterials[] };

const MATERIAL_LABELS: Record<string, string> = {
  conspect: "Конспект",
  shpargalka: "Шпаргалка",
  test: "Тест",
  video: "Відео",
  other: "Матеріал",
};

export function DashboardPage() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [detailed, setDetailed] = useState<CourseWithProgress[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [goalDone, setGoalDone] = useState(false);

  useEffect(() => {
    recordActivityToday();
    setStreak(getStreak());
    setGoalDone(isTodayLogged());
  }, []);

  useEffect(() => {
    myCourses()
      .then(setCourses)
      .catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    if (!courses) return;
    if (courses.length === 0) {
      setDetailsLoading(false);
      return;
    }
    Promise.all(
      courses.map((c) =>
        getCourseContent(c.slug)
          .then((full) => full as CourseWithProgress)
          .catch(() => ({ ...c, topics: [] as TopicWithMaterials[] }))
      )
    )
      .then(setDetailed)
      .finally(() => setDetailsLoading(false));
  }, [courses]);

  const stats = useMemo(() => {
    const realTopics = detailed.flatMap((c) => c.topics.filter((t) => t.sort_order >= 0));
    const completedTopics = realTopics.filter((t) => t.completed);
    const anyCourseFullyDone = detailed.some(
      (c) => c.topics.length > 0 && c.topics.every((t) => t.completed)
    );

    let nextLesson: { course: CourseWithProgress; topic: TopicWithMaterials } | null = null;
    for (const c of detailed) {
      const next = [...c.topics]
        .filter((t) => t.sort_order >= 0)
        .sort((a, b) => a.sort_order - b.sort_order)
        .find((t) => !t.completed);
      if (next) {
        nextLesson = { course: c, topic: next };
        break;
      }
    }

    const quickTests = nextLesson
      ? nextLesson.topic.materials.filter((m) => m.type === "test")
      : [];

    return {
      totalTopics: realTopics.length,
      completedCount: completedTopics.length,
      pct: realTopics.length ? Math.round((completedTopics.length / realTopics.length) * 100) : 0,
      anyCourseFullyDone,
      nextLesson,
      quickTests,
    };
  }, [detailed]);

  const achievements = [
    { key: "first-step", label: "Перший крок", unlocked: stats.completedCount >= 1 },
    { key: "five-topics", label: "5 тем пройдено", unlocked: stats.completedCount >= 5 },
    { key: "ten-topics", label: "10 тем пройдено", unlocked: stats.completedCount >= 10 },
    { key: "course-done", label: "Курс завершено", unlocked: stats.anyCourseFullyDone },
    { key: "streak-3", label: "3 дні поспіль", unlocked: streak >= 3 },
    { key: "streak-7", label: "Тиждень поспіль", unlocked: streak >= 7 },
  ];

  if (courses === null) {
    return (
      <div className="page dashboard-page">
        <SkeletonLine width="240px" />
        <div style={{ height: 32 }} />
        <SkeletonGrid count={2} />
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <h1>Мої курси</h1>
      <p className="dashboard-subtitle">Ваш прогрес підготовки до НМТ</p>

      {courses.length === 0 ? (
        <p>
          У вас ще немає придбаних курсів. <Link to="/">Переглянути курси</Link>
        </p>
      ) : (
        <>
          <div className="dash-stats-row" style={{ marginBottom: 20 }}>
            <div className="dash-stat streak">
              <strong>{streak}</strong>
              <span>Днів поспіль</span>
            </div>
            <div className={`dash-stat goal ${goalDone ? "done" : ""}`}>
              <strong>{goalDone ? "✓" : "—"}</strong>
              <span>Ціль на сьогодні</span>
            </div>
            <div className="dash-stat">
              <strong>{stats.completedCount}</strong>
              <span>Тем пройдено</span>
            </div>
            <div className="dash-stat">
              <strong>{stats.pct}%</strong>
              <span>Загальний прогрес</span>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dash-card">
              <h3>Прогрес по курсах</h3>
              {detailsLoading ? (
                <SkeletonLine />
              ) : (
                detailed.map((c) => {
                  const realTopics = c.topics.filter((t) => t.sort_order >= 0);
                  const done = realTopics.filter((t) => t.completed).length;
                  const pct = realTopics.length ? Math.round((done / realTopics.length) * 100) : 0;
                  return (
                    <div className="course-progress-item" key={c.id}>
                      <div className="course-progress-title">
                        <Link to={`/dashboard/courses/${c.slug}`}>{c.title}</Link>
                        <span className="course-progress-pct">{pct}%</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className={`progress-fill ${pct === 100 ? "success" : ""}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="progress-label">
                        <span>
                          {done} з {realTopics.length} тем
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {!detailsLoading && stats.nextLesson && (
                <>
                  <h3 style={{ marginTop: 24 }}>Рекомендований наступний урок</h3>
                  <Link
                    to={`/dashboard/courses/${stats.nextLesson.course.slug}/topics/${stats.nextLesson.topic.id}`}
                    className="next-lesson-card"
                  >
                    <span className="next-lesson-icon">
                      <BookIcon />
                    </span>
                    <span className="next-lesson-meta">
                      <span className="next-lesson-course">{stats.nextLesson.course.title}</span>
                      <span className="next-lesson-title">{stats.nextLesson.topic.title}</span>
                    </span>
                    <ArrowRightIcon />
                  </Link>
                </>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="dash-card">
                <h3>Досягнення</h3>
                <div className="achievement-grid">
                  {achievements.map((a) => (
                    <div className={`achievement ${a.unlocked ? "unlocked" : ""}`} key={a.key}>
                      <span className="achievement-icon">
                        {a.key.startsWith("streak") ? <FlameIcon /> : <TrophyIcon />}
                      </span>
                      <span className="achievement-label">{a.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {stats.quickTests.length > 0 && (
                <div className="dash-card">
                  <h3>Швидкий доступ до тестів</h3>
                  <div className="quick-tests-list">
                    {stats.quickTests.map((m) => (
                      <a key={m.id} href={m.url} target="_blank" rel="noreferrer" className="quick-test-link">
                        <span>{MATERIAL_LABELS[m.type] ?? m.type}: {m.title}</span>
                        <ArrowRightIcon />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="dash-card">
                <h3>Ціль на сьогодні</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span className="achievement-icon" style={{ margin: 0, background: goalDone ? "var(--success-light)" : "var(--bg)", color: goalDone ? "var(--success)" : "var(--text-secondary)" }}>
                    <TargetIcon />
                  </span>
                  <p style={{ margin: 0 }}>
                    {goalDone
                      ? "Сьогодні ви вже позначили прогрес — чудова робота!"
                      : "Пройдіть хоча б одну тему сьогодні, щоб зберегти серію."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="course-grid">
        {courses.map((c) => (
          <CourseCard key={c.id} course={c} owned />
        ))}
      </div>
    </div>
  );
}
