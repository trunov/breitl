import { createContext, useContext, useMemo, useState } from 'react';
import type { Locale } from '../api/types';

const dictionary: Record<Locale, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard', clients: 'Clients', products: 'Products', categories: 'Categories', users: 'Users', logout: 'Logout', login: 'Login', register: 'Register', search: 'Search', createNew: 'Create new', save: 'Save', delete: 'Delete', cancel: 'Cancel', loading: 'Loading…', empty: 'Nothing found', error: 'Error', type: 'Type', name: 'Name', code: 'Code', email: 'Email', phone: 'Phone', city: 'City', folder: 'Folder', unit: 'Unit', showInPrice: 'Show in price list', language: 'Language', accountId: 'Account ID'
  },
  ru: {
    dashboard: 'Панель', clients: 'Клиенты', products: 'Товары', categories: 'Категории', users: 'Пользователи', logout: 'Выйти', login: 'Войти', register: 'Регистрация', search: 'Поиск', createNew: 'Создать', save: 'Сохранить', delete: 'Удалить', cancel: 'Отмена', loading: 'Загрузка…', empty: 'Ничего не найдено', error: 'Ошибка', type: 'Тип', name: 'Наименование', code: 'Код', email: 'E-mail', phone: 'Телефон', city: 'Город', folder: 'Папка', unit: 'Ед.', showInPrice: 'Показывать в прайсе', language: 'Язык', accountId: 'ID аккаунта'
  },
  et: {
    dashboard: 'Töölaud', clients: 'Kliendid', products: 'Tooted', categories: 'Kategooriad', users: 'Kasutajad', logout: 'Logi välja', login: 'Logi sisse', register: 'Registreeri', search: 'Otsi', createNew: 'Lisa uus', save: 'Salvesta', delete: 'Kustuta', cancel: 'Tühista', loading: 'Laadimine…', empty: 'Midagi ei leitud', error: 'Viga', type: 'Tüüp', name: 'Nimi', code: 'Kood', email: 'E-post', phone: 'Telefon', city: 'Linn', folder: 'Kaust', unit: 'Ühik', showInPrice: 'Näita hinnakirjas', language: 'Keel', accountId: 'Konto ID'
  },
};

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');
  const value = useMemo(() => ({ locale, setLocale, t: (key: string) => dictionary[locale][key] ?? dictionary.en[key] ?? key }), [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
