import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as adminApi from "../../api/admin.api";
import { AdminTopic } from "../../api/admin.api";

export function AdminTopicsPage() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const [topics, setTopics] = useState<AdminTopic[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function reload() {
    adminApi.listTopics(courseId).then(setTopics);
  }

  useEffect(reload, [courseId]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await adminApi.createTopic(courseId, title, description, topics.length);
    setTitle("");
    setDescription("");
    reload();
  }

  async function handleDelete(topicId: number) {
    if (!confirm("Видалити тему разом з усіма матеріалами?")) return;
    await adminApi.deleteTopic(topicId);
    reload();
  }

  return (
    <div className="page admin-page">
      <p>
        <Link to="/admin/courses">← До списку курсів</Link>
      </p>
      <h1>Теми курсу</h1>

      <ul className="admin-list">
        {topics.map((t) => (
          <li key={t.id}>
            <Link to={`/admin/topics/${t.id}/materials`}>{t.title}</Link>{" "}
            <button className="link-button" onClick={() => handleDelete(t.id)}>
              Видалити
            </button>
          </li>
        ))}
      </ul>

      <form className="admin-form" onSubmit={handleAdd}>
        <h2>Додати тему</h2>
        <label>
          Назва
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Опис
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <button className="btn btn-primary" type="submit">
          Додати
        </button>
      </form>
    </div>
  );
}
