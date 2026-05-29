import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../i18n/I18nContext";
import { isEmail, passwordValid } from "../utils/validation";

export function RegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [form, setForm] = useState({
    accountName: "",
    fullName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [accountId, setAccountId] = useState("");
  const [error, setError] = useState("");
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!isEmail(form.email)) return setError("Email format is invalid.");
    if (!passwordValid(form.password))
      return setError(
        "Password must be 8+ chars and contain a letter and digit.",
      );
    if (form.password !== form.confirm)
      return setError("Passwords do not match.");
    try {
      const account = await auth.register(form);
      setAccountId(account.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }
  if (accountId)
    return (
      <div className="auth-page">
        <div className="auth-card success-card">
          <h1>Account created</h1>
          <p>
            Use this Account ID together with your email and password to log in.
            Other users of this account will also need this Account ID.
          </p>
          <div className="account-id-display">{accountId}</div>
          <button onClick={() => navigate("/")}>Go to dashboard</button>
        </div>
      </div>
    );
  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>{t("register")}</h1>
        {error && <div className="alert">{error}</div>}
        <label>
          Account / company name
          <input
            required
            value={form.accountName}
            onChange={(e) => setForm({ ...form, accountName: e.target.value })}
          />
        </label>
        <label>
          Owner full name
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
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
        <label>
          Confirm password
          <input
            type="password"
            required
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />
        </label>
        <button>{t("register")}</button>
        <div className="auth-links">
          <Link to="/login">Back to login</Link>
        </div>
      </form>
    </div>
  );
}
