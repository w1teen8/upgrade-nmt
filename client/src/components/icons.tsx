type IconProps = { className?: string };

const base = {
  width: 26,
  height: 26,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function HistoryIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M3 21h18" />
      <path d="M5 21V10M9.5 21V10M14.5 21V10M19 21V10" />
      <path d="M2.5 10 12 3l9.5 7" />
      <path d="M4 10h16" />
    </svg>
  );
}

export function QuillIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M20 4c-6 0-13 3-15 11-.4 1.6-1 3-2 4h6c2-1 4-4 5-6" />
      <path d="M20 4c0 6-3 13-11 15" />
      <path d="M9 15l6-6" />
    </svg>
  );
}

export function BoltIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true" strokeWidth={1.6}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BookIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
      <path d="M4 19a2.5 2.5 0 0 1 2.5-2.5H20" />
    </svg>
  );
}

export function VideoIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
      <path d="M15.5 10.2 21 7v10l-5.5-3.2Z" />
    </svg>
  );
}

export function NotesIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M6 2.5h9L20 7.5V21a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z" />
      <path d="M14 2.5V8h6" />
      <path d="M8 12.5h8M8 16h8M8 9h3" />
    </svg>
  );
}

export function CheckBadgeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 2.5 14.6 4l3-.3 1 2.8 2.4 1.7-1 2.8 1 2.8-2.4 1.7-1 2.8-3-.3L12 20l-2.6-1.5-3 .3-1-2.8L3 14.3l1-2.8-1-2.8 2.4-1.7 1-2.8 3 .3L12 2.5Z" />
      <path d="M8.5 12.5 11 15l4.5-5.5" />
    </svg>
  );
}

export function FlameIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 2.5c1 3-3 4.5-3 8a3 3 0 0 0 6 0c1 1 1.5 2.3 1.5 3.5a4.5 4.5 0 0 1-9 0c0-4.5 3-6 4.5-11.5Z" />
    </svg>
  );
}

export function TargetIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

export function TrophyIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5H4a3 3 0 0 0 3 5" />
      <path d="M17 5h3a3 3 0 0 1-3 5" />
      <path d="M12 13v3" />
      <path d="M9 20h6" />
      <path d="M9.5 16.5h5l.5 3.5H9l.5-3.5Z" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4 12h16" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export function GiftIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="3" y="8.5" width="18" height="4" rx="1" />
      <path d="M5 12.5h14V21a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8.5Z" />
      <path d="M12 8.5V22" />
      <path d="M12 8.5c0-2.5-1.5-4.5-3.5-4.5S6 5.5 6.5 7c.5 1.5 3 1.5 5.5 1.5Z" />
      <path d="M12 8.5c0-2.5 1.5-4.5 3.5-4.5S18 5.5 17.5 7c-.5 1.5-3 1.5-5.5 1.5Z" />
    </svg>
  );
}
