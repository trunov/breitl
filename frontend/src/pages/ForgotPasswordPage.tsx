import { Link } from "react-router-dom";
export function ForgotPasswordPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Password recovery</h1>
        <p>Password recovery will be available later.</p>
        <Link to="/login">Back to login</Link>
      </div>
    </div>
  );
}
