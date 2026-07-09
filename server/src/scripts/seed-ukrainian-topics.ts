import { pool } from "../db/pool";
import * as coursesRepo from "../repositories/courses.repo";
import * as topicsRepo from "../repositories/topics.repo";
import * as materialsRepo from "../repositories/materials.repo";

// Data transcribed from the "HMT | Українська мова" Telegram group.
// Test links matched to topics by fetching each Google Form's title (which
// encodes the topic name) rather than by guessing order.

interface TopicSeed {
  n: number;
  title: string;
  video: string;
  tests?: { mix?: string; final?: string; module?: string };
}

const TOPICS: TopicSeed[] = [
  { n: 1, title: "1. Алфавіт. Букви та звуки. Класифікація. Співвідношення букв і звуків. Склад. Наголос. Уподібнення", video: "https://youtu.be/R3Cu2hPMFyQ",
    tests: { final: "https://forms.gle/WM43PLCP4SMJYbKGA" } },
  { n: 2, title: "2. Групи слів. Фразеологізми + походження. Будова слова. Спільнокореневі слова й форми слова", video: "https://youtu.be/UjgLEeEC5aE",
    tests: { mix: "https://forms.gle/N6xq2RWipox9vXZ69", final: "https://forms.gle/6ujikowMA334bm5C8" } },
  { n: 3, title: "3. Частини мови. Іменник. Розряди, рід та число", video: "https://youtu.be/gcULjvEbIY4",
    tests: { mix: "https://forms.gle/CQuJwdY546huBg3U9", final: "https://forms.gle/tyxe2Qc657kzkYtZ6" } },
  { n: 4, title: "4. Іменник. Відміни, групи, відмінювання", video: "https://youtu.be/KZFwjPpUSE",
    tests: { mix: "https://forms.gle/xzM4nBnrtTfVL1ob7", final: "https://forms.gle/Y7faKSRr4wqiEAmM9" } },
  { n: 5, title: "5. Іменник. Відмінювання прізвищ. Творення імен по батькові. Правопис складних іменників", video: "https://youtu.be/Dyb3EmkVGJg",
    tests: { mix: "https://forms.gle/S3K5ZcDCxY9eS69D9", final: "https://forms.gle/6BLRsNFEAx5Tbaef6" } },
  { n: 6, title: "6. Прикметник. Правопис складних прикметників", video: "https://youtu.be/WFjU7tDL5p0",
    tests: { mix: "https://forms.gle/22MQFHZ8cX6BVgpH8", final: "https://forms.gle/9o3M2zpQuUuut7bK7" } },
  { n: 7, title: "7. Дієслово. Керування дієслів", video: "https://youtu.be/Lkr5dVPsjok",
    tests: { mix: "https://forms.gle/4CE761S6je6KBBX49", final: "https://forms.gle/BU6kRmkqFsKrpbBM7" } },
  { n: 8, title: "8. Дієприкметник, дієприкметниковий зворот. НН у прикметниках та Н у дієприкметниках", video: "https://youtu.be/VOrDSxbpnU",
    tests: { mix: "https://forms.gle/XXVkSNWHDQdN7eoCA", final: "https://forms.gle/tbyfLKC7c8SWNt9eA" } },
  { n: 9, title: "9. Дієприслівник, дієприслівниковий зворот. Безособові дієслова", video: "https://youtu.be/PM5DquDQF0E",
    tests: { mix: "https://forms.gle/YxU5ZsYrvC4cfDKF8", final: "https://forms.gle/dXSNXcE48mKezmqZA" } },
  { n: 10, title: "10. Числівник. Розряди, відмінювання кількісних", video: "https://youtu.be/iIU9VAPLYCY",
    tests: { mix: "https://forms.gle/jA94XQVcDmkkMCfC6", final: "https://forms.gle/cytATWcsRrb43ZeC9" } },
  { n: 11, title: "11. Числівник. Відмінювання порядкових, узгодження з іменниками, позначення часу", video: "https://youtu.be/DJrURTvV9HU",
    tests: { mix: "https://forms.gle/xcDoPdCHHs6NfEda8", final: "https://forms.gle/wdANVkmmX4eduhBK7" } },
  { n: 12, title: "12. Займенник. Прислівник", video: "https://youtu.be/ZHHm_wO1BtE",
    tests: { mix: "https://forms.gle/S8AaX89JGTX5vhW87", final: "https://forms.gle/W99ohpdmmnxykXg3A" } },
  { n: 13, title: "13. Прийменник. Сполучник. Розрізнення сполучників та інших частин мови", video: "https://youtu.be/zWlRdtcskAM",
    tests: { mix: "https://forms.gle/prJ2UwDVGr9G7so29", final: "https://forms.gle/w5nF85NWchxXSgsc9" } },
  { n: 14, title: "14. Частка. Вигук", video: "https://youtu.be/RJ5WrCM21xU",
    tests: { mix: "https://forms.gle/iurNczXsnBDCzR446", final: "https://forms.gle/awRtdUMUepsNKSgEA" } },
  { n: 15, title: "15. Модульне повторення розділу «Морфологія»", video: "https://youtu.be/DYNVeAPQQMs",
    tests: { module: "https://forms.gle/okv4guQF6Jhc4VXk6" } },
  { n: 16, title: "16. Спрощення. Чергування приголосних та голосних", video: "https://youtu.be/FN6U6dqKZCE",
    tests: { mix: "https://forms.gle/L7wwZkzbhoeW441aA", final: "https://forms.gle/Xn6VJtp8uuPoRzjq9" } },
  { n: 17, title: "17. Чергування у-в, і-й, з//із//зі//зо", video: "https://youtu.be/OeprXzKiNz4",
    tests: { mix: "https://forms.gle/HKT5n4CawBAg5hkt9", final: "https://forms.gle/xucHPxeKGT7fKwEh7" } },
  { n: 18, title: "18. Правопис ненаголошених е, и, о. Правопис суфіксів. Значення суфіксів", video: "https://youtu.be/6kVE9yZ-1R8",
    tests: { mix: "https://forms.gle/9KykiBDw6syMPo6a8", final: "https://forms.gle/2CjEm5EcoSMx1xhx9" } },
  { n: 19, title: "19. Правопис префіксів. Апостроф", video: "https://youtu.be/oMg9LGR-aJY",
    tests: { mix: "https://forms.gle/7mbU2QaL7i1NZ5wq8", final: "https://forms.gle/VXNJLTCKxYuWaghJ9" } },
  { n: 20, title: "20. М'який знак. Буквосполучення ьо, йо", video: "https://youtu.be/h6OBKpSAHxM",
    tests: { mix: "https://forms.gle/74AF2WtZ9sNdBuBt9", final: "https://forms.gle/KEgxoCGBzofuAN2C6" } },
  { n: 21, title: "21. Подвоєння та подовження", video: "https://youtu.be/Snl6v8RcvJQ",
    tests: { mix: "https://forms.gle/e3UwbgyVWZpPxYcJ7", final: "https://forms.gle/fM894Ko68dTxynU87" } },
  { n: 22, title: "22. Правопис великої літери та лапки у власних назвах", video: "https://youtu.be/hZ8dmdRrQZs",
    tests: { mix: "https://forms.gle/cAXphXcVeEnVfw2s7", final: "https://forms.gle/DLvgMqwrT8WWr9Np8" } },
  { n: 23, title: "23. НЕ, НІ з різними частинами мови", video: "https://youtu.be/rQW6mJ8v1go",
    tests: { mix: "https://forms.gle/9J8gWZ59vbEwP5Qq6", final: "https://forms.gle/Fvi4CCbbn6xmDVxY8" } },
  { n: 24, title: "24. Слова іншомовного походження", video: "https://youtu.be/MGpHD_0XeAg",
    tests: { mix: "https://forms.gle/38mQfKZMF3nNAMHY9", final: "https://forms.gle/tL3n4EWoeHUpuSu18" } },
  { n: 25, title: "25. Модульне повторення розділу «Орфографія»", video: "https://youtu.be/nivhrCds5sk",
    tests: { module: "https://forms.gle/mthv31khDCQUuznR7" } },
  { n: 26, title: "26. Словосполучення. Головні члени речення. Узгодження підмета та присудка. Тире між підметом і присудком", video: "https://youtu.be/1jj7ON-Ooc8",
    tests: { mix: "https://forms.gle/cMXJThFZTidHZvzq5", final: "https://forms.gle/doQWZgBSc4aBUGKR7" } },
  { n: 27, title: "27. Другорядні члени речення. Синтаксичні ролі інфінітива. Порівняльний зворот", video: "https://youtu.be/0chE_RqaM88",
    tests: { mix: "https://forms.gle/Daj5Hzgt2MXw5gwu9", final: "https://forms.gle/q9ZFnF2nUWyqytZq8" } },
  { n: 28, title: "28. Ускладнене речення. Однорідні члени речення. Звертання, вставні слова, словосполучення", video: "https://youtu.be/w0foNfxoCvo",
    tests: { mix: "https://forms.gle/ZTPZXM1Ad5a3PkdY7", final: "https://forms.gle/UuYZgZXSsrDXHvDQ8" } },
  { n: 29, title: "29. Відокремлені означення та прикладка", video: "https://youtu.be/FhVPL4iPBGU",
    tests: { mix: "https://forms.gle/7dtd2xFL8kbviTZY9", final: "https://forms.gle/Km19wZ4XUzxfShDB6" } },
  { n: 30, title: "30. Відокремлений додаток і обставина", video: "https://youtu.be/_rCqwSeWVrA" },
  { n: 31, title: "31. Односкладні речення. Речення повні та неповні. Класифікація речень", video: "https://youtu.be/ZMouSm5x4Gc",
    tests: { mix: "https://forms.gle/YriLAQsREf1nNjGDA", final: "https://forms.gle/eiwj8FxtDYng8j6i6" } },
  { n: 32, title: "32. Складносурядне речення", video: "https://youtu.be/zH5LM46bKEM",
    tests: { mix: "https://forms.gle/66FDF6TpMEmk9tSv9", final: "https://forms.gle/Ev1fB3kwaD9sehd28" } },
  { n: 33, title: "33. Складнопідрядне речення. Складне з кількома підрядними", video: "https://youtu.be/exdvA9G9pNs",
    tests: { mix: "https://forms.gle/5GpaRenPCGKsPBGp6", final: "https://forms.gle/KzTRozGXtz73t27EA" } },
  { n: 34, title: "34. Безсполучникове складне речення. Складне з різними видами зв'язку", video: "https://youtu.be/BOc2WsVfGyo",
    tests: { mix: "https://forms.gle/uNGMDwce5nfhQmZc9", final: "https://forms.gle/MifRtCX66UbwM56dA" } },
  { n: 35, title: "35. Пряма мова та непряма мова. Цитата, діалог", video: "https://youtu.be/9d73uCQ7gII",
    tests: { mix: "https://forms.gle/mnADHi1XZYVACbgV9", final: "https://forms.gle/ifXvhEqfSkYgKURn7" } },
  { n: 36, title: "36. Модульне повторення розділу «Синтаксис»", video: "https://youtu.be/qCXExNz4wpc",
    tests: { module: "https://forms.gle/wYWYdfVumefWgvMc6" } },
  { n: 37, title: "37. Текст. Види помилок", video: "https://youtu.be/6omDW8FCc7A",
    tests: { mix: "https://forms.gle/CkxT4nx9Ph3ZgGhL9", final: "https://forms.gle/fbv2K9zmz44kbxsm6" } },
];

