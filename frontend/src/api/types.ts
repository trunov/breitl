export type Locale = 'et' | 'ru' | 'en';
export type LocalizedString = Record<Locale, string>;

export interface Account {
  id: string;
  name: string;
  createdAt: string;
}

export type UserRole = 'owner' | 'manager' | 'warehouse' | 'viewer';

export interface User {
  id: string;
  accountId: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export type ClientType = 'private' | 'legal';
export type ActivityZone = 0 | 1 | 2;
export type TaxObligation = 0 | 1 | 2;
export type DocumentKind = 'id_card' | 'passport' | 'drivers_license';
export type PhoneType = 'main' | 'spare';
export type EmailType = 'main' | 'sales';
export type AddressType = 'legal_personal' | 'production' | 'office';

export interface Client {
  id: string;
  accountId: string;
  type: ClientType;
  firstName?: string;
  lastName?: string;
  personalCode?: string;
  activityZone?: ActivityZone;
  companyName?: string;
  registrationCode?: string;
  taxObligation?: TaxObligation;
  vatNumber?: string;
  documentKind?: DocumentKind;
  documentNumber?: string;
  documentExpires?: string;
  phone?: string;
  phoneType?: PhoneType;
  email?: string;
  emailType?: EmailType;
  street?: string;
  house?: string;
  apartment?: string;
  district?: string;
  city?: string;
  postalCode?: string;
  county?: string;
  country?: string;
  addressType?: AddressType;
  bank?: string;
  bankAccount?: string;
  accountHolder?: string;
  carNumber?: string;
  trustedPersonId?: string;
  notes?: string;
  createdAt: string;
}

export type ProductUnit = 'ton' | 'kg' | 'pcs' | 'hour' | 'km' | 'day';

export interface ProductClientCode {
  clientId: string;
  code: string;
}

export interface Category {
  code: string;
  name: LocalizedString;
}

export interface Product {
  id: string;
  accountId: string;
  code: string;
  folder: string;
  ean?: string;
  sortOrder?: number;
  unit: ProductUnit;
  showInPriceList: boolean;
  name: LocalizedString;
  description: LocalizedString;
  clientCodes: ProductClientCode[];
  wasteCodes: string[];
  createdAt: string;
}

export interface ApiErrorShape {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

export class ApiError extends Error {
  code: string;
  fields?: Record<string, string>;

  constructor(message: string, code = 'error', fields?: Record<string, string>) {
    super(message);
    this.code = code;
    this.fields = fields;
  }
}

export interface PageResult<T> {
  data: T[];
  total: number;
}

export interface ListParams {
  q?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
