import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, CalendarDays, CreditCard, FileText, Package, Music2, Disc3, Images, LayoutDashboard, ListChecks, LogOut, Menu, Mic2, Settings, Users, UserCog, X, Headphones, ExternalLink, CalendarOff, ShieldCheck
} from 'lucide-react';
import { api } from '../../lib/api';
import { cx, fAgo } from '../../lib/format';
import { ROLE } from '../../lib/labels';
import type { Notification } from '../../lib/types';
import { homeFor, useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import { ForcePasswordChange } from '../../components/Guards';
import { AppPrompts } from '../../components/AppPrompts';
import { Alert, Button, Field, Input, Spinner } from '../../components/ui';
import { PasswordInput } from '../auth/AuthPages';
import { useDocumentTitle } from '../../lib/hooks';

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; end?: boolean; superOnly?: boolean };

const ADMIN_NAV: NavItem[] = [
  { to: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/admin/reservations', label: 'Réservations', icon: ListChecks },
  { to: '/admin/commandes', label: 'Commandes', icon: Package },
  { to: '/admin/calendrier', label: 'Calendrier', icon: CalendarDays },
  { to: '/admin/paiements', label: 'Paiements', icon: CreditCard },
  { to: '/admin/factures', label: 'Factures', icon: FileText },
  { to: '/admin/clients', label: 'Clients', icon: Users },
  { to: '/admin/ingenieurs', label: 'Ingénieurs son', icon: Headphones },
  { to: '/admin/services', label: 'Services', icon: Disc3 },
  { to: '/admin/equipements', label: 'Équipements', icon: Mic2 },
  { to: '/admin/galerie', label: 'Galerie', icon: Images },
  { to: '/admin/productions', label: 'Productions', icon: Music2 },
  { to: '/admin/disponibilites', label: 'Horaires & fermetures', icon: CalendarOff },
  { to: '/admin/administrateurs', label: 'Administrateurs', icon: ShieldCheck, superOnly: true },
  { to: '/admin/parametres', label: 'Paramètres', icon: Settings }
];

const ENGINEER_NAV: NavItem[] = [
  { to: '/ingenieur', label: 'Mes sessions', icon: LayoutDashboard, end: true },
  { to: '/ingenieur/calendrier', label: 'Calendrier', icon: CalendarDays },
  { to: '/ingenieur/disponibilites', label: 'Mes absences', icon: CalendarOff },
  { to: '/ingenieur/profil', label: 'Mon profil', icon: UserCog }
];

const NotificationBell: React.FC<{ base: string }> = ({ base }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<{ notifications: Notification[]; unread: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const load = () => api<{ notifications: Notification[]; unread: number }>(`${base}/notifications`).then(setData).catch(() => {});

  useEffect(() => {
    load();
    const t = setInterval(load, 45000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const markAll = async () => { await api(`${base}/notifications/read`, { method: 'POST', body: { ids: 'all' } }); load(); };
  const openOne = async (n: Notification) => {
    if (!n.read_at) await api(`${base}/notifications/read`, { method: 'POST', body: { ids: [n.id] } }).catch(() => {});
    setOpen(false);
    load();
    if (n.reservation_id) navigate(base === '/admin' ? `/admin/reservations?id=${n.reservation_id}` : `/ingenieur?session=${n.reservation_id}`);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => { setOpen(!open); if (!open) load(); }} className="relative rounded-full p-2.5 text-bone-200 hover:bg-ink-700" aria-label={`Notifications${data?.unread ? ` (${data.unread} non lues)` : ''}`}>
        <Bell className="h-5 w-5" />
        {!!data?.unread && <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-ember px-1 text-[10px] font-bold text-white">{data.unread > 99 ? '99+' : data.unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-sm animate-scale-in overflow-hidden rounded-2xl border border-ink-600 bg-ink-800 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between border-b border-ink-600/70 px-4 py-3">
            <p className="font-semibold">Notifications</p>
            {!!data?.unread && <button onClick={markAll} className="text-xs font-semibold text-ember hover:underline">Tout marquer comme lu</button>}
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {!data ? <Spinner className="py-8" /> : data.notifications.length === 0 ? <p className="px-4 py-10 text-center text-sm text-bone-600">Aucune notification</p> : data.notifications.map((n) => (
              <button key={n.id} onClick={() => openOne(n)} className={cx('block w-full border-b border-ink-700 px-4 py-3 text-left transition hover:bg-ink-700', !n.read_at && 'bg-ember/5')}>
                <div className="flex items-start gap-2">
                  {!n.read_at && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ember" />}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{n.title}</p>
                    {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-bone-400">{n.body}</p>}
                    <p className="mt-1 text-[11px] text-bone-600">{fAgo(n.created_at)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const StaffLayout: React.FC<{ kind: 'admin' | 'engineer' }> = ({ kind }) => {
  const { user, logout } = useAuth();
  const { settings } = useConfig();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => { setOpen(false); }, [location.pathname]);
  const items = (kind === 'admin' ? ADMIN_NAV : ENGINEER_NAV).filter((i) => !i.superOnly || user?.role === 'super_admin');

  const nav = (
    <nav className="flex flex-col gap-0.5">
      {items.map((i) => (
        <NavLink key={i.to} to={i.to} end={i.end}
          className={({ isActive }) => cx('flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition', isActive ? 'bg-gradient-to-r from-ember/20 to-transparent text-bone ring-1 ring-inset ring-ember/25' : 'text-bone-400 hover:bg-ink-700 hover:text-bone')}>
          <i.icon className="h-4 w-4" />{i.label}
        </NavLink>
      ))}
    </nav>
  );

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to={kind === 'admin' ? '/admin/dashboard' : '/ingenieur'} className="flex items-center gap-3 px-2">
        <img src="/logo.jpg" alt="" className="h-9 w-9 rounded-full ring-1 ring-ember/40" />
        <div className="leading-tight">
          <p className="font-display text-sm font-bold uppercase tracking-wider">{settings.studio_name}</p>
          <p className="text-[10px] uppercase tracking-widest text-ember">{kind === 'admin' ? 'Administration' : 'Espace ingénieur'}</p>
        </div>
      </Link>
      <div className="mt-8 flex-1 overflow-y-auto">{nav}</div>
      <div className="mt-6 space-y-1 border-t border-ink-600/70 pt-4">
        <a href="/" target="_blank" rel="noopener" className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-bone-400 hover:bg-ink-700 hover:text-bone"><ExternalLink className="h-4 w-4" />Voir le site</a>
        <button onClick={() => { logout(); navigate(kind === 'admin' ? '/admin' : '/connexion'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-bone-400 hover:bg-ink-700 hover:text-bone"><LogOut className="h-4 w-4" />Déconnexion</button>
        <div className="flex items-center gap-3 px-3 pt-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-600 text-xs font-bold">{user?.first_name?.[0]}</span>
          <div className="min-w-0 text-xs">
            <p className="truncate font-semibold">{user?.first_name} {user?.last_name}</p>
            <p className="truncate text-bone-600">{ROLE[user?.role || '']}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-900">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-ink-600/60 bg-ink p-5 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-black/70" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 animate-fade-in bg-ink p-5">
            <button onClick={() => setOpen(false)} className="absolute right-4 top-5 p-1 text-bone-400" aria-label="Fermer le menu"><X className="h-5 w-5" /></button>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-ink-600/60 bg-ink-900/85 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
          <button className="rounded-full p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Ouvrir le menu"><Menu className="h-5 w-5" /></button>
          <div className="hidden text-sm text-bone-600 lg:block">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <NotificationBell base={kind === 'admin' ? '/admin' : '/engineer'} />
        </header>
        <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10"><AppPrompts app="admin" /><Outlet /></main>
      </div>
      <ForcePasswordChange />
    </div>
  );
};

// ------------------------------------------------------------------ /admin : connexion de l'équipe
export const StaffLogin: React.FC = () => {
  useDocumentTitle('Administration');
  const { user, ready, login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!ready) return <div className="flex min-h-screen items-center justify-center"><Spinner /></div>;
  if (user && user.role !== 'client') return <Navigate to={homeFor(user.role)} replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const u = await login(email, password);
      if (u.role === 'client') { logout(); setError('Cet espace est réservé à l’équipe du studio.'); return; }
      navigate(homeFor(u.role), { replace: true });
    } catch (err: any) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-ember/15 blur-[140px]" />
      <form onSubmit={submit} className="card relative w-full max-w-md animate-scale-in space-y-5 p-8">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="" className="h-11 w-11 rounded-full ring-1 ring-ember/40" />
          <div><p className="font-display font-bold">Espace équipe</p><p className="text-xs text-bone-600">Administration · Ingénieurs du son</p></div>
        </div>
        {user?.role === 'client' && <Alert tone="info">Vous êtes connecté avec un compte client. <Link className="underline" to="/mon-espace">Aller à mon espace</Link></Alert>}
        {error && <Alert>{error}</Alert>}
        <Field label="E-mail"><Input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Mot de passe"><PasswordInput required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        <Button type="submit" size="lg" className="w-full" loading={busy}>Se connecter</Button>
        <p className="text-center text-xs text-bone-600"><Link to="/mot-de-passe-oublie" className="hover:text-bone">Mot de passe oublié ?</Link> · <Link to="/" className="hover:text-bone">Retour au site</Link></p>
      </form>
    </div>
  );
};
