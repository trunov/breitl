import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Client, ClientType } from "../api/types";
import * as api from "../api/client";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import { useI18n } from "../i18n/I18nContext";

function clientName(c: Client) {
  return c.type === "private"
    ? `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim()
    : (c.companyName ?? "");
}
function clientCode(c: Client) {
  return c.type === "private" ? c.personalCode : c.registrationCode;
}

export function ClientsListPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [type, setType] = useState<ClientType | "">("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    setLoading(true);
    api
      .listClients({ q, type: type || undefined, page, pageSize: 25 })
      .then((r) => {
        setRows(r.data);
        setTotal(r.total);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [q, type, page]);
  return (
    <div>
      <div className="page-header">
        <h1>{t("clients")}</h1>
        <Link className="button" to="/clients/new">
          {t("createNew")}
        </Link>
      </div>
      <div className="toolbar">
        <input
          placeholder={t("search")}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ClientType | "")}
        >
          <option value="">All types</option>
          <option value="private">частное лицо</option>
          <option value="legal">юридическое лицо</option>
        </select>
      </div>
      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <LoadingState />
      ) : rows.length === 0 ? (
        <EmptyState message={t("empty")} />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t("type")}</th>
                <th>{t("name")}</th>
                <th>Personal/Reg. code</th>
                <th>{t("phone")}</th>
                <th>{t("email")}</th>
                <th>{t("city")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} onClick={() => navigate(`/clients/${c.id}`)}>
                  <td>
                    {c.type === "private" ? "частное лицо" : "юридическое лицо"}
                  </td>
                  <td>{clientName(c)}</td>
                  <td>{clientCode(c)}</td>
                  <td>{c.phone}</td>
                  <td>{c.email}</td>
                  <td>{c.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="pagination">
        <span>Total: {total}</span>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span>Page {page}</span>
        <button disabled={page * 25 >= total} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
