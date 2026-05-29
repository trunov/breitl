// MOCK IMPLEMENTATION — replace with fetch() to Go REST API. Endpoints: see API CONTRACT in the build prompt.
import {
  accounts,
  categories,
  clients,
  passwordsByUserId,
  products,
  users,
} from "./fixtures";
import type {
  Account,
  Category,
  Client,
  ClientType,
  ListParams,
  PageResult,
  Product,
  User,
  UserRole,
} from "./types";
import { ApiError } from "./types";

const delay = <T>(value: T, ms = 300) =>
  new Promise<T>((resolve) =>
    setTimeout(() => resolve(structuredClone(value)), ms),
  );
const nowIso = () => new Date().toISOString();
const id = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

let activeSession: { user: User; account: Account } | null = null;

function requireSession() {
  if (!activeSession)
    throw new ApiError("Authentication required", "unauthorized");
  return activeSession;
}

function generateAccountId() {
  const letters = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26)),
  ).join("");
  const digits = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
  return `${letters}${digits}`;
}

function applyPage<T>(rows: T[], params: ListParams = {}): PageResult<T> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 25;
  const start = (page - 1) * pageSize;
  return { data: rows.slice(start, start + pageSize), total: rows.length };
}

function sortRows<T extends Record<string, unknown>>(
  rows: T[],
  sortBy?: string,
  sortDir: "asc" | "desc" = "asc",
) {
  if (!sortBy) return rows;
  return [...rows].sort((a, b) => {
    const av = String(a[sortBy] ?? "").toLowerCase();
    const bv = String(b[sortBy] ?? "").toLowerCase();
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });
}

export async function register(input: {
  accountName: string;
  fullName: string;
  email: string;
  password: string;
}) {
  let accountId = generateAccountId();
  while (accounts.some((a) => a.id === accountId))
    accountId = generateAccountId();
  const account: Account = {
    id: accountId,
    name: input.accountName,
    createdAt: nowIso(),
  };
  const user: User = {
    id: id("u"),
    accountId,
    fullName: input.fullName,
    email: input.email.toLowerCase(),
    role: "owner",
    isActive: true,
  };
  accounts.push(account);
  users.push(user);
  passwordsByUserId[user.id] = input.password;
  activeSession = { user, account };
  return delay({ account, user });
}

export async function login(input: {
  accountId: string;
  email: string;
  password: string;
}) {
  const account = accounts.find(
    (a) => a.id.toUpperCase() === input.accountId.trim().toUpperCase(),
  );
  const user =
    account &&
    users.find(
      (u) =>
        u.accountId === account.id &&
        u.email === input.email.toLowerCase() &&
        u.isActive,
    );
  if (!account || !user || passwordsByUserId[user.id] !== input.password) {
    throw new ApiError(
      "Invalid Account ID, email or password.",
      "invalid_credentials",
    );
  }
  activeSession = { user, account };
  return delay({ user, account });
}

export async function logout() {
  activeSession = null;
  return delay({ ok: true });
}
export async function me() {
  return delay(activeSession);
}

export async function listUsers() {
  const { account } = requireSession();
  return delay(users.filter((u) => u.accountId === account.id));
}

export async function createUser(input: {
  fullName: string;
  email: string;
  role: UserRole;
  password: string;
}) {
  const { account } = requireSession();
  if (
    users.some(
      (u) =>
        u.accountId === account.id && u.email === input.email.toLowerCase(),
    )
  ) {
    throw new ApiError(
      "Email must be unique within this account.",
      "validation_error",
      { email: "Duplicate email in account" },
    );
  }
  const user: User = {
    id: id("u"),
    accountId: account.id,
    fullName: input.fullName,
    email: input.email.toLowerCase(),
    role: input.role,
    isActive: true,
  };
  users.push(user);
  passwordsByUserId[user.id] = input.password;
  return delay(user);
}

export async function updateUser(userId: string, patch: Partial<User>) {
  const { account } = requireSession();
  const idx = users.findIndex(
    (u) => u.id === userId && u.accountId === account.id,
  );
  if (idx < 0) throw new ApiError("User not found", "not_found");
  users[idx] = {
    ...users[idx],
    ...patch,
    id: users[idx].id,
    accountId: account.id,
  };
  return delay(users[idx]);
}

export async function deactivateUser(userId: string) {
  return updateUser(userId, { isActive: false });
}

