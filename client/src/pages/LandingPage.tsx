import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { listCourses, Course } from "../api/courses.api";
import { getPublicStats } from "../api/stats.api";
import { CourseCard } from "../components/CourseCard";
import { CountUp } from "../components/CountUp";
import { Reveal } from "../components/Reveal";
import { Magnetic } from "../components/Magnetic";
import { FaqAccordion, FaqEntry } from "../components/FaqAccordion";
import { VideoIcon, NotesIcon, CheckBadgeIcon, GiftIcon, ArrowRightIcon } from "../components/icons";

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

// Placeholder social proof — swap for real student feedback before launch.
const TESTIMONIALS = [
  {
    quote:
      "Матеріали структуровані по темах, тож не довелось збирати конспекти по різних чатах і папках — усе в одному кабінеті.",
    name: "Марія",
    role: "курс «Історія України»",
    color: "linear-gradient(135deg, #0d9488, #2dd4bf)",
  },
  {
    quote:
      "Подобається, що можна проходити теми у своєму темпі й одразу перевіряти себе тестом після кожної.",
    name: "Олег",
    role: "курс «Українська мова»",
    color: "linear-gradient(135deg, #ea580c, #fb923c)",
  },
  {
    quote: "UpRush підійшов для швидкого повторення перед НМТ — тільки суть, без зайвого.",
    name: "Софія",
    role: "UpRush: Історія України",
    color: "linear-gradient(135deg, #0f766e, #ea580c)",
  },
];

