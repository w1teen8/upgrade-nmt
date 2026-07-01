# НМТ 2027 — платформа курсів

Повний курс "Історія України" (1500 грн), повний курс "Українська мова" (1500 грн),
"ТурбоБум: Історія України" (400 грн), "ТурбоБум: Українська мова" (400 грн).

Стек: Express + PostgreSQL (`/server`), React + Vite (`/client`). Оплата — LiqPay
(Google Pay / Apple Pay доступні автоматично в хостед-чекауті LiqPay). Реєстрація з
підтвердженням email через Resend.

## Локальний запуск

Потрібен Node.js 20+ і PostgreSQL, що працює локально (або через Docker).

1. `npm install` (у корені — встановить і server, і client через workspaces)
2. Створіть базу даних `nmt_courses` у своєму PostgreSQL.
3. Скопіюйте `server/.env.example` → `server/.env`, заповніть значення (див. нижче).
4. Скопіюйте `client/.env.example` → `client/.env` (`VITE_API_URL=http://localhost:4000`).
5. Застосуйте міграції: `npm run migrate` (заповнить таблиці і додасть 4 курси).
6. Запустіть backend: `npm run dev:server` (порт 4000).
7. У новому терміналі запустіть frontend: `npm run dev:client` (порт 5173).

### Потрібні ключі для `.env`

- `RESEND_API_KEY` — реєстрація на resend.com, безкоштовний план дозволяє надсилати листи.
  Для реальних листів студентам потрібно підтвердити власний домен у Resend (Settings → Domains).
  Поки домен не підтверджено, листи будуть надійно доходити лише на пошту власника акаунта Resend.
- `LIQPAY_PUBLIC_KEY` / `LIQPAY_PRIVATE_KEY` — кабінет продавця на liqpay.ua, розділ API,
  спочатку використовуйте sandbox-ключі (`LIQPAY_SANDBOX=true`).
- `JWT_SECRET` — будь-який довгий випадковий рядок.

## Призначення адміністратора

Спеціальної форми для цього немає навмисно. Власник курсів реєструється і підтверджує
email як звичайний користувач, а потім роль підвищується напряму в базі:

```sql
UPDATE users SET role = 'admin' WHERE email = 'ваш-email@example.com';
```

Після цього на сайті з'явиться пункт меню "Адмін" (`/admin/courses`), де можна додавати
теми та матеріали (конспекти, шпаргалки, тести, відео — просто посилання) до кожного курсу.

## Деплой на Railway

1. Запуште цей репозиторій у GitHub.
2. Створіть проєкт у Railway → додайте плагін **PostgreSQL**.
3. Додайте сервіс із GitHub-репозиторію, root directory `server`:
   - Build: `npm install && npm run build`
   - Start: `npm run start`
   - Змінні середовища: `DATABASE_URL` (посилання на Postgres-плагін через `${{Postgres.DATABASE_URL}}`),
     `JWT_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `LIQPAY_PUBLIC_KEY`, `LIQPAY_PRIVATE_KEY`,
     `LIQPAY_SANDBOX=true`, `APP_URL` (домен клієнта, додасте після кроку 4),
     `SERVER_URL` (домен цього сервісу), `CORS_ORIGIN` (= `APP_URL`).
4. Додайте другий сервіс з того ж репозиторію, root directory `client`:
   - Build: `npm install && npm run build`
   - Start: `npm run start`
   - Змінна середовища: `VITE_API_URL` = публічний домен сервісу `server`.
5. У Railway → Settings → Networking згенеруйте публічні домени для обох сервісів.
6. Оновіть `APP_URL` і `CORS_ORIGIN` у сервісі `server` на реальний домен `client`, передеплойте.
7. Виконайте міграції проти продакшн-бази: `DATABASE_URL="<зовнішній URL з Railway>" npm run migrate`
   (запустити локально один раз).
8. Зареєструйтеся на живому сайті власним акаунтом, підтвердіть email, підвищіть роль до
   `admin` через SQL (див. вище).
9. Коли надішлете мені PDF/тести/відео — додам їх через адмін-панель, або зробіть це самі.
10. Після успішної тестової оплати в sandbox-режимі LiqPay — перемкніть `LIQPAY_SANDBOX=false`
    і вставте бойові ключі з кабінету LiqPay.

## Структура проєкту

```
server/   Express API, PostgreSQL, LiqPay, Resend
client/   React SPA (Vite), 4 картки курсів, кабінет, адмін-панель
```
