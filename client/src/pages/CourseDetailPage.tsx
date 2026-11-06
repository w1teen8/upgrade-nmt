import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCourse, myCourses, Course, Topic } from "../api/courses.api";
import { useAuth } from "../context/AuthContext";

const TELEGRAM_CONTACT = "https://t.me/w1teen0";

const OLD_PRICE: Record<string, number> = {
  full: 1500,
  turbo: 400,
};

interface CourseCopy {
  tagline: string;
  lead: string[];
  highlights: { title: string; text: string }[];
  perTopic: { label: string; text: string }[];
  perTopicNote: string;
  bonus: { title: string; text: string };
  forWhom: string[];
}

const COURSE_COPY: Record<string, CourseCopy> = {
  "history-full": {
    tagline: "Повний курс на весь рік підготовки",
    lead: [
      "Історія України на НМТ — це не про те, щоб вивчити підручник напам’ять. Це про зв’язки: чому за однією подією пішла наступна, хто з ким і за що воював, яка дата до якого процесу належить. Саме так побудований курс — від стародавньої історії до незалежності, 31 тема послідовно, без прогалин.",
      "Кожна тема — завершений цикл приблизно на годину: подивився відеолекцію, прочитав конспект, перевірив себе двома тестами. Нічого не треба шукати й збирати самому — усі матеріали вже лежать усередині теми й відкриваються в один клік.",
      "Прогрес зберігається: видно, які теми вже пройдені, а до яких варто повернутися. Можна йти за порядком або точково закривати слабкі місця.",
    ],
    highlights: [
      {
        title: "31 тема",
        text: "Теми 2–32 за чинною програмою НМТ — уся історія України від найдавніших часів до сьогодення.",
      },
      {
        title: "Відеолекції",
        text: "Кожна тема починається з розбору: головні події, причини, наслідки й дати, які справді питають.",
      },
      {
        title: "Конспекти і шпаргалки",
        text: "Конспект — щоб розібратися. Шпаргалка — щоб повторити всю тему за десять хвилин перед тестом.",
      },
      {
        title: "Доступ без обмежень",
        text: "Оплата одноразова, курс лишається з вами до самого НМТ. Жодних щомісячних платежів.",
      },
    ],
    perTopic: [
      { label: "Відеолекція", text: "Розбір теми з наголосом на тому, що виноситься в завдання НМТ." },
      { label: "Конспект", text: "Структурований текст теми: події, дати, персоналії, терміни." },
      { label: "Шпаргалка", text: "Стислий витяг на одну-дві сторінки для швидкого повторення." },
      { label: "Mix-тест", text: "Перша перевірка одразу після теми — закріпити щойно вивчене." },
      { label: "Final-тест", text: "Підсумковий тест у форматі НМТ: показує, чи тема справді закрита." },
      { label: "Додаткові матеріали", text: "Таблиці, карти та схеми там, де вони полегшують запам’ятовування." },
    ],
    perTopicNote:
      "Усе це вже всередині теми — на одній сторінці, нічого не треба завантажувати окремо.",
    bonus: {
      title: "Бонус: 5 подкастів для повторення",
      text: "Аудіоповторення тем 2–32 — щоб тримати матеріал у голові дорогою в школу, на тренування чи просто замість стрічки.",
    },
    forWhom: [
      "Готуєтеся до НМТ 2027 і хочете пройти історію системно, а не уривками",
      "Маєте базу, але провалюєтеся на датах і причинно-наслідкових зв’язках",
      "Хочете, щоб усі матеріали були в одному місці, а не в десяти вкладках",
    ],
  },
  "ukrainian-full": {
    tagline: "Повний курс на весь рік підготовки",
    lead: [
      "Українська мова на НМТ перевіряє не начитаність, а правила: орфографію, пунктуацію, норми слововживання, будову слова. Їх скінченна кількість — і цей курс проходить їх усі, 38 тем за програмою НМТ, від алфавіту до синтаксису складного речення.",
      "Кожна тема — завершений цикл приблизно на годину: відеолекція з розбором правила, конспект із прикладами, шпаргалка з винятками та два тести на закріплення. Окремо розбираються випадки, на яких найчастіше втрачають бали.",
      "Прогрес зберігається: видно, що вже пройдено, а що варто повторити ще раз перед пробним тестуванням.",
    ],
    highlights: [
      {
        title: "38 тем",
        text: "Уся програма НМТ з української мови — орфографія, лексика, морфологія, синтаксис, пунктуація.",
      },
      {
        title: "Відеолекції",
        text: "Правило пояснюється на прикладах із реальних завдань НМТ, а не на абстрактних реченнях із підручника.",
      },
      {
        title: "Конспекти і шпаргалки",
        text: "Конспект — щоб зрозуміти правило. Шпаргалка — щоб тримати винятки перед очима.",
      },
      {
        title: "Доступ без обмежень",
        text: "Оплата одноразова, курс лишається з вами до самого НМТ. Жодних щомісячних платежів.",
      },
    ],
    perTopic: [
      { label: "Відеолекція", text: "Розбір правила з прикладами й типовими пастками НМТ." },
      { label: "Конспект", text: "Правило, приклади, винятки — у структурованому вигляді." },
      { label: "Шпаргалка", text: "Найкоротша версія теми для повторення перед тестом." },
      { label: "Mix-тест", text: "Перша перевірка одразу після теми — закріпити правило на практиці." },
      {
        label: "Final-тест",
        text: "Підсумковий тест у форматі НМТ: показує, чи правило справді працює автоматично.",
      },
      { label: "Додаткові матеріали", text: "Таблиці та переліки винятків там, де без них не обійтися." },
    ],
    perTopicNote:
      "Усе це вже всередині теми — на одній сторінці, нічого не треба завантажувати окремо.",
    bonus: {
      title: "Бонус: 6 практикумів",
      text: "Заняття по 1–2 години з розбором найважчих тем і завдань НМТ — там, де теорії мало й треба просто багато прорішати.",
    },
    forWhom: [
      "Готуєтеся до НМТ 2027 і хочете закрити правила системно, а не вгадувати",
      "Знаєте правило, але все одно помиляєтеся на тесті",
      "Хочете мати шпаргалки й тести під рукою, а не шукати їх перед кожним повторенням",
    ],
  },
  "history-turbo": {
    tagline: "Інтенсив на три дні — коли часу вже майже немає",
    lead: [
      "UpRush — це не заміна повному курсу, а швидке повторення всього матеріалу, коли до НМТ лишилися дні. За три дні ви проходите всю історію України ще раз: тільки те, що справді питають, без розлогих відступів.",
      "Кожен день — лекція на цілий блок тем і два тести після неї. Формат простий: подивився, одразу перевірив, побачив діри, повернувся до них.",
      "Якщо матеріал колись учили й він просто вивітрився — цього вистачить, щоб повернути його в активну пам’ять.",
    ],
    highlights: [
      { title: "3 дні", text: "Уся програма розбита на три блоки — по одному на день, без розтягування на місяці." },
      {
        title: "Лекція + 2 тести щодня",
        text: "Повторення одразу закріплюється практикою, а не відкладається на потім.",
      },
      { title: "Тільки суть", text: "Події, дати й зв’язки, які реально виносять у завдання НМТ." },
      {
        title: "Доступ без обмежень",
        text: "Оплата одноразова — інтенсив можна пройти повторно хоч напередодні іспиту.",
      },
    ],
    perTopic: [
      { label: "Лекція дня", text: "Швидке повторення цілого блоку тем за один підхід." },
      { label: "Mix-тест", text: "Перевірка одразу після лекції — що залишилося в голові." },
      { label: "Final-тест", text: "Підсумковий тест дня у форматі НМТ." },
      { label: "Шпаргалки", text: "Стислі витяги, щоб пробігти блок очима ще раз перед сном." },
    ],
    perTopicNote: "Три дні, три блоки — і вся програма повторена.",
    bonus: {
      title: "Повна програма в стислому вигляді",
      text: "В інтенсиві — ті самі теми, що й у повному курсі, але зібрані у три щільні дні повторення.",
    },
    forWhom: [
      "До НМТ лишилися дні, а матеріал треба пробігти весь",
      "Колись учили історію, але багато що забулося",
      "Потрібне фінальне повторення перед іспитом поверх основної підготовки",
    ],
  },
  "ukrainian-turbo": {
    tagline: "Інтенсив на три дні — коли часу вже майже немає",
    lead: [
      "UpRush — це не заміна повному курсу, а швидке повторення всіх правил, коли до НМТ лишилися дні. За три дні ви проходите всю українську мову ще раз: тільки те, що справді питають, без розлогих відступів.",
      "Кожен день — лекція на цілий блок тем і два тести після неї. Формат простий: подивився, одразу перевірив, побачив діри, повернувся до них.",
      "Якщо правила колись учили й вони просто вивітрилися — цього вистачить, щоб повернути їх в активну пам’ять.",
    ],
    highlights: [
      { title: "3 дні", text: "Уся програма розбита на три блоки — по одному на день, без розтягування на місяці." },
      {
        title: "Лекція + 2 тести щодня",
        text: "Повторення одразу закріплюється практикою, а не відкладається на потім.",
      },
      { title: "Тільки суть", text: "Правила й винятки, на яких найчастіше втрачають бали на НМТ." },
      {
        title: "Доступ без обмежень",
        text: "Оплата одноразова — інтенсив можна пройти повторно хоч напередодні іспиту.",
      },
    ],
    perTopic: [
      { label: "Лекція дня", text: "Швидке повторення цілого блоку правил за один підхід." },
      { label: "Mix-тест", text: "Перевірка одразу після лекції — що залишилося в голові." },
      { label: "Final-тест", text: "Підсумковий тест дня у форматі НМТ." },
      { label: "Шпаргалки", text: "Стислі витяги з винятками, щоб пробігти блок очима ще раз перед сном." },
    ],
    perTopicNote: "Три дні, три блоки — і вся програма повторена.",
    bonus: {
      title: "Повна програма в стислому вигляді",
      text: "В інтенсиві — ті самі теми, що й у повному курсі, але зібрані у три щільні дні повторення.",
    },
    forWhom: [
      "До НМТ лишилися дні, а правила треба пробігти всі",
      "Колись учили мову, але багато що забулося",
      "Потрібне фінальне повторення перед іспитом поверх основної підготовки",
    ],
  },
};

