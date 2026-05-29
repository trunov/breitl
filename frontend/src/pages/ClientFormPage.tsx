import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Client, ClientType, TaxObligation } from "../api/types";
import * as api from "../api/client";
import { useI18n } from "../i18n/I18nContext";
import { isEmail } from "../utils/validation";

const counties = [
  "Harjumaa",
  "Hiiumaa",
  "Ida-Virumaa",
  "Järvamaa",
  "Jõgevamaa",
  "Lääne-Virumaa",
  "Läänemaa",
  "Pärnumaa",
  "Põlvamaa",
  "Raplamaa",
  "Saaremaa",
  "Tartumaa",
  "Valgamaa",
  "Viljandimaa",
  "Võrumaa",
];
const banks = [
  "Swedbank",
  "SEB Pank",
  "Luminor",
  "LHV Pank",
  "Danske Bank",
  "Tallinna Äripank",
  "Citadele",
  "DNB Pank",
  "COOP",
  "Revolut",
  "Paysera",
  "Wise",
  "N26",
  "ZEN",
  "Verse",
];
const blank: Omit<Client, "id" | "accountId" | "createdAt"> = {
  type: "private",
  city: "Tallinn",
  country: "Эстония",
  phoneType: "main",
  emailType: "main",
  addressType: "legal_personal",
};

type FormData = Omit<Client, "id" | "accountId" | "createdAt">;

