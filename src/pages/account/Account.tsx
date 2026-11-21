import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarClock, CalendarPlus, CreditCard, FileText, Banknote, LayoutDashboard, ListMusic, LogOut, UserRound, Clock, CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync, useDocumentTitle } from '../../lib/hooks';
import { cx, fDate, fDateShort, fRange, fTime, fcfa, phoneDisplay, studioNow } from '../../lib/format';
import { PAYMENT, PRODUCTION, SESSION, STATUT } from '../../lib/labels';
import { OrderSteps } from '../../components/OrderSteps';
import { DownloadInvoiceButton } from '../../components/InvoiceDocument';
import type { DaySummary, Reservation, Slot, User } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Header } from '../../components/site/Chrome';
import { Alert, Badge, Button, Confirm, Empty, ErrorState, Field, Input, Modal, PageHeader, Spinner, StatCard, StatusBadge, Tabs } from '../../components/ui';
import { SlotPicker } from '../../components/SlotPicker';
import { ForcePasswordChange } from '../../components/Guards';
import { AppPrompts, PushToggle } from '../../components/AppPrompts';
import { PasswordInput } from '../auth/AuthPages';

// ------------------------------------------------------------------ Mise en page
export const AccountLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    { to: '/mon-espace', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
    { to: '/mon-espace/reservations', label: 'Mes réservations', icon: ListMusic },
    { to: '/mon-espace/factures', label: 'Factures', icon: FileText },
    { to: '/mon-espace/profil', label: 'Profil', icon: UserRound }
  ];
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container-x pb-20 pt-28">
        <div className="grid gap-8 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="card p-5 lg:sticky lg:top-24">
              <div className="flex items-center gap-3">
                {user?.avatar_url ? <img src={user.avatar_url} alt="" className="h-11 w-11 rounded-full" referrerPolicy="no-referrer" /> : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-ember to-crimson font-display font-bold">{user?.first_name?.[0] || '?'}</span>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold">{user?.first_name} {user?.last_name}</p>
                  <p className="truncate text-xs text-bone-600">{user?.email}</p>
                </div>
              </div>
              <nav className="no-scrollbar mt-5 flex gap-1 overflow-x-auto lg:flex-col">
                {links.map((l) => (
                  <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => cx('flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition', isActive ? 'bg-ink-600 text-bone' : 'text-bone-400 hover:bg-ink-700 hover:text-bone')}>
                    <l.icon className="h-4 w-4" />{l.label}
                  </NavLink>
                ))}
                <button onClick={() => { logout(); navigate('/'); }} className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-bone-400 transition hover:bg-ink-700 hover:text-bone">
                  <LogOut className="h-4 w-4" />Déconnexion
                </button>
              </nav>
              <Button to="/reservation" className="mt-5 hidden w-full lg:flex" icon={<CalendarPlus className="h-4 w-4" />}>Nouvelle réservation</Button>
            </div>
          </aside>
          <main className="min-w-0 lg:col-span-9"><AppPrompts app="client" /><Outlet /></main>
        </div>
      </div>
      <ForcePasswordChange />
    </div>
  );
};

const useMyReservations = () => useAsync(() => api<{ reservations: Reservation[] }>('/client/reservations').then((r) => r.reservations), []);

const isPast = (r: Reservation) => r.statut === 'terminee' || (r.end_at ? r.end_at < studioNow() : false);
const isUpcoming = (r: Reservation) => (r.statut === 'confirmee' || r.statut === 'en_attente') && !isPast(r);

