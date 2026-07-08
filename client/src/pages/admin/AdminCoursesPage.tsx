import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as adminApi from "../../api/admin.api";
import { Course } from "../../api/courses.api";

export function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [editing, setEditing] = useState<Course | null>(null);

  function reload() {
    adminApi.listCourses().then(setCourses);
  }

  useEffect(reload, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    await adminApi.updateCourse(editing.id, {
      title: editing.title,
      description: editing.description,
      price_uah: editing.price_uah,
      is_active: editing.is_active,
    });
    setEditing(null);
    reload();
  }

  return (
    <div className="page admin-page">
      <h1>Курси</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Назва</th>
            <th>Ціна</th>
            <th>Активний</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c.id}>
              <td>{c.title}</td>
              <td>{c.price_uah} грн</td>
              <td>{c.is_active ? "так" : "ні"}</td>
              <td>
                <button className="link-button" onClick={() => setEditing(c)}>
                  Редагувати
                </button>{" "}
                <Link to={`/admin/courses/${c.id}/topics`}>Теми</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <form className="admin-form admin-form-wide" onSubmit={handleSave}>
          <h2>Редагувати курс</h2>
          <label>
            Назва
            <input
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            />
          </label>
          <label>
            Опис
            <textarea
              rows={6}
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            />
          </label>
          <label>
            Ціна (грн)
            <input
              type="number"
              value={editing.price_uah}
              onChange={(e) => setEditing({ ...editing, price_uah: e.target.value })}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={editing.is_active}
              onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
            />
            Активний
          </label>
          <div>
            <button className="btn btn-primary" type="submit">
              Зберегти
            </button>{" "}
            <button className="btn" type="button" onClick={() => setEditing(null)}>
              Скасувати
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
