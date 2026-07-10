import { useEffect, useState } from "react";
import * as adminApi from "../../api/admin.api";
import { VisitStats } from "../../api/admin.api";

export function AdminVisitsPage() {
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getVisitStats()
      .then(setStats)
      .catch(() => setError("Не вдалося завантажити статистику."));
  }, []);

  return (
    <div className="page admin-page">
      <h1>Відвідування сайту</h1>
      {error && <p className="form-error">{error}</p>}
      {!stats && !error && <p>Завантаження...</p>}
      {stats && (
        <div className="hero-stats admin-visit-stats">
          <div className="hero-stat">
            <strong>{stats.total}</strong>
            <span>Всього відвідувань</span>
          </div>
          <div className="hero-stat">
            <strong>{stats.unique_visitors}</strong>
            <span>Унікальних відвідувачів</span>
          </div>
          <div className="hero-stat">
            <strong>{stats.today}</strong>
            <span>Сьогодні</span>
          </div>
        </div>
      )}
    </div>
  );
}
