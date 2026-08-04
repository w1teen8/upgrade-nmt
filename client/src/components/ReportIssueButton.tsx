const TELEGRAM_CONTACT = "https://t.me/w1teen0";

export function ReportIssueButton() {
  return (
    <a
      href={TELEGRAM_CONTACT}
      target="_blank"
      rel="noopener noreferrer"
      className="report-issue-btn"
      title="Знайшли помилку? Напишіть нам у Telegram"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M21.05 2.94a1.5 1.5 0 0 0-1.56-.24L2.7 9.72a1.4 1.4 0 0 0 .07 2.62l4.4 1.44 1.7 5.44a1.4 1.4 0 0 0 2.32.55l2.4-2.28 4.3 3.17a1.4 1.4 0 0 0 2.22-.85l2.7-15.1a1.5 1.5 0 0 0-.76-1.77ZM8.98 13.4l8.9-6.98c.24-.19.5.11.29.32l-7.4 7.36-.3 3.02-1.49-3.72Z" />
      </svg>
      <span>Знайшли помилку? Напишіть нам</span>
    </a>
  );
}
