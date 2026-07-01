import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as adminApi from "../../api/admin.api";
import { AdminMaterial } from "../../api/admin.api";

const MATERIAL_TYPES = [
  { value: "conspect", label: "Конспект" },
  { value: "shpargalka", label: "Шпаргалка" },
  { value: "test", label: "Тест" },
  { value: "video", label: "Відео" },
  { value: "other", label: "Інше" },
];

export function AdminMaterialsPage() {
  const { id } = useParams<{ id: string }>();
  const topicId = Number(id);
  const [materials, setMaterials] = useState<AdminMaterial[]>([]);
  const [type, setType] = useState("conspect");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  function reload() {
    adminApi.listMaterials(topicId).then(setMaterials);
  }

  useEffect(reload, [topicId]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    await adminApi.createMaterial(topicId, type, title, url, materials.length);
    setTitle("");
    setUrl("");
    reload();
  }

  async function handleDelete(materialId: number) {
    if (!confirm("Видалити матеріал?")) return;
    await adminApi.deleteMaterial(materialId);
    reload();
  }

  return (
    <div className="page admin-page">
      <p>
        <Link to="/admin/courses">← До списку курсів</Link>
      </p>
      <h1>Матеріали теми</h1>

      <ul className="admin-list">
        {materials.map((m) => (
          <li key={m.id}>
            [{m.type}] <a href={m.url} target="_blank" rel="noreferrer">{m.title}</a>{" "}
            <button className="link-button" onClick={() => handleDelete(m.id)}>
              Видалити
            </button>
          </li>
        ))}
      </ul>

      <form className="admin-form" onSubmit={handleAdd}>
        <h2>Додати матеріал</h2>
        <label>
          Тип
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {MATERIAL_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Назва
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Посилання (URL)
          <input value={url} onChange={(e) => setUrl(e.target.value)} required />
        </label>
        <button className="btn btn-primary" type="submit">
          Додати
        </button>
      </form>
    </div>
  );
}
