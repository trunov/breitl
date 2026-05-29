import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../i18n/I18nContext";

export function LoginPage() {
  const auth = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    accountId: "MTR10237",
    email: "owner@example.com",
    password: "Password1",
    remember: false,
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await auth.login(form);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>{t("login")}</h1>
        <p className="muted">Demo: MTR10237 / owner@example.com / Password1</p>
        {error && <div className="alert">{error}</div>}
        <label>
          {t("accountId")}
          <input
            required
            value={form.accountId}
            onChange={(e) => setForm({ ...form, accountId: e.target.value })}
          />
        </label>
        <label>
          {t("email")}
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={form.remember}
            onChange={(e) => setForm({ ...form, remember: e.target.checked })}
          />{" "}
          Remember me
        </label>
        <button disabled={busy}>{busy ? "…" : t("login")}</button>
        <div className="auth-links">
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/register">{t("register")}</Link>
        </div>
      </form>
    </div>
  );
}