// ------------------------------------------------------------------ Tableau de bord
export const AccountDashboard: React.FC = () => {
  useDocumentTitle('Mon espace');
  const { user } = useAuth();
  const { data, loading, error, reload } = useMyReservations();
  const list = data || [];
  const upcoming = list.filter(isUpcoming).filter((r) => r.start_at).sort((a, b) => String(a.start_at).localeCompare(String(b.start_at)));
  const next = upcoming[0];
  const due = list.filter((r) => r.can_pay_balance).reduce((s, r) => s + (r.solde || 0), 0);

  return (
    <div>
      <PageHeader eyebrow="Mon espace" title={`Bonjour ${user?.first_name || ''}`} subtitle="Retrouvez vos sessions, leurs statuts et vos paiements." />
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && (
        <div className="space-y-6">
          {next ? (
            <div className="grain relative overflow-hidden rounded-3xl border border-ember/25 bg-gradient-to-br from-ember/20 via-ink-800 to-ink-800 p-6 sm:p-8">
              <p className="eyebrow">Prochaine session</p>
              <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">{next.service_name}</h2>
              <p className="mt-2 text-bone-200">{fDate(next.start_at)} · {fRange(next.start_at, next.end_at)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusBadge map={STATUT} value={next.statut} />
                {next.payment_status && <StatusBadge map={PAYMENT} value={next.payment_status} />}
                {next.session_status === 'autorisee' && <StatusBadge map={SESSION} value="autorisee" />}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button to={`/mon-espace/reservations?voir=${next.id}`} variant="subtle" size="sm">Détails</Button>
                {next.can_reschedule && <Button to={`/mon-espace/reservations?reporter=${next.id}`} variant="outline" size="sm" icon={<CalendarClock className="h-4 w-4" />}>Reporter</Button>}
              </div>
            </div>
          ) : (
            <Empty icon={<CalendarPlus className="h-8 w-8" />} title="Aucune session à venir" text="Réservez votre prochain créneau en quelques clics." action={<Button to="/reservation">Réserver une session</Button>} />
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="À venir" value={upcoming.length} icon={<Clock className="h-4 w-4" />} />
            <StatCard label="Effectuées" value={list.filter(isPast).filter((r) => r.statut !== 'annulee').length} icon={<CheckCircle2 className="h-4 w-4" />} />
            <StatCard label="Reste à régler" value={<span className="text-2xl">{fcfa(due)}</span>} icon={<CreditCard className="h-4 w-4" />} />
          </div>
          <Link to="/mon-espace/reservations" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-ember">Toutes mes réservations <ArrowRight className="h-4 w-4" /></Link>
        </div>
      )}
    </div>
  );
};

// ------------------------------------------------------------------ Réservations
const RescheduleModal: React.FC<{ reservation: Reservation | null; onClose: () => void; onDone: (r: Reservation) => void }> = ({ reservation: r, onClose, onDone }) => {
  const [start, setStart] = useState<string | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const toast = useToast();
  useEffect(() => { setStart(null); setError(null); }, [r?.id]);
  const loadDays = useMemo(() => () => api<{ days: DaySummary[] }>(`/client/reservations/${r?.id}/availability`).then((x) => x.days), [r?.id]);
  const loadSlots = useMemo(() => (d: string) => api<{ slots: Slot[] }>(`/client/reservations/${r?.id}/availability?date=${d}`).then((x) => x.slots), [r?.id]);
  if (!r) return null;

  const submit = async () => {
    setBusy(true); setError(null);
    try {
      const res = await api<{ reservation: Reservation }>(`/client/reservations/${r.id}/reschedule`, { method: 'POST', body: { start } });
      toast('Session reportée. Le studio a été informé.');
      onDone(res.reservation);
    } catch (e: any) {
      setError(e.message);
      setStart(null); setKey((k) => k + 1);
    } finally { setBusy(false); }
  };

  return (
    <Modal open onClose={onClose} size="lg" title="Reporter ma session"
      footer={<><Button variant="ghost" onClick={onClose}>Annuler</Button><Button disabled={!start} loading={busy} onClick={submit}>Confirmer le report</Button></>}>
      <div className="mb-5 rounded-2xl border border-ink-600 bg-ink-900 p-4 text-sm">
        <p className="text-bone-400">Créneau actuel</p>
        <p className="mt-1 font-semibold">{r.service_name} · {fDate(r.start_at)} · {fRange(r.start_at, r.end_at)} ({r.duree_heures} h)</p>
        {start && <p className="mt-3 text-bone-400">Nouveau créneau : <span className="font-semibold text-ember">{fDate(start)} · {label}</span></p>}
      </div>
      {error && <Alert className="mb-4">{error}</Alert>}
      <SlotPicker loadDays={loadDays} loadSlots={loadSlots} value={start} currentStart={r.start_at} reloadKey={`${r.id}-${key}`} onChange={(s, slot) => { setStart(s); setLabel(slot?.label || null); }} />
      <p className="mt-5 text-xs text-bone-600">Report possible jusqu’à {Math.round((r.reschedule_limit_minutes || 120) / 60)} h avant la session. L’ancien créneau est libéré automatiquement.</p>
    </Modal>
  );
};

const ReservationCard: React.FC<{ r: Reservation; onReschedule: () => void; onChanged: () => void; highlight?: boolean }> = ({ r, onReschedule, onChanged, highlight }) => {
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmCash, setConfirmCash] = useState(false);
  const pay = async (path: string) => {
    setBusy(path);
    try { window.location.href = (await api<{ redirectUrl: string }>(`/client/reservations/${r.id}/${path}`, { method: 'POST' })).redirectUrl; }
    catch (e: any) { toast(e.message, 'error'); setBusy(null); }
  };
  const order = r.order && r.order.milestones.length ? r.order : null;
  const due = order?.milestones.find((m) => m.id === order.current_id) || null;
  const dueAmount = due ? due.amount : r.solde;
  const lateRule = r.booking_mode === 'slot' && r.statut === 'confirmee' && !r.can_reschedule && !isPast(r) && !['en_cours'].includes(r.session_status);

  return (
    <article id={`res-${r.id}`} className={cx('card scroll-mt-28 p-5 transition sm:p-6', highlight && 'border-ember/50 ring-1 ring-ember/30')}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          {r.start_at ? (
            <div className="flex w-16 shrink-0 flex-col items-center rounded-2xl border border-ink-600 bg-ink-900 py-2">
              <span className="text-[10px] font-semibold uppercase text-bone-600">{fDateShort(r.start_at).split(' ')[0]}</span>
              <span className="font-display text-2xl font-semibold">{Number(r.start_at.slice(8, 10))}</span>
              <span className="text-[10px] uppercase text-bone-400">{fTime(r.start_at)}</span>
            </div>
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-ink-600 bg-ink-900"><ListMusic className="h-6 w-6 text-ember" /></div>
          )}
          <div>
            <h3 className="text-lg font-semibold">{r.service_name}</h3>
            <p className="text-sm text-bone-400">
              {r.start_at ? `${fDate(r.start_at)} · ${fRange(r.start_at, r.end_at)} · ${r.duree_heures} h` : `${r.nombre_titres || 1} titre(s) · commandé le ${fDateShort(r.date_reservation)}`}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <StatusBadge map={STATUT} value={r.statut} />
              {r.payment_status && r.statut !== 'annulee' && <StatusBadge map={PAYMENT} value={r.payment_status} />}
              {['autorisee', 'en_cours'].includes(r.session_status) && <StatusBadge map={SESSION} value={r.session_status} />}
              {r.reschedule_count > 0 && <Badge tone="blue"><RotateCcw className="h-3 w-3" />Reportée</Badge>}
            </div>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="font-display text-lg font-semibold">{fcfa(r.montant_total)}</p>
          {!!r.solde && r.statut === 'confirmee' && <p className="text-xs text-amberish">Reste {fcfa(r.solde)}</p>}
        </div>
      </div>

      {(r.can_reschedule || r.can_pay_balance || r.can_resume_payment || lateRule || r.invoice_id) && (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-ink-600/70 pt-4">
          {r.can_resume_payment && <Button size="sm" loading={busy === 'resume-payment'} onClick={() => pay('resume-payment')} icon={<CreditCard className="h-4 w-4" />}>Finaliser le paiement</Button>}
          {r.can_reschedule && <Button size="sm" variant="outline" onClick={onReschedule} icon={<CalendarClock className="h-4 w-4" />}>Reporter</Button>}
          {r.can_pay_balance && <Button size="sm" variant={due ? 'primary' : 'subtle'} loading={busy === 'pay-balance'} onClick={() => pay('pay-balance')} icon={<CreditCard className="h-4 w-4" />}>{due ? `Payer « ${due.label} » · ${fcfa(due.amount)}` : 'Régler le solde'}</Button>}
          {r.can_pay_balance && <Button size="sm" variant="ghost" onClick={() => setConfirmCash(true)} icon={<Banknote className="h-4 w-4" />}>Payer en espèces</Button>}
          {r.invoice_id && <DownloadInvoiceButton scope="client" id={r.invoice_id} number={String(r.invoice_id)} variant="ghost" label="Facture" />}
          {lateRule && <p className="text-xs text-bone-600">Report en ligne impossible à moins de {Math.round((r.reschedule_limit_minutes || 120) / 60)} h : contactez le studio.</p>}
        </div>
      )}
      {order && (
        <div className="mt-5 border-t border-ink-600/70 pt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-bone-400">Suivi de la commande</p>
            {order.production_status && PRODUCTION[order.production_status] && <Badge tone={PRODUCTION[order.production_status].tone}>{PRODUCTION[order.production_status].label}</Badge>}
          </div>
          <OrderSteps milestones={order.milestones} />
        </div>
      )}
      {r.statut === 'annulee' && r.cancel_reason && <p className="mt-4 text-xs text-bone-600">Motif : {r.cancel_reason}</p>}

      <Confirm open={confirmCash} onClose={() => setConfirmCash(false)} title="Payer en espèces"
        message={<>Vous réglerez <strong>{fcfa(dueAmount)}</strong> au studio{due ? <> (« {due.label} »)</> : null}. L’équipe validera la réception{due ? '' : ' avant le début de la session'}.</>}
        confirmLabel="Confirmer" onConfirm={async () => {
          try { await api(`/client/reservations/${r.id}/pay-cash`, { method: 'POST' }); toast('Le studio a été informé de votre paiement en espèces.'); setConfirmCash(false); onChanged(); }
          catch (e: any) { toast(e.message, 'error'); }
        }} />
    </article>
  );
};

export const AccountReservations: React.FC = () => {
  useDocumentTitle('Mes réservations');
  const { data, loading, error, reload, setData } = useMyReservations();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState('upcoming');
  const [resched, setResched] = useState<Reservation | null>(null);
  const focus = params.get('voir') || params.get('reporter');

  // Lien « reporter » (WhatsApp / tableau de bord) : ouvre directement la fenêtre de report
  useEffect(() => {
    if (!data || !focus) return;
    const r = data.find((x) => x.id === focus);
    if (!r) return;
    setTab(isUpcoming(r) ? 'upcoming' : r.statut === 'annulee' ? 'cancelled' : 'past');
    if (params.get('reporter') && r.can_reschedule) setResched(r);
    setTimeout(() => document.getElementById(`res-${r.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, focus]);

  const list = data || [];
  const groups: Record<string, Reservation[]> = {
    upcoming: list.filter(isUpcoming).sort((a, b) => String(a.start_at || a.date_reservation).localeCompare(String(b.start_at || b.date_reservation))),
    past: list.filter((r) => isPast(r) && r.statut !== 'annulee'),
    rescheduled: list.filter((r) => r.reschedule_count > 0),
    cancelled: list.filter((r) => r.statut === 'annulee')
  };

  return (
    <div>
      <PageHeader eyebrow="Mon espace" title="Mes réservations" actions={<Button to="/reservation" icon={<CalendarPlus className="h-4 w-4" />}>Réserver</Button>} />
      <div className="mb-6">
        <Tabs value={tab} onChange={setTab} tabs={[
          { id: 'upcoming', label: `À venir (${groups.upcoming.length})` },
          { id: 'past', label: `Effectuées (${groups.past.length})` },
          { id: 'rescheduled', label: `Reportées (${groups.rescheduled.length})` },
          { id: 'cancelled', label: `Annulées (${groups.cancelled.length})` }
        ]} />
      </div>
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && (groups[tab].length === 0 ? (
        <Empty title="Rien ici pour l’instant" text={tab === 'upcoming' ? 'Vos prochaines sessions apparaîtront ici.' : undefined} action={tab === 'upcoming' ? <Button to="/reservation">Réserver une session</Button> : undefined} />
      ) : (
        <div className="space-y-4">
          {groups[tab].map((r) => <ReservationCard key={r.id} r={r} highlight={r.id === focus} onReschedule={() => setResched(r)} onChanged={reload} />)}
        </div>
      ))}
      <RescheduleModal reservation={resched} onClose={() => { setResched(null); if (params.get('reporter')) setParams({}, { replace: true }); }}
        onDone={(u) => { setData((d) => (d || []).map((x) => (x.id === u.id ? u : x))); setResched(null); setParams({}, { replace: true }); }} />
    </div>
  );
};

// ------------------------------------------------------------------ Profil
export const ProfileForm: React.FC = () => {
  const { user, setUser, applySession, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [f, setF] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: phoneDisplay(user?.phone), email: user?.email || '', current_password: '' });
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const emailChanged = f.email.trim().toLowerCase() !== (user?.email || '');

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy('profile'); setError(null);
    try {
      const body: any = { first_name: f.first_name, last_name: f.last_name, phone: f.phone };
      if (emailChanged) { body.email = f.email; body.current_password = f.current_password; }
      setUser((await api<{ user: User }>('/auth/me', { method: 'PATCH', body })).user);
      toast('Profil mis à jour');
    } catch (err: any) { setError(err.message); } finally { setBusy(null); }
  };
  const changePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    if (pwd.next !== pwd.confirm) return setPwdError('Les mots de passe ne correspondent pas');
    setBusy('pwd');
    try {
      applySession(await api('/auth/change-password', { method: 'POST', body: { current_password: pwd.current, new_password: pwd.next } }));
      setPwd({ current: '', next: '', confirm: '' });
      toast('Mot de passe modifié. Vos autres sessions ont été déconnectées.');
    } catch (err: any) { setPwdError(err.message); } finally { setBusy(null); }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="card space-y-5 p-6 sm:p-8">
        <h2 className="text-lg font-semibold">Informations personnelles</h2>
        {error && <Alert>{error}</Alert>}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Prénom"><Input required value={f.first_name} onChange={(e) => setF({ ...f, first_name: e.target.value })} /></Field>
          <Field label="Nom"><Input value={f.last_name} onChange={(e) => setF({ ...f, last_name: e.target.value })} /></Field>
          <Field label="E-mail"><Input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
          <Field label="Téléphone WhatsApp"><Input type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        </div>
        {emailChanged && <Field label="Mot de passe actuel" hint="Requis pour changer d’adresse e-mail"><PasswordInput required value={f.current_password} onChange={(e) => setF({ ...f, current_password: e.target.value })} /></Field>}
        <Button type="submit" loading={busy === 'profile'}>Enregistrer</Button>
      </form>

      <form onSubmit={changePwd} className="card space-y-5 p-6 sm:p-8">
        <h2 className="text-lg font-semibold">{user?.has_password ? 'Changer de mot de passe' : 'Définir un mot de passe'}</h2>
        {!user?.has_password && <p className="text-sm text-bone-400">Vous vous connectez avec Google. Vous pouvez aussi définir un mot de passe.</p>}
        {pwdError && <Alert>{pwdError}</Alert>}
        <div className="grid gap-5 sm:grid-cols-3">
          {user?.has_password && <Field label="Actuel"><PasswordInput required value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} autoComplete="current-password" /></Field>}
          <Field label="Nouveau"><PasswordInput required value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} autoComplete="new-password" /></Field>
          <Field label="Confirmer"><PasswordInput required value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} autoComplete="new-password" /></Field>
        </div>
        <Button type="submit" variant="subtle" loading={busy === 'pwd'}>Mettre à jour</Button>
      </form>

      <div className="card space-y-3 p-6 sm:p-8">
        <h2 className="text-lg font-semibold">Notifications sur cet appareil</h2>
        <p className="text-sm text-bone-400">Recevez les notifications sur l’écran de votre téléphone, même application fermée.</p>
        <PushToggle app={user?.role === 'client' ? 'client' : 'admin'} />
      </div>

      <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="text-lg font-semibold">Sécurité</h2>
          <p className="text-sm text-bone-400">Déconnecter tous les appareils où votre compte est ouvert.</p>
        </div>
        <Button variant="danger" loading={busy === 'all'} onClick={async () => {
          setBusy('all');
          try { await api('/auth/logout-all', { method: 'POST' }); logout(); navigate('/connexion'); } catch (e: any) { toast(e.message, 'error'); setBusy(null); }
        }}>Déconnecter partout</Button>
      </div>
    </div>
  );
};

export const AccountProfile: React.FC = () => {
  useDocumentTitle('Mon profil');
  return (
    <div>
      <PageHeader eyebrow="Mon espace" title="Profil" />
      <ProfileForm />
    </div>
  );
};