function LessonPreview({ topicTitle }: { topicTitle: string }) {
  return (
    <div className="lesson-preview" aria-hidden="true">
      <div className="lesson-preview-bar">
        <span className="lesson-preview-dot" />
        <span className="lesson-preview-dot" />
        <span className="lesson-preview-dot" />
        <span className="lesson-preview-url">upgradenmt.com</span>
      </div>
      <div className="lesson-preview-body">
        <p className="lesson-preview-crumbs">Мої курси · Тема</p>
        <h4>{topicTitle}</h4>
        <div className="lesson-preview-chips">
          <span>Відеолекція</span>
          <span>2 тести</span>
          <span>3 матеріали</span>
        </div>
        <div className="lesson-preview-video">
          <span className="lesson-preview-play" />
          <span className="lesson-preview-video-cap">Відеолекція</span>
        </div>
        <p className="lesson-preview-heading">Перевір себе</p>
        <div className="lesson-preview-row">
          <span className="lesson-preview-check" />
          <span className="lesson-preview-row-title">Mix-тест</span>
          <span className="lesson-preview-action">Пройти</span>
        </div>
        <div className="lesson-preview-row">
          <span className="lesson-preview-check" />
          <span className="lesson-preview-row-title">Final-тест</span>
          <span className="lesson-preview-action">Пройти</span>
        </div>
        <p className="lesson-preview-heading">Матеріали теми</p>
        <div className="lesson-preview-row">
          <span className="lesson-preview-check" />
          <span className="lesson-preview-row-title">Конспект</span>
          <span className="lesson-preview-action">Відкрити</span>
        </div>
        <div className="lesson-preview-row">
          <span className="lesson-preview-check" />
          <span className="lesson-preview-row-title">Шпаргалка</span>
          <span className="lesson-preview-action">Відкрити</span>
        </div>
      </div>
    </div>
  );
}

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<(Course & { topics: Topic[] }) | null>(null);
  const [displayTopics, setDisplayTopics] = useState<Topic[]>([]);
  const [purchased, setPurchased] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    getCourse(slug)
      .then(setCourse)
      .catch(() => setError("Курс не знайдено."));
  }, [slug]);

  useEffect(() => {
    if (!course) return;
    if (course.course_type === "turbo") {
      getCourse(`${course.subject}-full`)
        .then((full) => setDisplayTopics(full.topics))
        .catch(() => setDisplayTopics(course.topics));
    } else {
      setDisplayTopics(course.topics);
    }
  }, [course]);

  useEffect(() => {
    if (!user || !course) return;
    myCourses()
      .then((list) => setPurchased(list.some((c) => c.id === course.id)))
      .catch(() => {});
  }, [user, course]);

  if (error) return <div className="page"><p className="form-error">{error}</p></div>;
  if (!course) return <div className="page">Завантаження...</div>;

  const copy = COURSE_COPY[course.slug];
  const numberedTopics = displayTopics.filter((t) => t.sort_order >= 0);
  const previewTopic = numberedTopics[0]?.title ?? course.title;

  const buyBox = purchased ? (
    <Link to="/dashboard" className="btn btn-primary btn-lg">
      Перейти до курсу
    </Link>
  ) : (
    <div className="buy-box">
      <p>
        Щоб оплатити курс, напишіть нам у Telegram, вкажіть назву курсу — і ми відкриємо доступ
        одразу після оплати.
      </p>
      <a
        href={TELEGRAM_CONTACT}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary btn-lg"
      >
        Написати в Telegram @w1teen0
      </a>
    </div>
  );

  return (
    <div className="page course-detail-page" data-subject={course.subject}>
      <header className="course-hero">
        <div className="course-hero-copy">
          {copy && <p className="course-hero-tagline">{copy.tagline}</p>}
          <h1>{course.title}</h1>
          <p className="course-price">
            {OLD_PRICE[course.course_type] && (
              <span className="price-old">{OLD_PRICE[course.course_type]} грн</span>
            )}
            {Number(course.price_uah)} грн
          </p>
          <p className="course-hero-note">Оплата одноразова, доступ до НМТ 2027.</p>
          {buyBox}
        </div>
        <LessonPreview topicTitle={previewTopic} />
      </header>

      {copy ? (
        <section className="course-section">
          <h2>Про курс</h2>
          {copy.lead.map((paragraph, i) => (
            <p key={i} className="course-lead">
              {paragraph}
            </p>
          ))}
        </section>
      ) : (
        <p className="course-description">{course.description}</p>
      )}

      {copy && (
        <section className="course-section">
          <h2>Що ви отримуєте</h2>
          <div className="course-highlights">
            {copy.highlights.map((h) => (
              <div key={h.title} className="course-highlight">
                <h3>{h.title}</h3>
                <p>{h.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {copy && (
        <section className="course-section">
          <h2>Що йде до кожної теми</h2>
          <ul className="course-pertopic">
            {copy.perTopic.map((item) => (
              <li key={item.label}>
                <span className="course-pertopic-label">{item.label}</span>
                <span className="course-pertopic-text">{item.text}</span>
              </li>
            ))}
          </ul>
          <p className="course-pertopic-note">{copy.perTopicNote}</p>
        </section>
      )}

      {copy && (
        <section className="course-section">
          <div className="course-bonus">
            <h3>{copy.bonus.title}</h3>
            <p>{copy.bonus.text}</p>
          </div>
        </section>
      )}

      {copy && (
        <section className="course-section">
          <h2>Кому підійде</h2>
          <ul className="course-forwhom">
            {copy.forWhom.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {displayTopics.length > 0 && (
        <section className="course-section topic-list">
          <h2>Теми курсу</h2>
          <ol>
            {displayTopics.map((t) => (
              <li key={t.id}>{t.title}</li>
            ))}
          </ol>
        </section>
      )}

      <section className="course-section course-cta">{buyBox}</section>
    </div>
  );
}
