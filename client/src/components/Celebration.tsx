import { useEffect } from "react";

const COLORS = ["#2563eb", "#22c55e", "#f59e0b", "#64748b", "#93c5fd"];

function Confetti() {
  const pieces = Array.from({ length: 36 }, (_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 0.4;
    const duration = 1.8 + Math.random() * 1.2;
    const color = COLORS[i % COLORS.length];
    const rotate = Math.random() > 0.5 ? "0%" : "50%";
    return (
      <span
        key={i}
        className="confetti-piece"
        style={{
          left: `${left}%`,
          background: color,
          borderRadius: rotate,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }}
      />
    );
  });
  return <>{pieces}</>;
}

export function Celebration({
  title,
  message,
  onClose,
}: {
  title: string;
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="celebration-overlay" onClick={onClose}>
      <div className="celebration-modal" onClick={(e) => e.stopPropagation()}>
        <Confetti />
        <div className="celebration-badge">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 12.5 11 15l4.5-5.5" />
            <path d="M12 2.5 14.6 4l3-.3 1 2.8 2.4 1.7-1 2.8 1 2.8-2.4 1.7-1 2.8-3-.3L12 20l-2.6-1.5-3 .3-1-2.8L3 14.3l1-2.8-1-2.8 2.4-1.7 1-2.8 3 .3L12 2.5Z" />
          </svg>
        </div>
        <h2>{title}</h2>
        <p>{message}</p>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Продовжити
        </button>
      </div>
    </div>
  );
}
