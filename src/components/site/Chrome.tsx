import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Instagram, Mail, MapPin, Menu, Phone, X, Ghost, Facebook, UserRound } from 'lucide-react';
import { useAuth, homeFor } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import { cx, weekdayFr } from '../../lib/format';

export const Logo: React.FC<{ className?: string; showText?: boolean }> = ({ className, showText = true }) => {
  const { settings } = useConfig();
  return (
    <Link to="/" className={cx('group flex items-center gap-3', className)} aria-label={`${settings.studio_name} — accueil`}>
      <img src="/logo.jpg" alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-ember/40 transition group-hover:ring-ember" />
      {showText && (
        <span className="leading-none">
          <span className="block font-display text-[15px] font-bold uppercase tracking-[0.14em]">{settings.studio_name}</span>
          <span className="mt-1 block text-[10px] uppercase tracking-widest2 text-bone-600">Studio · Dakar</span>
        </span>
      )}
    </Link>
  );
};

const NAV = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/services', label: 'Services' },
  { to: '/studio', label: 'Le studio' },
  { to: '/equipements', label: 'Équipements' },
  { to: '/contact', label: 'Contact' }
];

export const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const overHero = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const solid = scrolled || !overHero || open;
  return (
    <header className={cx('fixed inset-x-0 top-0 z-50 transition-all duration-500', solid ? 'border-b border-ink-600/60 bg-ink/85 backdrop-blur-xl' : 'bg-transparent')}>
      <div className="container-x flex h-[72px] items-center justify-between gap-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => cx('relative rounded-full px-4 py-2 text-[13px] font-semibold tracking-wide transition', isActive ? 'text-bone' : 'text-bone-400 hover:text-bone')}>
              {({ isActive }) => (
                <>
                  {n.label}
                  <span className={cx('absolute inset-x-4 -bottom-0.5 h-px bg-gradient-to-r from-ember to-crimson transition-transform duration-300', isActive ? 'scale-x-100' : 'scale-x-0')} />
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Link to={user ? homeFor(user.role) : '/connexion'} className="flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold text-bone-200 transition hover:bg-ink-700 hover:text-bone">
            <UserRound className="h-4 w-4" />
            {user ? (user.role === 'client' ? 'Mon espace' : 'Mon tableau de bord') : 'Connexion'}
          </Link>
          <Link to="/reservation" className="group flex h-10 items-center gap-2 rounded-full bg-bone pl-5 pr-4 text-[13px] font-bold text-ink transition hover:bg-white">
            Réserver
            <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
        <button className="rounded-full p-2 text-bone lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-x-0 bottom-0 top-[72px] z-40 animate-fade-in overflow-y-auto bg-ink lg:hidden">
          <nav className="container-x flex flex-col py-6" aria-label="Navigation mobile">
            {NAV.map((n, i) => (
              <NavLink key={n.to} to={n.to} end={n.end} style={{ animationDelay: `${i * 50}ms` }}
                className={({ isActive }) => cx('flex animate-fade-up items-center justify-between border-b border-ink-700 py-5 font-display text-3xl font-semibold', isActive ? 'text-ember' : 'text-bone')}>
                {n.label}
                <ArrowUpRight className="h-5 w-5 text-bone-600" />
              </NavLink>
            ))}
            <div className="mt-8 grid gap-3">
              <Link to="/reservation" className="flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-ember to-crimson font-bold text-white">Réserver une session</Link>
              <Link to={user ? homeFor(user.role) : '/connexion'} className="flex h-14 items-center justify-center rounded-full border border-ink-500 font-semibold">
                {user ? (user.role === 'client' ? 'Mon espace' : 'Mon tableau de bord') : 'Connexion / Inscription'}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export const Footer: React.FC = () => {
  const { settings, openingHours } = useConfig();
  const open = openingHours.filter((d) => d.is_open);
  const hoursText = (() => {
    if (!open.length) return null;
    const first = open[0];
    const same = open.every((d) => d.open_time === first.open_time && d.close_time === first.close_time);
    const closed = openingHours.filter((d) => !d.is_open).map((d) => weekdayFr[d.weekday].toLowerCase());
    if (same) return `${first.open_time.replace(':', 'h')} – ${first.close_time.replace('24:00', '00h').replace(':', 'h')}${closed.length ? ` · fermé le ${closed.join(', ')}` : ''}`;
    return null;
  })();
  const socials = [
    { url: settings.instagram_url, icon: Instagram, label: 'Instagram' },
    { url: settings.snapchat_url, icon: Ghost, label: 'Snapchat' },
    { url: settings.facebook_url, icon: Facebook, label: 'Facebook' }
  ].filter((s) => s.url);

  return (
    <footer className="relative overflow-hidden border-t border-ink-600/60 bg-ink-900">
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-ember/10 blur-3xl" />
      <div className="container-x relative py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-bone-400">
              Studio d’enregistrement professionnel au cœur des Almadies. Enregistrement, mixage, mastering et production — avec une équipe qui écoute.
            </p>
            <div className="mt-6 flex gap-2">
              {socials.map((s) => (
                <a key={s.label} href={s.url!} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-600 text-bone-400 transition hover:border-ember hover:text-bone">
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            <div>
              <p className="eyebrow mb-4 text-bone-600">Studio</p>
              <ul className="space-y-2.5 text-sm text-bone-200">
                <li><Link className="hover:text-ember" to="/services">Services & tarifs</Link></li>
                <li><Link className="hover:text-ember" to="/studio">Galerie</Link></li>
                <li><Link className="hover:text-ember" to="/equipements">Équipements</Link></li>
                <li><Link className="hover:text-ember" to="/reservation">Réserver</Link></li>
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-4 text-bone-600">Compte</p>
              <ul className="space-y-2.5 text-sm text-bone-200">
                <li><Link className="hover:text-ember" to="/mon-espace">Mon espace</Link></li>
                <li><Link className="hover:text-ember" to="/connexion">Connexion</Link></li>
                <li><Link className="hover:text-ember" to="/inscription">Créer un compte</Link></li>
                <li><Link className="hover:text-ember" to="/admin">Équipe</Link></li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="eyebrow mb-4 text-bone-600">Contact</p>
              <ul className="space-y-3 text-sm text-bone-200">
                {settings.contact_phone && <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-ember" /><a href={`tel:${settings.contact_phone.replace(/\s/g, '')}`}>{settings.contact_phone}</a></li>}
                {settings.contact_email && <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-ember" /><a className="break-all" href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a></li>}
                {settings.address && <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ember" />{settings.maps_url ? <a href={settings.maps_url} target="_blank" rel="noopener noreferrer">{settings.address}</a> : settings.address}</li>}
                {hoursText && <li className="text-bone-400">{hoursText}</li>}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-ink-600/60 pt-6 text-xs text-bone-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {settings.studio_name}. Tous droits réservés.</p>
          <p>Paiement sécurisé PayTech · Wave · Orange Money · Carte</p>
        </div>
      </div>
    </footer>
  );
};

export const PublicLayout: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-bone focus:px-4 focus:py-2 focus:text-ink">Aller au contenu</a>
      <Header />
      <main id="contenu" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// En-tête de page intérieure du site
export const PageHero: React.FC<{ eyebrow: string; title: React.ReactNode; text?: React.ReactNode; children?: React.ReactNode }> = ({ eyebrow, title, text, children }) => (
  <section className="relative overflow-hidden pb-14 pt-36 sm:pb-20 sm:pt-44">
    <div className="pointer-events-none absolute -top-40 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-ember/15 blur-[120px]" />
    <div className="pointer-events-none absolute left-[-10%] top-20 h-72 w-72 rounded-full bg-crimson/10 blur-[100px]" />
    <div className="container-x relative">
      <p className="eyebrow animate-fade-up">{eyebrow}</p>
      <h1 className="mt-5 max-w-4xl animate-fade-up text-[2.6rem] font-semibold leading-[1.02] sm:text-6xl lg:text-7xl" style={{ animationDelay: '80ms' }}>{title}</h1>
      {text && <p className="mt-6 max-w-2xl animate-fade-up text-base leading-relaxed text-bone-400 sm:text-lg" style={{ animationDelay: '160ms' }}>{text}</p>}
      {children}
    </div>
  </section>
);
