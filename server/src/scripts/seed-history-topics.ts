import { pool } from "../db/pool";
import * as coursesRepo from "../repositories/courses.repo";
import * as topicsRepo from "../repositories/topics.repo";
import * as materialsRepo from "../repositories/materials.repo";

// Data transcribed from the "HMT | Історія України" Telegram group (topics 2-32).
// Google Forms test links are only known for topics 2-10 so far (assumed order: Mix, then Final).

interface TopicSeed {
  n: number;
  title: string;
  video: string;
  tests?: { mix: string; final: string };
}

const TOPICS: TopicSeed[] = [
  { n: 2, title: "2 Тема. Стародавня історія України", video: "https://youtu.be/fSycmH81FFc",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSeRQ6tpfJmHHMOgy-USz1RSJsx0PGu3ErmnuZcXzFlTIJW_6A/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLScEMaiqTxJHtOFpFupMcwkvC-pRkZLTO7DgI9JdKAfkfrF_sA/viewform" } },
  { n: 3, title: "3 Тема. Русь-Україна. Київська держава", video: "https://youtu.be/Zeu2DDyTP20",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSdPuMbRD-5FVKxnKZIJ1s5wk-DoFOT2Q-gkiZwTahwnWFNRig/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSfh5ZAWpuUZjjNA6ZjUtN8OYYT0Stw-WZrasn7x7L_PCMv3Zg/viewform" } },
  { n: 4, title: "4 Тема. Королівство Руське (Галицько-Волинська держава). Монгольська навала", video: "https://youtu.be/9G8IWR7HHTM",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSfTXJ9x4ESlXLxe33MgxkSaCqlLoZ42R5aPwEXAHh_ejWwhhQ/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSdOAspEiYgsrxuVBw2TyQAOiPn9elu50_e8heS1WELWbtTkQg/viewform" } },
  { n: 5, title: "5 Тема. Руські удільні князівства у складі іноземних держав. Кримське ханство", video: "https://youtu.be/PnPzOAfU2yE",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSexHyzVaIf1qliN5LQhw9UETrgXia8FIS9m53p2WmKa7vnROw/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSfVOlG1bBGDBLLJKAwX3Aim0BbnmIPC9jJ9ec_g75k_uOfduQ/viewform" } },
  { n: 6, title: "6 Тема. Українські землі у складі Речі Посполитої в другій половині XVI ст.", video: "https://youtu.be/l8_cVN2naaQ",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSfajhiH37ynrovEZJ1JBZpHw_NSIcugB8YeeCVc48mRDD1Fvg/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLScbEwwTpSbMf82vo03kprwXqVCnSYI_zbb1GpHbOTevVFlr4A/viewform" } },
  { n: 7, title: "7 Тема. Українські землі у складі Речі Посполитої в першій половині XVII ст.", video: "https://youtu.be/FxWAHC-HNsw",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSdc5Lk26q9lMlTNYZopdjYtNyF7Y-MZ9rHW5nm1omwW6UJ1xw/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSeiy49TQ7nOMZfAaCVtMXkOZjftPSOqGTWgswD9sQ3VvDptlQ/viewform" } },
  { n: 8, title: "8 Тема. Національно-визвольна війна українського народу середини XVII ст.", video: "https://youtu.be/B-A3qjKcFpY",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSd9fMQrJtVrnBk2xg-zBNw-ZiYxcjQHsmNQ2RybuWYtNDZJ-w/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSejkkJTnJaduoN7rCAY0oGvQoO-AwrAAgpZEloxiKMH2Y0qiw/viewform" } },
  { n: 9, title: "9 Тема. Козацька Україна наприкінці 50-80-х рр. XVII ст.", video: "https://youtu.be/LDqzPCNyyho",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLScznHkamaSUw5IDAKYLhoUF9B5kSG6sMMyFSD45o-5TAQf0sw/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSc9xX7gAE_pbvXbVj_eGye7lV5SQ-Q9KCEcW68yoHOtCQsFcw/viewform" } },
  { n: 10, title: "10 Тема. Українські землі наприкінці XVII — в першій половині XVIII ст.", video: "https://youtu.be/zkXtLag6L3M",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSfQJNm6SuRMBU_T7ObupvoEKbqpMwqfe3OPsDjbUZFMbho5iw/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSfBx-hzsCYFoMJoAHR6yeuJjW83AS0enlPSJfYtbArfprvJ2A/viewform" } },
  { n: 11, title: "11 Тема. Українські землі в другій половині XVIII ст.", video: "https://youtu.be/dB_9EgDKfwM",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLScmx5q396svdAWJ4lHUmhqg4lmBZPJGLmZAddmgmFA3kK0FpA/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSen3qzAiyspFYNATjkmcl2Bf2XQo4uUXYqBNBHAiM02bHYvzg/viewform" } },
  { n: 12, title: "12 Тема. Українські землі у складі Російської імперії наприкінці XVIII — в першій половині XIX ст.", video: "https://youtu.be/07slDdOewXw",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSeO-_0DsmGk8spKGecmlzruWuutLpKPM2fgV8O8HBqlKKFBFA/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSd1ux0PYxD_8L5s40_sdyLLXBdjo1HGDvNEvy3fEFrc1P3f8w/viewform" } },
  { n: 13, title: "13 Тема. Українські землі у складі Австрійської імперії наприкінці XVIII — в першій половині XIX ст.", video: "https://youtu.be/DOkwvQe6GpI",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSeONyW6rIfLJRwPNTkPbJJjNUhbbo_lmneW2GzrcVaH32E8Bg/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSdvRs3V73Ea-wQ3YqsWtbLH3Q-p7_LkXbigJhRk7EJ4TDoUlQ/viewform" } },
  { n: 14, title: "14 Тема. Культура України кінця XVIII — першої половини XIX ст.", video: "https://youtu.be/Z6WLha-utvM",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSfcKsdDhrSh4aCkIjZOdupi6o2sUqG2qV86TzHAbhU7Wi-6Dg/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSdUz6DlcaV-NYp8U303QJBFdidGZUb3EclqTv1NNOZmnY7CKw/viewform" } },
  { n: 15, title: "15 Тема. Українські землі у складі Російської імперії в другій половині XIX ст.", video: "https://youtu.be/iYzth5CRCxY",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSfAhKAEM8G55sA1px6t3m56EkJT-uODGAdu8QqBUEIP32EY8w/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLScgmCqOKofYHLSLerX2gIDBNcKbfQdZdivHicn2VdbgPjOG6Q/viewform" } },
  { n: 16, title: "16 Тема. Українські землі у складі Австро-Угорщини в другій половині XIX ст.", video: "https://youtu.be/d_zoTirnCtg",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLScR3fI0quTrFkr2az8NaYjQin0GdbQs8z2uAiD5Fe8YjYBsqw/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSf5wOBC2s5Q6oQ-Yb4g6maHPpIFEcbD4SYgAXcZO7qHn_NIfQ/viewform" } },
  { n: 17, title: "17 Тема. Культура України в другій половині XIX — на початку XX ст.", video: "https://youtu.be/r732f8aQ1hU",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSeOtyNtmwkeAAOmvklGFZpfxchI4NUW2nI7ghxZHbc13pSxMw/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSeefPkxQhVARmsfNI6N7stJ9yAwTHPdW65Zz8s-MmwrKn-XJw/viewform" } },
  { n: 18, title: "18 Тема. Українські землі у складі Російської імперії в 1900-1914 рр.", video: "https://youtu.be/XEtRI9U3fds",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSf9XOBPwDeUjsXRkH6F-lIYvEM9iW3eJD7rJvWQvq8fd7ZolQ/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSdA369FFhbyKTDjtJdqZuXuc_05ceABpvHmVCGCBIUUEOuEsg/viewform" } },
  { n: 19, title: "19 Тема. Українські землі у складі Австро-Угорщини в 1900-1914 рр.", video: "https://youtu.be/t4qvs1fm8IQ",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLScyhNS4e7ih52orXxA4Rhed0sevbQKvnd-CBDb5ed9WIwqZbg/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSf5-r22ks3mN6Bem3VYS0TfusdDduozhaIUtjk_f7YPmVJlag/viewform" } },
  { n: 20, title: "20 Тема. Україна в роки Першої світової війни", video: "https://youtu.be/Cc_x_Sbpepc",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLScEVQZl005L0OfEwzsNJsrfVBDen6tupffNtRAuGo_YiIL5ww/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSeC9mjB00B997CPa1ciCACAWsxhIm5fKxLOfqbwbmSg_mglag/viewform" } },
  { n: 21, title: "21 Тема. Початок Української революції", video: "https://youtu.be/Kp31lXMIlh4",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSfqrLOqktHIuk3vvZTLzeBI-xyEPRSPL3lkcgdV98girpGf_Q/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLScpFyjGAeD6YlOzbiIzBHTGCCBCnwvEAx4jEJU2oCe2pLQVeg/viewform" } },
  { n: 22, title: "22 Тема. Розгортання української революції. Боротьба за відновлення державності", video: "https://youtu.be/gvPHh9zHZWw",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSc6FB3lbcDCoTPf_xluncxh2EJHw__HX4PI0N8Pl-1i4h7yvg/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSfKqE1DNMGJEpn4a4DG7H_bJDWCHcuzhINB7KXpAoi37GK5Gw/viewform" } },
  { n: 23, title: "23 Тема. Встановлення комуністичного тоталітарного режиму в Україні", video: "https://youtu.be/gD03pAePpK4",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSdSb2rqmpm6JXh5qBsw6oJ9LTf9qi_awZPGnqAFWR8a4MGTOg/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSdgun_R5cjVDI_CkHgPjrLfvNI937z6l8NFhWcX3x_BST1DIw/viewform" } },
  { n: 24, title: "24 Тема. Утвердження більшовицького тоталітарного режиму в Україні", video: "https://youtu.be/N7gD3MguWEE",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLScZ1HaZ9OfFrlJd3f7SP2Agl2niGDrxMu3gxxGfWkv9eNdWpA/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLScA_ElmW0QhTCywzcr7Gza8YJQYLtIDRiglk09q7Ymg0KAdfw/viewform" } },
  { n: 25, title: "25 Тема. Західноукраїнські землі в міжвоєнний період", video: "https://youtu.be/vEet9p-0aSM",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSenWmOi0KBBxSwmDWnZdTF98jgzcuS_P4otmr_R2PavDs9Abg/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSfDdyOsg2gy0Je_uMsTjIgXSPCT9svbbA7pfn0lUP8w0vNBGw/viewform" } },
  { n: 26, title: "26 Тема. Україна у роки Другої світової війни", video: "https://youtu.be/ezzITvAhjeM",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSe7JkG6g2lWR1AS9Ls5E-Lq2NNgq-u8NfYjlZLuI0PTme9g1g/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLScVMUt0BNVof1QEPZzwjLbEFOKg3p4B1wzy-lqXfY8V6lfpYg/viewform" } },
  { n: 27, title: "27 Тема. Україна в перші повоєнні роки", video: "https://youtu.be/eYed6nrM2-I",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLScEUPa198MvsJivD5nw-Me0W1NNXmovUfLq4q0cTnb22TQrBA/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSdMVvWBDW-8wV7hRsxkDd6RbW8mDlvwyyYVAN0-KAEUufW3yQ/viewform" } },
  { n: 28, title: "28 Тема. Україна в умовах десталінізації", video: "https://youtu.be/mDgKs5KG9NA",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLScfMvZNS95Hgy7tynfbqA1faV15aqTXEPue-4dQ1Cd5aYn8-g/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSd8zET4-b2DwBQOY8kuoUsgyL9a66gBLm5_yi9Em7UK9i-RlQ/viewform" } },
  { n: 29, title: "29 Тема. Україна в період загострення кризи радянської системи", video: "https://youtu.be/Mady8cV4cyk",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSfprO7gwH63VXZD3lIV9-AriqJR0V4FjJLM6K5AYsGITYd4uA/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSdQBDCcIQPFq1-TNBtVz5l7aOHUGNOYK0LM6C1_DJm5yGiYdA/viewform" } },
  { n: 30, title: "30 Тема. Відновлення незалежності України", video: "https://youtu.be/hhCSzQrbMMk",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSdzy6slLcOuIFq6zYHTYBWCFy-Q8QpmsM758_gB-NRSFDtTiw/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLScWipzKerIFNA0Ic_zZ1syZAKL29h_78tXAPi6oFsZROPsy5Q/viewform" } },
  { n: 31, title: "31 Тема. Становлення України як незалежної держави", video: "https://youtu.be/P29db8N0S0U",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSfsm_yDsMlt2ZtbeTUjtuDO694byPmgabu9vsYoFp2SKJoJDg/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSdBPaxcYB3SG3vRGokOXdMnInICtHQEk0nV6O3v-f6ouAhXkg/viewform" } },
  { n: 32, title: "32 Тема. Творення нової України", video: "https://youtu.be/Cl4xtVChx8k",
    tests: { mix: "https://docs.google.com/forms/d/e/1FAIpQLSeeleoJt9NAHOVpisYKhXmx8U0ZjqerTkX7hKYbmCC8fzTIHg/viewform", final: "https://docs.google.com/forms/d/e/1FAIpQLSffuOhCPHy9BhAGZrYA76XtmhOf1aTgvZSGMqo9UHvO8M_GsQ/viewform" } },
];

const BONUS_PODCASTS = [
  { title: "Подкаст I 2-5 теми", url: "https://youtu.be/DtE0AKdh92I" },
  { title: "Подкаст I 6-11 теми", url: "https://youtu.be/kDJe-r9PPt8" },
  { title: "Подкаст I 12-19 теми", url: "https://youtu.be/dAPsPnVPHwA" },
  { title: "Подкаст I 20-25 теми", url: "https://youtu.be/suDPf_Se_IQ" },
  { title: "Подкаст I 26-32 теми", url: "https://youtu.be/xyFVaPhbPr8" },
];

async function main() {
  const course = await coursesRepo.findCourseBySlug("history-full");
  if (!course) throw new Error('Course "history-full" not found');

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
    if (t.tests) {
      if (!hasUrl(t.tests.mix)) {
        await materialsRepo.createMaterial(topic.id, "test", "Mix-тест", t.tests.mix, sortOrder++);
        console.log(`  + mix test`);
      }
      if (!hasUrl(t.tests.final)) {
        await materialsRepo.createMaterial(topic.id, "test", "Final-тест", t.tests.final, sortOrder++);
        console.log(`  + final test`);
      }
    }
  }

  // Bonus podcasts as their own topic at the end of the course
  const bonusTitle = "Бонус: 5 подкастів для повторення";
  let bonusTopic = topicByTitle.get(bonusTitle);
  if (!bonusTopic) {
    bonusTopic = await topicsRepo.createTopic(course.id, bonusTitle, "", -1);
    console.log(`+ topic: ${bonusTitle}`);
  }
  const bonusMaterials = await materialsRepo.listMaterialsByTopic(bonusTopic.id);
  const bonusHasUrl = (url: string) => bonusMaterials.some((m) => m.url === url);
  let bonusSort = bonusMaterials.length;
  for (const p of BONUS_PODCASTS) {
    if (!bonusHasUrl(p.url)) {
      await materialsRepo.createMaterial(bonusTopic.id, "video", p.title, p.url, bonusSort++);
      console.log(`  + podcast: ${p.title}`);
    }
  }

  console.log("Seed complete.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
