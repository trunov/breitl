import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Boxes, FolderTree, LayoutDashboard, LogOut, Package, Users, UserRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import type { Locale } from '../api/types';

export function Layout() {
  const auth = useAuth();
  const { t, locale, setLocale } = useI18n();
  const navigate = useNavigate();
  const links = [
    { to: '/', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/clients', label: t('clients'), icon: Boxes },
    { to: '/products', label: t('products'), icon: Package },
    { to: '/categories', label: t('categories'), icon: FolderTree },
    ...(auth.user?.role === 'owner' ? [{ to: '/users', label: t('users'), icon: Users }] : []),
  ];
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand">ERP</div>
      <nav>{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
    </aside>
    <main className="main">
      <header className="topbar">
        <div className="session-info"><UserRound size={18}/><strong>{auth.user?.fullName}</strong><span>{auth.account?.name}</span><span className="pill">{auth.account?.id}</span></div>
        <div className="topbar-actions">
          <select aria-label={t('language')} value={locale} onChange={(e) => setLocale(e.target.value as Locale)}><option value="en">EN</option><option value="ru">RU</option><option value="et">ET</option></select>
          <button className="ghost" onClick={async () => { await auth.logout(); navigate('/login'); }}><LogOut size={16}/>{t('logout')}</button>
        </div>
      </header>
      <section className="content"><Outlet /></section>
    </main>
  </div>;
}
