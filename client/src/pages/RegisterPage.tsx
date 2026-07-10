const TELEGRAM_CONTACT = "https://t.me/w1teen0";

export function RegisterPage() {
  return (
    <div className="page auth-page">
      <h1>Реєстрація</h1>
      <p>
        Щоб отримати доступ до курсів, напишіть нам у Telegram — ми створимо акаунт і надішлемо
        дані для входу особисто.
      </p>
      <a href={TELEGRAM_CONTACT} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">
        Написати в Telegram @w1teen0
      </a>
    </div>
  );
}
