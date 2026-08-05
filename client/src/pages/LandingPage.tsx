import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { listCourses, Course } from "../api/courses.api";
import { getPublicStats } from "../api/stats.api";
import { CourseCard } from "../components/CourseCard";
import { CountUp } from "../components/CountUp";
import { Reveal } from "../components/Reveal";
import { VideoIcon, NotesIcon, CheckBadgeIcon, GiftIcon } from "../components/icons";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const FEATURES = [
  {
    icon: <VideoIcon />,
    title: "Відеолекції по кожній темі",
    desc: "Розбір усіх тем програми НМТ у форматі коротких, структурованих відео.",
  },
  {
    icon: <NotesIcon />,
    title: "Конспекти та шпаргалки",
    desc: "Стислі матеріали для повторення перед тестами й самим НМТ.",
  },
  {
    icon: <CheckBadgeIcon />,
    title: "Тести після кожної теми",
    desc: "Mix- та Final-тести — перевір, наскільки добре засвоїв матеріал.",
  },
  {
    icon: <GiftIcon />,
    title: "Бонуси в кожному курсі",
    desc: "Додаткові матеріали для повторення — включені безкоштовно до вартості курсу.",
  },
];

export function LandingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<number | null>(null);
  const location = useLocation();

  useEffect(() => {
    listCourses()
      .then(setCourses)
      .catch(() => setError("Не вдалося завантажити курси."));
  }, []);

  useEffect(() => {
    getPublicStats()
      .then((s) => setRegisteredUsers(s.registeredUsers))
      .catch(() => {});
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
              <strong><CountUp value={32} /></strong>
              <span>Теми з історії</span>
            </div>
            <div className="hero-stat">
              <strong><CountUp value={37} /></strong>
              <span>Тем з української</span>
            </div>
            <div className="hero-stat">
              <strong><CountUp value={4} /></strong>
              <span>Формати матеріалів</span>
            </div>
            <div className="hero-stat">
              <strong><CountUp value={2027} /></strong>
              <span>Рік НМТ</span>
            </div>
            {registeredUsers !== null && (
              <div className="hero-stat">
                <strong><CountUp value={registeredUsers} /></strong>
                <span>Зареєстровано учнів</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <Reveal className="section-title">
          <span className="eyebrow">Що всередині</span>
          <h2>Все для підготовки в одному кабінеті</h2>
          <p>Жодних розкиданих файлів і посилань — тільки структуровані матеріали по темах.</p>
        </Reveal>
        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 90}>
              <div className="feature">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="courses" className="section section-alt">
        <Reveal className="section-title">
          <span className="eyebrow">Курси</span>
          <h2>Обери свій курс</h2>
        </Reveal>

        {error && <p className="form-error">{error}</p>}

        <div className="course-grid">
          {courses.map((c, i) => (
            <Reveal key={c.id} delay={i * 80}>
              <CourseCard course={c} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
