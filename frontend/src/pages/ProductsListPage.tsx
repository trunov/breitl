import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Category, Product } from "../api/types";
import * as api from "../api/client";
import { EmptyState, ErrorState, LoadingState } from "../components/States";
import { useI18n } from "../i18n/I18nContext";

export function ProductsListPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [folder, setFolder] = useState("");
  const [show, setShow] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    api.listCategories().then(setCats);
  }, []);
  useEffect(() => {
    setLoading(true);
    api
      .listProducts({
        q,
        folder: folder || undefined,
        showInPriceList: show === "" ? undefined : show === "true",
        page,
        pageSize: 25,
      })
      .then((r) => {
        setRows(r.data);
        setTotal(r.total);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [q, folder, show, page]);
  return (
    <div>
      <div className="page-header">
        <h1>{t("products")}</h1>
        <Link className="button" to="/products/new">
          {t("createNew")}
        </Link>
      </div>
      <div className="toolbar">
        <input
          placeholder={t("search")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={folder} onChange={(e) => setFolder(e.target.value)}>
          <option value="">All folders</option>
          {cats.map((c) => (
            <option value={c.code} key={c.code}>
              {c.code} — {c.name[locale]}
            </option>
          ))}
        </select>
        <select value={show} onChange={(e) => setShow(e.target.value)}>
          <option value="">All</option>
          <option value="true">Shown</option>
          <option value="false">Hidden</option>
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
                <th>Код</th>
                <th>Наименование</th>
                <th>Папка</th>
                <th>Ед.</th>
                <th>EAN</th>
                <th>Показывать в прайсе</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} onClick={() => navigate(`/products/${p.id}`)}>
                  <td>{p.code}</td>
                  <td>{p.name[locale] || p.name.en}</td>
                  <td>{p.folder}</td>
                  <td>{p.unit}</td>
                  <td>{p.ean}</td>
                  <td>
                    {p.showInPriceList ? (
                      <span className="badge yes">✓</span>
                    ) : (
                      <span className="badge">—</span>
                    )}
                  </td>
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
