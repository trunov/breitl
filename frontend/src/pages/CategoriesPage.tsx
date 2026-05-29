import { FormEvent, useEffect, useState } from "react";
import type { Category } from "../api/types";
import * as api from "../api/client";
import { useI18n } from "../i18n/I18nContext";

const blank: Category = { code: "", name: { et: "", ru: "", en: "" } };
export function CategoriesPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Category[]>([]);
  const [form, setForm] = useState<Category>(blank);
  const [error, setError] = useState("");
  const load = () => api.listCategories().then(setRows);
  useEffect(() => {
    load();
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.createCategory({ ...form, code: form.code.toUpperCase() });
      setForm(blank);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }
  async function remove(code: string) {
    setError("");
    try {
      await api.deleteCategory(code);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }
  return (
    <div>
      <div className="page-header">
        <h1>{t("categories")}</h1>
      </div>
      {error && <div className="alert">{error}</div>}
      <form className="card form-grid" onSubmit={submit}>
        <label>
          Code
          <input
            maxLength={3}
            value={form.code}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value.toUpperCase() })
            }
          />
        </label>
        <label>
          Name ET
          <input
            value={form.name.et}
            onChange={(e) =>
              setForm({ ...form, name: { ...form.name, et: e.target.value } })
            }
          />
        </label>
        <label>
          Name RU
          <input
            value={form.name.ru}
            onChange={(e) =>
              setForm({ ...form, name: { ...form.name, ru: e.target.value } })
            }
          />
        </label>
        <label>
          Name EN
          <input
            value={form.name.en}
            onChange={(e) =>
              setForm({ ...form, name: { ...form.name, en: e.target.value } })
            }
          />
        </label>
        <button>{t("save")}</button>
      </form>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>ET</th>
              <th>RU</th>
              <th>EN</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.code}>
                <td>{c.code}</td>
                <td>{c.name.et}</td>
                <td>{c.name.ru}</td>
                <td>{c.name.en}</td>
                <td>
                  <button className="danger" onClick={() => remove(c.code)}>
                    {t("delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
