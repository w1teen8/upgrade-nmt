import { FormEvent, useEffect, useState } from "react";
import * as adminApi from "../../api/admin.api";
import { AdminUser, CreatedUser, UserAccess } from "../../api/admin.api";
import { Course } from "../../api/courses.api";

export function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AdminUser[]>([]);
  const [access, setAccess] = useState<UserAccess | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newCourseIds, setNewCourseIds] = useState<number[]>([]);
  const [created, setCreated] = useState<CreatedUser | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.listCourses().then(setCourses).catch(() => {});
  }, []);

  function toggleNewCourseId(id: number) {
    setNewCourseIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreated(null);
    try {
      const user = await adminApi.createUser(newEmail, newCourseIds);
      setCreated(user);
      setNewEmail("");
      setNewCourseIds([]);
    } catch {
      setCreateError("Не вдалося створити акаунт (можливо, такий email вже зареєстровано).");
    }
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setAccess(null);
    try {
      const users = await adminApi.searchUsers(query);
      setResults(users);
    } catch {
      setError("Не вдалося виконати пошук.");
    }
  }

  async function openUser(userId: number) {
    setError(null);
    try {
      const data = await adminApi.getUserAccess(userId);
      setAccess(data);
    } catch {
      setError("Не вдалося завантажити доступи користувача.");
    }
  }

  async function toggleAccess(courseId: number, hasAccess: boolean) {
    if (!access) return;
    try {
      if (hasAccess) {
        await adminApi.revokeAccess(access.user.id, courseId);
      } else {
        await adminApi.grantAccess(access.user.id, courseId);
      }
      const data = await adminApi.getUserAccess(access.user.id);
      setAccess(data);
    } catch {
      setError("Не вдалося змінити доступ.");
    }
  }

  return (
    <div className="page admin-page">
      <h1>Користувачі та доступи</h1>

      <h2>Створити акаунт вручну</h2>
      <p>
        Для учнів, які оплатили переказом на карту, а не через сайт. Акаунт одразу підтверджений
        (лист на пошту не потрібен), пароль показується один раз — скопіюйте і надішліть учню самі.
      </p>
      <form className="admin-form" onSubmit={handleCreate}>
        <label>
          Email учня
          <input
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="student@example.com"
          />
        </label>
        <label>Курси (можна одразу надати доступ до кількох)</label>
        <div className="checkbox-list">
          {courses.map((c) => (
            <label key={c.id} className="checkbox-list-item">
              <input
                type="checkbox"
                checked={newCourseIds.includes(c.id)}
                onChange={() => toggleNewCourseId(c.id)}
              />
              {c.title}
            </label>
          ))}
        </div>
        <button className="btn btn-primary" type="submit">
          Створити акаунт
        </button>
      </form>

      {createError && <p className="form-error">{createError}</p>}

      {created && (
        <div className="admin-form">
          <p>
            <strong>Email:</strong> {created.email}
            <br />
            <strong>Пароль:</strong> {created.password}
            <br />
            {created.granted.length > 0
              ? `Доступ надано до ${created.granted.length} курс(ів).`
              : "Доступ поки не надано."}
          </p>
        </div>
      )}

      <h2>Пошук існуючих акаунтів</h2>
      <form className="admin-form" onSubmit={handleSearch}>
        <label>
          Пошук за email
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="student@example.com" />
        </label>
        <button className="btn btn-primary" type="submit">
          Знайти
        </button>
      </form>

      {error && <p className="form-error">{error}</p>}

      {results.length > 0 && !access && (
        <ul className="admin-list">
          {results.map((u) => (
            <li key={u.id}>
              <button className="link-button" onClick={() => openUser(u.id)}>
                {u.email}
              </button>{" "}
              {!u.is_verified && <span>(email не підтверджено)</span>}
            </li>
          ))}
        </ul>
      )}

      {access && (
        <div className="admin-form">
          <h2>{access.user.email}</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Курс</th>
                <th>Доступ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {access.courses.map((c) => (
                <tr key={c.id}>
                  <td>{c.title}</td>
                  <td>{c.hasAccess ? "є" : "немає"}</td>
                  <td>
                    <button className="link-button" onClick={() => toggleAccess(c.id, c.hasAccess)}>
                      {c.hasAccess ? "Забрати доступ" : "Надати доступ"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn" onClick={() => setAccess(null)}>
            Назад до пошуку
          </button>
        </div>
      )}
    </div>
  );
}
