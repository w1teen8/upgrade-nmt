const STORAGE_KEY = "upgrade-nmt:active-days";
const MAX_STORED_DAYS = 120;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function readDays(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeDays(days: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(days.slice(-MAX_STORED_DAYS)));
  } catch {
    // localStorage unavailable — streak simply won't persist
  }
}

/** Records today as an "active" day (visited dashboard or completed something). */
export function recordActivityToday() {
  const days = readDays();
  const t = today();
  if (!days.includes(t)) {
    writeDays([...days, t]);
  }
}

/** Consecutive days of activity ending today (or yesterday, so it doesn't reset until the day is truly missed). */
export function getStreak(): number {
  const days = new Set(readDays());
  let streak = 0;
  const cursor = new Date();

  // If today has no activity yet, start counting from yesterday so an
  // in-progress day doesn't look like a broken streak.
  if (!days.has(today())) {
    cursor.setDate(cursor.getDate() - 1);
  }

  for (;;) {
    const iso = cursor.toISOString().slice(0, 10);
    if (!days.has(iso)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function isTodayLogged(): boolean {
  return readDays().includes(today());
}
