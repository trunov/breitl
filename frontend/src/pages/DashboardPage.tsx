import { useAuth } from "../contexts/AuthContext";
export function DashboardPage() {
  const { account } = useAuth();
  return (
    <div>
      <h1>Dashboard</h1>
      <div className="card">
        <h2>{account?.name}</h2>
        <p className="muted">
          Stage 1 placeholder. Use the sidebar to manage Clients, Products,
          Categories and Users.
        </p>
      </div>
    </div>
  );
}
