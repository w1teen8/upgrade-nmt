import { useEffect, useState } from "react";
import { listCourses, Course } from "../api/courses.api";
import { CourseCard } from "../components/CourseCard";
import { FaqAccordion, FaqEntry } from "../components/FaqAccordion";

const TOTAL_TOPICS = 69;
const EXAM_DATE = new Date(2027, 5, 1); // 1 червня 2027

function daysUntilExam(): number {
  const diff = EXAM_DATE.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

interface ScoreBand {
  coverage: number;
  hours: string;
  text: string;
}

function bandFor(score: number): ScoreBand {
  if (score < 130) {
    return {
      coverage: 0.4,
      hours: "3–4",
      text: "Це нижче порогу для більшості спеціальностей. Вистачить <strong>базових тем</strong>: терміни, дати й головні правила.",
    };
  }
  if (score <= 154) {
    return {
      coverage: 0.75,
      hours: "5–6",
      text: "Прохідний бал на контракт у багатьох університетах. Достатньо <strong>пройти програму один раз</strong> і закрити слабкі теми.",
    };
  }
  if (score <= 174) {
    return {
      coverage: 1,
      hours: "7–8",
      text: "Реальна межа бюджету на популярних спеціальностях. Потрібно <strong>пройти всі 69 тем</strong> і повернутись до помилок.",
    };
  }
  if (score <= 189) {
    return {
      coverage: 1.3,
      hours: "9–10",
      text: "Верхні <strong>10% абітурієнтів</strong>. Тут вирішують деталі: історичні джерела, карти, наголоси й пунктуація.",
    };
  }
  return {
    coverage: 1.6,
    hours: "10+",
    text: "Майже без помилок. Готуй <strong>кожну тему двічі</strong> й доводь тести до стабільних 95%.",
  };
}

const HOW_STEPS = [
  { title: "Дивись", desc: "Відеолекція без переказу підручника: тільки те, що перевіряють на тесті." },
  { title: "Конспектуй", desc: "Готовий конспект, у який ти дописуєш свої приклади й асоціації." },
  { title: "Тестуй", desc: "20 питань у форматі НМТ одразу після теми, з поясненням кожної відповіді." },
  { title: "Повторюй", desc: "Помилки повертаються через 3, 10 і 30 днів — поки не почнеш відповідати впевнено." },
];

const FAQ: FaqEntry[] = [
  {
    q: "Скільки часу потрібно щотижня?",
    a: "Близько трьох годин на предмет, якщо починаєш за рік до іспиту. Планувальник угорі сторінки перерахує темп під твій цільовий бал.",
  },
  {
    q: "Я починаю з нуля. Встигну?",
    a: "Так, якщо стартуєш восени. Теми йдуть від простих до складних, і перед кожною є короткий блок базових понять.",
  },
  {
    q: "Чи будуть матеріали оновлені під програму 2027 року?",
    a: "Теми оновлюємо після кожної публікації програми МОН. Позначка «оновлено» біля теми в кабінеті.",
  },
  {
    q: "Чим UpRush відрізняється від повного курсу?",
    a: "Повний курс — весь матеріал з відеолекціями й конспектами на рік підготовки. UpRush — триденний інтенсив: уся програма стисло, практика, шпаргалки й тести.",
  },
];

function scrollToCourses() {
  document.getElementById("courses")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function LandingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(175);

  useEffect(() => {
    listCourses()
      .then(setCourses)
      .catch(() => setError("Не вдалося завантажити курси."));
  }, []);

  const daysLeft = daysUntilExam();
  const weeks = Math.max(1, Math.round(daysLeft / 7));
  const band = bandFor(score);
  const topicsPerWeek = Math.max(1, Math.ceil((TOTAL_TOPICS * band.coverage) / weeks));
  const sliderPct = ((score - 100) / 100) * 100;

  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="pill-counter">{daysLeft} днів до основної сесії НМТ 2027</p>
            <h1>Історія та мова, розкладені на теми, які реально встигнути</h1>
            <p className="hero-lede">
              Кожна тема програми — це відеолекція, конспект на кілька сторінок, шпаргалка з
              датами та тест у форматі НМТ. Проходиш тему — бачиш, скільки балів вона тобі вже
              дає.
            </p>
            <div className="hero-actions">
              <button type="button" className="btn btn-primary btn-lg" onClick={scrollToCourses}>
                Почати навчання
              </button>
              <button type="button" className="btn btn-outline btn-lg" onClick={scrollToCourses}>
                Обери свій курс
              </button>
              <a className="hero-telegram" href="https://t.me/upgradenmt" target="_blank" rel="noreferrer">
                Наш Telegram-канал
              </a>
            </div>
            <p className="hero-fine-print">
              Доступ з телефона й ноутбука. Скасувати підписку можна будь-коли.
            </p>
          </div>

          <div className="planner" aria-label="Планувальник цільового балу">
            <p className="planner-title">Який бал тобі потрібен?</p>
            <p className="planner-score">{score}</p>
            <input
              type="range"
              min={100}
              max={200}
              step={1}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              aria-label="Цільовий бал НМТ"
              style={{
                background: `linear-gradient(to right, var(--accent-bright) ${sliderPct}%, rgba(255,255,255,.25) ${sliderPct}%)`,
              }}
            />
            <div className="planner-scale">
              <span>100</span>
              <span>150</span>
              <span>200</span>
            </div>
            <p className="planner-output" dangerouslySetInnerHTML={{ __html: band.text }} />
            <div className="planner-stats">
              <div className="planner-stat">
                <strong>{weeks}</strong>
                <span>тижнів до іспиту</span>
              </div>
              <div className="planner-stat">
                <strong>{topicsPerWeek}</strong>
                <span>теми на тиждень</span>
              </div>
              <div className="planner-stat">
                <strong>{band.hours}</strong>
                <span>годин на тиждень</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="courses" className="section">
        <div className="section-title align-left">
          <h2>Чотири курси на вибір</h2>
          <p>
            Повні курси — на весь рік підготовки. UpRush — коли до НМТ лишились дні й треба
            пробігти всю програму ще раз.
          </p>
        </div>

        {error && <p className="form-error">{error}</p>}

        {courses.length > 0 && (
          <div className="course-collection">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} variant="secondary" />
            ))}
          </div>
        )}
      </section>

      <section id="how" className="section section-alt">
        <div className="section-title align-left">
          <h2>Одна тема — чотири кроки</h2>
          <p>Цикл повторюється для кожної теми. На нього йде приблизно година.</p>
        </div>
        <ol className="steps">
          {HOW_STEPS.map((s, i) => (
            <li className="step" key={s.title}>
              <span className="step-num">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="faq" className="section">
        <div className="section-title align-left">
          <h2>Питання, які ставлять найчастіше</h2>
        </div>
        <FaqAccordion items={FAQ} />
      </section>

      <section className="final-cta">
        <div className="final-cta-inner">
          <h2>Обери курс і починай</h2>
          <p>
            Повні курси зі знижкою до 1200 грн, інтенсиви UpRush — 200 грн. Оплата одноразова,
            доступ одразу після неї.
          </p>
          <button type="button" className="btn btn-primary btn-lg" onClick={scrollToCourses}>
            Перейти до курсів
          </button>
        </div>
      </section>
    </div>
  );
}
