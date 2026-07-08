import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { listCourses, Course } from "../api/courses.api";
import { CourseCard } from "../components/CourseCard";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const FEATURES = [
  {
    icon: "🎥",
    title: "Відеолекції по кожній темі",
    desc: "Розбір усіх тем програми НМТ у форматі коротких, структурованих відео.",
  },
  {
    icon: "📝",
    title: "Конспекти та шпаргалки",
    desc: "Стислі матеріали для повторення перед тестами й самим НМТ.",
  },
  {
    icon: "✅",
    title: "Тести після кожної теми",
    desc: "Mix- та Final-тести — перевір, наскільки добре засвоїв матеріал.",
  },
  {
    icon: "🎁",
    title: "Бонуси в кожному курсі",
    desc: "Додаткові матеріали для повторення — включені безкоштовно до вартості курсу.",
  },
];

export function LandingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    listCourses()
      .then(setCourses)
      .catch(() => setError("Не вдалося завантажити курси."));
  }, []);

  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (scrollTo) {
      scrollToId(scrollTo);
    }
  }, [location.state]);

  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-inner">
          <span className="eyebrow">UpGrade NMT</span>
          <h1>Підготовка до НМТ без хаосу й зайвого часу</h1>
          <p>
            Історія України та українська мова — відеолекції, конспекти, шпаргалки й тести
            по кожній темі програми, зібрані в одному місці.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary btn-lg" onClick={() => scrollToId("courses")}>
              Обрати курс
            </button>
            <button type="button" className="btn btn-outline btn-lg" onClick={() => scrollToId("features")}>
              Що всередині
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <strong>31</strong>
              <span>Тема з історії</span>
            </div>
            <div className="hero-stat">
              <strong>4</strong>
              <span>Формати матеріалів</span>
            </div>
            <div className="hero-stat">
              <strong>2027</strong>
              <span>Рік НМТ</span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <div className="section-title">
          <span className="eyebrow">Що всередині</span>
          <h2>Все для підготовки в одному кабінеті</h2>
          <p>Жодних розкиданих файлів і посилань — тільки структуровані матеріали по темах.</p>
        </div>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div className="feature" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="courses" className="section section-alt">
        <div className="section-title">
          <span className="eyebrow">Курси</span>
          <h2>Обери свій курс</h2>
          <p>Повний курс охоплює всю програму, ТурбоБум — швидке повторення перед іспитом.</p>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="course-grid">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
