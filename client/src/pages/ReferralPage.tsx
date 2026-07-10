const TELEGRAM_CONTACT = "https://t.me/w1teen0";

const TIERS = [
  {
    icon: "💌",
    title: "Друг купив 1 курс",
    reward: "300 грн",
  },
  {
    icon: "🔖",
    title: "Друг купив 2 курси",
    reward: "600 грн",
  },
];

export function ReferralPage() {
  return (
    <div className="page referral-page">
      <div className="section-title">
        <span className="eyebrow">Реферальна система</span>
        <h1>Заробляй разом із нами!</h1>
        <p>Запрошуй друзів на курси UpGrade NMT — і отримуй винагороду за кожного, хто приєднається.</p>
      </div>

      <div className="referral-tiers">
        {TIERS.map((t) => (
          <div className="referral-tier" key={t.title}>
            <div className="referral-tier-icon">{t.icon}</div>
            <h3>{t.title}</h3>
            <p className="referral-tier-reward">{t.reward}</p>
          </div>
        ))}
      </div>

      <p className="referral-note">💵 Запрошуй більше людей — заробляй більше.</p>

      <div className="buy-box referral-cta">
        <p>Щоб узяти участь у програмі, напишіть нам у Telegram — розкажемо деталі й видамо ваше реферальне посилання.</p>
        <a href={TELEGRAM_CONTACT} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg">
          Написати в Telegram @w1teen0
        </a>
      </div>
    </div>
  );
}
