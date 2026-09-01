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

// Real student feedback (Telegram). Add more here as they come in.
const TESTIMONIALS = [
  {
    quote:
      "Брала повний курс історії України та української мови, також інтенсиви, і жодного разу не пошкодувала. Найбільше сподобалась сама платформа: все дуже зручно організовано та нічого не губиться — лекції, тести та матеріали зібрані в одному місці. Також зручно, що можна відмічати пройдені уроки й бачити прогрес — завдяки цьому підготовка не виглядає хаотичною, навпаки, дуже структурованою та комфортною.",
    name: "Мілена",
    role: "курси «Історія України» та «Українська мова»",
    color: "linear-gradient(135deg, #16a34a, #34d17c)",
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

  return (
    <div className="landing-page">
      <section className="hero noise">
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
                className="btn btn-outline btn-lg"
                onClick={() => scrollToId("features")}
              >
                Дізнатися більше
              </button>
            </Magnetic>
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
                <h3>Скільки тем у кожному курсі</h3>
                <span className="editorial-panel-badge">Повна програма НМТ</span>
              </div>

              <div className="panel-stat-grid">
                <div className="panel-stat">
                  <strong><CountUp value={32} /></strong>
                  <span>теми — Історія України</span>
                </div>
                <div className="panel-stat">
                  <strong><CountUp value={37} /></strong>
                  <span>тем — Українська мова</span>
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

        {courses.length > 0 && (
          <div className="course-collection">
            {courses.map((c, i) => (
              <Reveal key={c.id} delay={i * 80}>
                <CourseCard course={c} variant="secondary" />
              </Reveal>
            ))}
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