export function ClientFormPage() {
  const { id } = useParams();
  const edit = Boolean(id);
  const navigate = useNavigate();
  const { t } = useI18n();
  const [form, setForm] = useState<FormData>(blank);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api.listClients({ pageSize: 100 }).then((r) => setAllClients(r.data));
    if (id) api.getClient(id).then((c) => setForm(c));
  }, [id]);
  const trustedOptions = useMemo(
    () => allClients.filter((c) => c.id !== id),
    [allClients, id],
  );
  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  function changeType(type: ClientType) {
    setForm((prev) =>
      type === "private"
        ? {
            ...prev,
            type,
            companyName: "",
            registrationCode: "",
            vatNumber: undefined,
            taxObligation: undefined,
          }
        : { ...prev, type, firstName: "", lastName: "", personalCode: "" },
    );
  }
  function changeTax(value: TaxObligation) {
    setForm((prev) => ({
      ...prev,
      taxObligation: value,
      vatNumber: value === 2 ? prev.vatNumber : "",
    }));
  }
  function validate() {
    const e: Record<string, string> = {};
    if (form.type === "private") {
      if (!form.firstName) e.firstName = "Required";
      if (!form.lastName) e.lastName = "Required";
      if ((form.personalCode?.length ?? 0) > 11)
        e.personalCode = "Max 11 chars";
    } else {
      if (!form.companyName) e.companyName = "Required";
      if ((form.companyName?.length ?? 0) > 50) e.companyName = "Max 50 chars";
      if (!form.registrationCode) e.registrationCode = "Required";
      if ((form.registrationCode?.length ?? 0) > 25)
        e.registrationCode = "Max 25 chars";
      if (form.taxObligation === undefined) e.taxObligation = "Required";
      if (form.taxObligation === 2 && !form.vatNumber)
        e.vatNumber = "KMKR required";
      if ((form.vatNumber?.length ?? 0) > 25) e.vatNumber = "Max 25 chars";
    }
    if (!isEmail(form.email)) e.email = "Invalid email";
    if ((form.carNumber?.length ?? 0) > 10) e.carNumber = "Max 10 chars";
    setErrors(e);
    return Object.keys(e).length === 0;
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      edit && id
        ? await api.updateClient(id, form as Partial<Client>)
        : await api.createClient(form);
      navigate("/clients");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <div className="page-header">
        <h1>{edit ? "Edit client" : "New client"}</h1>
        <div>
          <Link className="ghost button" to="/clients">
            {t("cancel")}
          </Link>
          <button disabled={busy}>{t("save")}</button>
        </div>
      </div>
      <section className="card form-grid">
        <label>
          Client type
          <select
            value={form.type}
            onChange={(e) => changeType(e.target.value as ClientType)}
          >
            <option value="private">частное лицо</option>
            <option value="legal">юридическое лицо</option>
          </select>
        </label>
      </section>
      <h2>Document</h2>
      <section className="card form-grid">
        <label>
          Документ
          <select
            value={form.documentKind ?? ""}
            onChange={(e) => set("documentKind", e.target.value as never)}
          >
            <option value="">---</option>
            <option value="id_card">ID-карта</option>
            <option value="passport">паспорт</option>
            <option value="drivers_license">вод.права</option>
          </select>
        </label>
        <label>
          Номер
          <input
            value={form.documentNumber ?? ""}
            onChange={(e) => set("documentNumber", e.target.value)}
          />
        </label>
        <label>
          Истекает
          <input
            type="date"
            value={form.documentExpires ?? ""}
            onChange={(e) => set("documentExpires", e.target.value)}
          />
        </label>
      </section>
      {form.type === "private" ? (
        <section className="card form-grid">
          <Field label="Имя" error={errors.firstName}>
            <input
              value={form.firstName ?? ""}
              onChange={(e) => set("firstName", e.target.value)}
            />
          </Field>
          <Field label="Фамилия" error={errors.lastName}>
            <input
              value={form.lastName ?? ""}
              onChange={(e) => set("lastName", e.target.value)}
            />
          </Field>
          <Field label="Личный код" error={errors.personalCode}>
            <input
              maxLength={11}
              value={form.personalCode ?? ""}
              onChange={(e) => set("personalCode", e.target.value)}
            />
          </Field>
        </section>
      ) : (
        <section className="card form-grid">
          <label>
            Зона деятельности
            <select
              value={form.activityZone ?? 0}
              onChange={(e) =>
                set("activityZone", Number(e.target.value) as never)
              }
            >
              <option value={0}>Эстония</option>
              <option value={1}>ЕС</option>
              <option value={2}>вне ЕС</option>
            </select>
          </label>
          <Field label="Название организации" error={errors.companyName}>
            <input
              maxLength={50}
              value={form.companyName ?? ""}
              onChange={(e) => set("companyName", e.target.value)}
            />
          </Field>
          <Field label="Рег.код" error={errors.registrationCode}>
            <input
              maxLength={25}
              value={form.registrationCode ?? ""}
              onChange={(e) => set("registrationCode", e.target.value)}
            />
          </Field>
          <Field label="Налогообяз." error={errors.taxObligation}>
            <select
              value={form.taxObligation ?? ""}
              onChange={(e) =>
                changeTax(Number(e.target.value) as TaxObligation)
              }
            >
              <option value="">---</option>
              <option value={1}>нет</option>
              <option value={2}>да</option>
            </select>
          </Field>
          {form.taxObligation === 2 && (
            <Field label="KMKR" error={errors.vatNumber}>
              <input
                className="fade-in"
                maxLength={25}
                value={form.vatNumber ?? ""}
                onChange={(e) => set("vatNumber", e.target.value)}
              />
            </Field>
          )}
        </section>
      )}
      <h2>Contact</h2>
      <section className="card form-grid">
        <label>
          Телефон
          <input
            value={form.phone ?? ""}
            onChange={(e) => set("phone", e.target.value)}
          />
        </label>
        <label>
          Тип телефона
          <select
            value={form.phoneType ?? "main"}
            onChange={(e) => set("phoneType", e.target.value as never)}
          >
            <option value="main">основной</option>
            <option value="spare">запасной</option>
          </select>
        </label>
        <Field label="E-mail" error={errors.email}>
          <input
            type="email"
            value={form.email ?? ""}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>
        <label>
          Тип email
          <select
            value={form.emailType ?? "main"}
            onChange={(e) => set("emailType", e.target.value as never)}
          >
            <option value="main">основной</option>
            <option value="sales">продажи</option>
          </select>
        </label>
      </section>
      <h2>Address</h2>
      <section className="card form-grid">
        <label>
          Улица
          <input
            value={form.street ?? ""}
            onChange={(e) => set("street", e.target.value)}
          />
        </label>
        <label>
          Дом
          <input
            value={form.house ?? ""}
            onChange={(e) => set("house", e.target.value)}
          />
        </label>
        <label>
          Кв.
          <input
            value={form.apartment ?? ""}
            onChange={(e) => set("apartment", e.target.value)}
          />
        </label>
        <label>
          Район
          <input
            value={form.district ?? ""}
            onChange={(e) => set("district", e.target.value)}
          />
        </label>
        <label>
          Город
          <input
            value={form.city ?? ""}
            onChange={(e) => set("city", e.target.value)}
          />
        </label>
        <label>
          Индекс
          <input
            value={form.postalCode ?? ""}
            onChange={(e) => set("postalCode", e.target.value)}
          />
        </label>
        <label>
          Уезд
          <select
            value={form.county ?? ""}
            onChange={(e) => set("county", e.target.value)}
          >
            <option value="">---</option>
            {counties.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Страна
          <input
            value={form.country ?? ""}
            onChange={(e) => set("country", e.target.value)}
          />
        </label>
        <label>
          Тип адреса
          <select
            value={form.addressType ?? "legal_personal"}
            onChange={(e) => set("addressType", e.target.value as never)}
          >
            <option value="legal_personal">юридич./личный</option>
            <option value="production">производственный</option>
            <option value="office">контора</option>
          </select>
        </label>
      </section>
      <h2>Banking & other</h2>
      <section className="card form-grid">
        <label>
          Банк
          <select
            value={form.bank ?? ""}
            onChange={(e) => set("bank", e.target.value)}
          >
            <option value="">---</option>
            {banks.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Расчётный счёт
          <input
            value={form.bankAccount ?? ""}
            onChange={(e) => set("bankAccount", e.target.value)}
          />
        </label>
        <label>
          Владелец счёта
          <input
            value={form.accountHolder ?? ""}
            onChange={(e) => set("accountHolder", e.target.value)}
          />
        </label>
        <Field label="Номер машины" error={errors.carNumber}>
          <input
            maxLength={10}
            value={form.carNumber ?? ""}
            onChange={(e) => set("carNumber", e.target.value)}
          />
        </Field>
        <label>
          Доверенное лицо
          <select
            value={form.trustedPersonId ?? ""}
            onChange={(e) => set("trustedPersonId", e.target.value)}
          >
            <option value="">---</option>
            {trustedOptions.map((c) => (
              <option value={c.id} key={c.id}>
                {c.type === "private"
                  ? `${c.firstName} ${c.lastName}`
                  : c.companyName}
              </option>
            ))}
          </select>
        </label>
        <label className="full">
          Пометки
          <textarea
            value={form.notes ?? ""}
            onChange={(e) => set("notes", e.target.value)}
          />
        </label>
      </section>
    </form>
  );
}
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      {label}
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