async function main() {
  const course = await coursesRepo.findCourseBySlug("ukrainian-full");
  if (!course) throw new Error('Course "ukrainian-full" not found');

  const existingTopics = await topicsRepo.listTopicsByCourse(course.id);
  const topicByTitle = new Map(existingTopics.map((t) => [t.title, t]));

  for (const t of TOPICS) {
    let topic = topicByTitle.get(t.title);
    if (!topic) {
      topic = await topicsRepo.createTopic(course.id, t.title, "", t.n);
      topicByTitle.set(t.title, topic);
      console.log(`+ topic: ${t.title}`);
    }

    const materials = await materialsRepo.listMaterialsByTopic(topic.id);
    const hasUrl = (url: string) => materials.some((m) => m.url === url);
    let sortOrder = materials.length;

    if (!hasUrl(t.video)) {
      await materialsRepo.createMaterial(topic.id, "video", "Відеолекція", t.video, sortOrder++);
      console.log(`  + video`);
    }
    if (t.tests?.mix && !hasUrl(t.tests.mix)) {
      await materialsRepo.createMaterial(topic.id, "test", "Mix-тест", t.tests.mix, sortOrder++);
      console.log(`  + mix test`);
    }
    if (t.tests?.final && !hasUrl(t.tests.final)) {
      await materialsRepo.createMaterial(topic.id, "test", "Final-тест", t.tests.final, sortOrder++);
      console.log(`  + final test`);
    }
    if (t.tests?.module && !hasUrl(t.tests.module)) {
      await materialsRepo.createMaterial(topic.id, "test", "Модульний тест", t.tests.module, sortOrder++);
      console.log(`  + module test`);
    }
  }

  console.log("Seed complete.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
