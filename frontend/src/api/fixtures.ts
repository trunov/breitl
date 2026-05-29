import type { Account, Category, Client, Product, User } from './types';

export const passwordsByUserId: Record<string, string> = {
  u_owner: 'Password1',
  u_manager: 'Password1',
};

export const accounts: Account[] = [
  { id: 'MTR10237', name: 'Metro Trade OÜ', createdAt: '2026-01-10T10:00:00.000Z' },
];

export const users: User[] = [
  { id: 'u_owner', accountId: 'MTR10237', fullName: 'Olga Owner', email: 'owner@example.com', role: 'owner', isActive: true },
  { id: 'u_manager', accountId: 'MTR10237', fullName: 'Mark Manager', email: 'manager@example.com', role: 'manager', isActive: true },
];

export const clients: Client[] = [
  {
    id: 'c1', accountId: 'MTR10237', type: 'legal', activityZone: 0, companyName: 'Tallinn Packaging OÜ', registrationCode: '12345678', taxObligation: 2, vatNumber: 'EE100000001', phone: '+372 5555 0101', phoneType: 'main', email: 'sales@pack.example', emailType: 'sales', city: 'Tallinn', county: 'Harjumaa', country: 'Эстония', addressType: 'office', bank: 'LHV Pank', bankAccount: 'EE001010220000000001', accountHolder: 'Tallinn Packaging OÜ', notes: 'Primary packaging supplier', createdAt: '2026-02-01T12:00:00.000Z',
  },
  {
    id: 'c2', accountId: 'MTR10237', type: 'private', firstName: 'Ivan', lastName: 'Petrov', personalCode: '38901010001', documentKind: 'id_card', phone: '+372 5555 0202', phoneType: 'main', email: 'ivan@example.com', emailType: 'main', city: 'Tartu', county: 'Tartumaa', country: 'Эстония', addressType: 'legal_personal', carNumber: '123ABC', createdAt: '2026-02-05T12:00:00.000Z',
  },
];

export const categories: Category[] = [
  { code: 'RAW', name: { en: 'Raw materials', ru: 'Сырьё', et: 'Tooraine' } },
  { code: 'PKG', name: { en: 'Packaging', ru: 'Упаковка', et: 'Pakendid' } },
  { code: 'SRV', name: { en: 'Services', ru: 'Услуги', et: 'Teenused' } },
];

export const products: Product[] = [
  { id: 'p1', accountId: 'MTR10237', code: 'BOX-001', folder: 'PKG', ean: '4740000000011', sortOrder: 10, unit: 'pcs', showInPriceList: true, name: { en: 'Cardboard box S', ru: 'Картонная коробка S', et: 'Pappkast S' }, description: { en: 'Small cardboard box', ru: 'Малая картонная коробка', et: 'Väike pappkast' }, clientCodes: [{ clientId: 'c1', code: 'TB-S' }], wasteCodes: ['15 01 01'], createdAt: '2026-02-10T12:00:00.000Z' },
  { id: 'p2', accountId: 'MTR10237', code: 'CONS-01', folder: 'SRV', sortOrder: 20, unit: 'hour', showInPriceList: false, name: { en: 'Consulting hour', ru: 'Час консультации', et: 'Konsultatsiooni tund' }, description: { en: 'Business consulting service', ru: 'Консультационная услуга', et: 'Ärikonsultatsiooni teenus' }, clientCodes: [], wasteCodes: [], createdAt: '2026-02-11T12:00:00.000Z' },
];
