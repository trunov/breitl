import { FormEvent, useEffect, useState } from "react";
import type { User, UserRole } from "../api/types";
import * as api from "../api/client";
import { useI18n } from "../i18n/I18nContext";

export function UsersPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: "viewer" as UserRole,
    password: "",
  });
  const load = () => api.listUsers().then(setRows);
  useEffect(() => {
    load();
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.createUser(form);
      setForm({ fullName: "", email: "", role: "viewer", password: "" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }
  async function deactivate(id: string) {
    await api.deactivateUser(id);
    load();
  }
  return (
    <div>
      <div className="page-header">
        <h1>{t("users")}</h1>
      </div>
      {error && <div className="alert">{error}</div>}
      <form className="card form-grid" onSubmit={submit}>
        <label>
          Full name
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Role
          <select
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value as UserRole })
            }
          >
            <option value="owner">owner</option>
            <option value="manager">manager</option>
            <option value="warehouse">warehouse</option>
            <option value="viewer">viewer</option>
          </select>
        </label>
        <label>
          Initial password
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        <button>Invite / create user</button>
      </form>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Full name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.isActive ? "Active" : "Inactive"}</td>
                <td>
                  {u.isActive && u.role !== "owner" ? (
                    <button className="danger" onClick={() => deactivate(u.id)}>
                      Deactivate
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