export async function listClients(
  params: ListParams & { type?: ClientType } = {},
) {
  const { account } = requireSession();
  const q = params.q?.toLowerCase().trim() ?? "";
  let rows = clients.filter((c) => c.accountId === account.id);
  if (params.type) rows = rows.filter((c) => c.type === params.type);
  if (q)
    rows = rows.filter((c) =>
      [
        c.firstName,
        c.lastName,
        c.companyName,
        c.personalCode,
        c.registrationCode,
        c.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  rows = sortRows(
    rows as unknown as Record<string, unknown>[],
    params.sortBy,
    params.sortDir,
  ) as unknown as Client[];
  return delay(applyPage(rows, params));
}
export async function getClient(clientId: string) {
  const { account } = requireSession();
  const row = clients.find(
    (c) => c.id === clientId && c.accountId === account.id,
  );
  if (!row) throw new ApiError("Client not found", "not_found");
  return delay(row);
}
export async function createClient(
  input: Omit<Client, "id" | "accountId" | "createdAt">,
) {
  const { account } = requireSession();
  const row: Client = {
    ...input,
    id: id("c"),
    accountId: account.id,
    createdAt: nowIso(),
  };
  clients.push(row);
  return delay(row);
}
export async function updateClient(clientId: string, patch: Partial<Client>) {
  const { account } = requireSession();
  const idx = clients.findIndex(
    (c) => c.id === clientId && c.accountId === account.id,
  );
  if (idx < 0) throw new ApiError("Client not found", "not_found");
  clients[idx] = {
    ...clients[idx],
    ...patch,
    id: clientId,
    accountId: account.id,
  };
  return delay(clients[idx]);
}
export async function deleteClient(clientId: string) {
  const { account } = requireSession();
  const idx = clients.findIndex(
    (c) => c.id === clientId && c.accountId === account.id,
  );
  if (idx < 0) throw new ApiError("Client not found", "not_found");
  clients.splice(idx, 1);
  return delay({ ok: true });
}

export async function listProducts(
  params: ListParams & { folder?: string; showInPriceList?: boolean } = {},
) {
  const { account } = requireSession();
  const q = params.q?.toLowerCase().trim() ?? "";
  let rows = products.filter((p) => p.accountId === account.id);
  if (params.folder) rows = rows.filter((p) => p.folder === params.folder);
  if (typeof params.showInPriceList === "boolean")
    rows = rows.filter((p) => p.showInPriceList === params.showInPriceList);
  if (q)
    rows = rows.filter((p) =>
      [p.code, p.folder, p.ean, p.name.en, p.name.ru, p.name.et]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  rows = sortRows(
    rows as unknown as Record<string, unknown>[],
    params.sortBy,
    params.sortDir,
  ) as unknown as Product[];
  return delay(applyPage(rows, params));
}
export async function getProduct(productId: string) {
  const { account } = requireSession();
  const row = products.find(
    (p) => p.id === productId && p.accountId === account.id,
  );
  if (!row) throw new ApiError("Product not found", "not_found");
  return delay(row);
}
export async function createProduct(
  input: Omit<Product, "id" | "accountId" | "createdAt">,
) {
  const { account } = requireSession();
  const row: Product = {
    ...input,
    id: id("p"),
    accountId: account.id,
    createdAt: nowIso(),
  };
  products.push(row);
  return delay(row);
}
export async function updateProduct(
  productId: string,
  patch: Partial<Product>,
) {
  const { account } = requireSession();
  const idx = products.findIndex(
    (p) => p.id === productId && p.accountId === account.id,
  );
  if (idx < 0) throw new ApiError("Product not found", "not_found");
  products[idx] = {
    ...products[idx],
    ...patch,
    id: productId,
    accountId: account.id,
  };
  return delay(products[idx]);
}
export async function deleteProduct(productId: string) {
  const { account } = requireSession();
  const idx = products.findIndex(
    (p) => p.id === productId && p.accountId === account.id,
  );
  if (idx < 0) throw new ApiError("Product not found", "not_found");
  products.splice(idx, 1);
  return delay({ ok: true });
}

export async function listCategories() {
  return delay(categories);
}
export async function createCategory(input: Category) {
  if (categories.some((c) => c.code === input.code.toUpperCase()))
    throw new ApiError("Category code already exists.", "validation_error", {
      code: "Duplicate category code",
    });
  const row = { ...input, code: input.code.toUpperCase() };
  categories.push(row);
  return delay(row);
}
export async function updateCategory(code: string, patch: Partial<Category>) {
  const idx = categories.findIndex((c) => c.code === code);
  if (idx < 0) throw new ApiError("Category not found", "not_found");
  categories[idx] = {
    ...categories[idx],
    ...patch,
    code: patch.code?.toUpperCase() ?? code,
  };
  return delay(categories[idx]);
}
export async function deleteCategory(code: string) {
  const attached = products.some((p) => p.folder === code);
  if (attached)
    throw new ApiError(
      "Cannot delete category while products are attached.",
      "validation_error",
    );
  const idx = categories.findIndex((c) => c.code === code);
  if (idx < 0) throw new ApiError("Category not found", "not_found");
  categories.splice(idx, 1);
  return delay({ ok: true });
}