const FAQ: FaqEntry[] = [
  {
    q: "Чи можна проходити курс у своєму темпі?",
    a: "Так. Після відкриття доступу всі матеріали курсу доступні одразу — дивіться відео, конспекти й проходьте тести у зручному для себе темпі, без дедлайнів.",
  },
  {
    q: "Як відбувається оплата?",
    a: "Оплата проходить поза сайтом: ви пишете в Telegram, переказуєте кошти, після чого адміністратор вручну відкриває доступ до курсу у вашому кабінеті.",
  },
  {
    q: "Що входить у повний курс?",
    a: "Відеолекції по кожній темі програми, конспекти, шпаргалки для повторення та тести для перевірки знань — плюс бонусні матеріали без додаткової оплати.",
  },
  {
    q: "Чим UpRush відрізняється від повного курсу?",
    a: "UpRush — стислий інтенсив: ключові шпаргалки, практичні завдання й тести для швидкого повторення матеріалу перед НМТ.",
  },
  {
    q: "Чи є реферальна програма?",
    a: "Так — запрошуйте друзів і отримуйте бонуси за кожного, хто приєднається. Деталі на сторінці «Реферальна система».",
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

  const [featured, ...rest] = Array.isArray(courses) ? courses : [];

  return (
    <div className="landing-page">
      <section className="hero noise">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-glow hero-glow-a" aria-hidden="true" />
        <div className="hero-glow hero-glow-b" aria-hidden="true" />
        <div className="hero-glow hero-glow-c" aria-hidden="true" />

        <div className="hero-inner">
          <span className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            UpGrade NMT · Підготовка до НМТ 2027
          </span>
          <h1>
            Підготовка до НМТ,
            <br />
            яка відчувається <span className="hero-headline-accent">простіше</span>.
          </h1>
          <p className="hero-subtitle">
            Історія України та українська мова — відеолекції, конспекти, шпаргалки й тести по
            кожній темі програми, зібрані в одному кабінеті.
          </p>
          <div className="hero-actions">
            <Magnetic>
              <button type="button" className="btn btn-primary btn-lg" onClick={() => scrollToId("courses")}>
                Обрати курс
                <ArrowRightIcon className="btn-arrow" />
              </button>
            </Magnetic>
            <Magnetic>
              <button
                type="button"
                className="btn btn-ghost-dark btn-lg"
                onClick={() => scrollToId("features")}
              >
                Дізнатися більше
              </button>
            </Magnetic>
          </div>

          <div className="hero-stats-band">
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
        </div>
      </section>

      <section id="features" className="section">
        <div className="editorial">
          <Reveal className="editorial-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              Що всередині
            </span>
            <h2>Все для підготовки в одному кабінеті</h2>
            <p>Жодних розкиданих файлів і посилань — тільки структуровані матеріали по темах.</p>
            <div className="editorial-list">
              {FEATURES.map((f) => (
                <div className="editorial-item" key={f.title}>
                  <div className="editorial-item-icon">{f.icon}</div>
                  <div>
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="editorial-panel noise">
              <div className="editorial-panel-glow" aria-hidden="true" />
              <div className="editorial-panel-head">
                <h3>Прогрес по курсах</h3>
                <span className="editorial-panel-badge">Кабінет учня</span>
              </div>

              <div className="progress-row">
                <div className="progress-row-top">
                  <span>Історія України</span>
                  <b>32 теми</b>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: "78%" }} />
                </div>
              </div>

              <div className="progress-row">
                <div className="progress-row-top">
                  <span>Українська мова</span>
                  <b>37 тем</b>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: "54%" }} />
                </div>
              </div>

              <div className="editorial-panel-tags">
                <span className="editorial-panel-tag">Конспекти</span>
                <span className="editorial-panel-tag">Шпаргалки</span>
                <span className="editorial-panel-tag">Тести</span>
                <span className="editorial-panel-tag">Відео</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="courses" className="section section-alt">
        <Reveal className="section-title">
          <span className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            Курси
          </span>
          <h2>Обери свій курс</h2>
          <p>Повні курси з усією програмою або UpRush для швидкого фінального повторення.</p>
        </Reveal>

        {error && <p className="form-error">{error}</p>}

        {featured && (
          <div className="course-collection">
            <Reveal>
              <CourseCard course={featured} variant="featured" />
            </Reveal>
            <div className="course-collection-secondary">
              {rest.map((c, i) => (
                <Reveal key={c.id} delay={(i + 1) * 80}>
                  <CourseCard course={c} variant="secondary" />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="section section-tight">
        <Reveal className="proof-strip">
          <div className="proof-avatars" aria-hidden="true">
            {TESTIMONIALS.map((t) => (
              <span className="proof-avatar" style={{ background: t.color }} key={t.name}>
                {t.name[0]}
              </span>
            ))}
          </div>
          <span>
            {registeredUsers !== null
              ? `Разом із ${registeredUsers} учнями, які вже готуються з UpGrade NMT`
              : "Учні вже готуються разом з UpGrade NMT"}
          </span>
        </Reveal>

        <div className="testimonial-grid">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 90}>
              <div className="testimonial-card">
                <p className="testimonial-quote">«{t.quote}»</p>
                <div className="testimonial-author">
                  <span className="testimonial-avatar" style={{ background: t.color }}>
                    {t.name[0]}
                  </span>
                  <div>
                    <div className="testimonial-author-name">{t.name}</div>
                    <div className="testimonial-author-role">{t.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="faq" className="section section-alt">
        <Reveal className="section-title">
          <span className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            Питання
          </span>
          <h2>Часті запитання</h2>
        </Reveal>
        <Reveal delay={80}>
          <FaqAccordion items={FAQ} />
        </Reveal>
      </section>

      <section className="final-cta noise">
        <div className="final-cta-glow" aria-hidden="true" />
        <Reveal>
          <h2>Готовий підняти свій результат на НМТ?</h2>
          <p>Обери курс, відкрий доступ і почни готуватись вже сьогодні — крок за кроком, по темах.</p>
          <Magnetic>
            <button type="button" className="btn btn-primary btn-lg" onClick={() => scrollToId("courses")}>
              Почати підготовку
              <ArrowRightIcon className="btn-arrow" />
            </button>
          </Magnetic>
        </Reveal>
      </section>
    </div>
  );
}
