import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Banknote, CalendarCheck, CalendarDays, CalendarX, CheckCircle2, Clock, Disc3, Headphones, RotateCcw, Users, Wallet, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync, useDocumentTitle } from '../../lib/hooks';
import { fAgo, fDateShort, fRange, fcfa, phoneDisplay, startOfWeek, studioToday, addDaysStr, parseSql } from '../../lib/format';
import { PRESENCE, SESSION } from '../../lib/labels';
import type { Reservation } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Badge, Button, Confirm, Empty, ErrorState, PageHeader, Spinner, StatCard, StatusBadge, Tabs } from '../../components/ui';
import { BarChart, HBarList } from '../../components/charts';
import { WeekCalendar, reservationTone, type CalBlock } from '../../components/WeekCalendar';
import { ReservationDetail } from './Reservations';

interface Dashboard {
  reservations: { total: number; today: number; upcoming: number; completed: number; cancelled: number; rescheduled: number; toHandle: number };
  clients: number; activeServices: number; activeEngineers: number;
  todaySessions: any[];
  next7Days: { day: string; count: number; hours: number }[];
  finance?: { collected: number; collectedMonth: number; cashCollected: number; outstanding: number; pendingCash: { count: number; amount: number }; monthly: { month: string; amount: number; count: number }[]; byService: { service: string; count: number; amount: number }[] };
}

const compact = (n: number) => (n >= 1e6 ? `${(n / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} M` : n >= 1e3 ? `${Math.round(n / 1e3)} k` : String(n));

const lastMonths = (n: number) => {
  const out: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1));
    out.push(x.toISOString().slice(0, 7));
  }
  return out;
};

export const AdminDashboard: React.FC = () => {
  useDocumentTitle('Tableau de bord');
  const { user } = useAuth();
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, loading, error, reload } = useAsync(() => api<Dashboard>('/admin/dashboard'), []);
  const pending = useAsync(() => api<{ payments: any[] }>('/admin/payments?status=awaiting_validation').then((r) => r.payments), []);

  if (loading) return <Spinner />;
  if (error || !data) return <ErrorState message={error || 'Erreur'} onRetry={reload} />;
  const f = data.finance;
  const monthly = lastMonths(6).map((m) => {
    const row = f?.monthly.find((x) => x.month === m);
    const label = parseSql(`${m}-01`)!.toLocaleDateString('fr-FR', { month: 'short', timeZone: 'UTC' }).replace('.', '');
    return { label, value: row?.amount || 0, display: fcfa(row?.amount || 0), hint: `${row?.count || 0} paiement(s)` };
  });
  const week = Array.from({ length: 7 }, (_, i) => addDaysStr(studioToday(), i)).map((d) => {
    const row = data.next7Days.find((x) => x.day === d);
    return { label: i18nDay(d), value: row?.count || 0, display: `${row?.count || 0} session(s)`, hint: `${row?.hours || 0} h réservées` };
  });

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Administration" title={`Bonjour ${user?.first_name || ''}`} subtitle="Vue d’ensemble de l’activité du studio, en temps réel." actions={<Button to="/admin/reservations" variant="subtle">Toutes les réservations</Button>} />

      {(data.reservations.toHandle > 0 || (f?.pendingCash.count || 0) > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.reservations.toHandle > 0 && (
            <Link to="/admin/reservations?statut=a_traiter" className="flex items-center gap-3 rounded-2xl border border-crimson/30 bg-crimson/10 p-4 text-sm">
              <AlertTriangle className="h-5 w-5 text-[#F07A7A]" /><span className="flex-1">{data.reservations.toHandle} réservation(s) à traiter (paiement sur créneau déjà pris)</span><ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {f && f.pendingCash.count > 0 && (
            <a href="#especes" className="flex items-center gap-3 rounded-2xl border border-sky-400/30 bg-sky-400/10 p-4 text-sm">
              <Banknote className="h-5 w-5 text-sky-300" /><span className="flex-1">{f.pendingCash.count} paiement(s) en espèces à valider · {fcfa(f.pendingCash.amount)}</span><ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Aujourd’hui" value={data.reservations.today} icon={<CalendarCheck className="h-4 w-4" />} accent />
        <StatCard label="À venir" value={data.reservations.upcoming} icon={<Clock className="h-4 w-4" />} />
        <StatCard label="Terminées" value={data.reservations.completed} icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatCard label="Total réservations" value={data.reservations.total} icon={<CalendarDays className="h-4 w-4" />} />
        <StatCard label="Annulées" value={data.reservations.cancelled} icon={<CalendarX className="h-4 w-4" />} />
        <StatCard label="Reportées" value={data.reservations.rescheduled} icon={<RotateCcw className="h-4 w-4" />} />
        <StatCard label="Clients" value={data.clients} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Services · Ingénieurs" value={`${data.activeServices} · ${data.activeEngineers}`} hint="services actifs · ingénieurs actifs" icon={<span className="flex gap-1"><Disc3 className="h-4 w-4" /><Headphones className="h-4 w-4" /></span>} />
      </div>

      {f && (
        <div className="grid gap-4 lg:grid-cols-4">
          <StatCard label="Encaissé ce mois" value={<span className="text-2xl">{fcfa(f.collectedMonth)}</span>} icon={<Wallet className="h-4 w-4" />} accent />
          <StatCard label="Encaissé (total)" value={<span className="text-2xl">{fcfa(f.collected)}</span>} hint={`dont ${fcfa(f.cashCollected)} en espèces`} />
          <StatCard label="Reste à encaisser" value={<span className="text-2xl">{fcfa(f.outstanding)}</span>} hint="soldes des réservations actives" />
          <StatCard label="Espèces à valider" value={<span className="text-2xl">{fcfa(f.pendingCash.amount)}</span>} hint={`${f.pendingCash.count} demande(s)`} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="card p-5 sm:p-6 lg:col-span-3">
          <div className="mb-5 flex items-center justify-between"><h2 className="font-semibold">Sessions du jour</h2><Link to="/admin/calendrier" className="text-xs font-semibold text-ember">Calendrier</Link></div>
          {data.todaySessions.length === 0 ? <Empty title="Aucune session aujourd’hui" /> : (
            <ul className="divide-y divide-ink-700">
              {data.todaySessions.map((s) => (
                <li key={s.id}>
                  <button onClick={() => setOpenId(s.id)} className="flex w-full items-center gap-4 py-3 text-left">
                    <span className="w-24 shrink-0 font-display text-sm font-semibold tabular-nums">{fRange(s.start_at, s.end_at)}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{s.nom}</span><span className="block truncate text-xs text-bone-600">{s.service_name}{s.engineer_name ? ` · ${s.engineer_name}` : ' · aucun ingénieur'}</span></span>
                    <span className="hidden flex-col items-end gap-1 sm:flex"><StatusBadge map={SESSION} value={s.session_status} />{s.presence_status !== 'non_demandee' && <StatusBadge map={PRESENCE} value={s.presence_status} />}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card p-5 sm:p-6 lg:col-span-2">
          <h2 className="mb-5 font-semibold">Sessions des 7 prochains jours</h2>
          <BarChart data={week} title="Sessions des 7 prochains jours" height={190} />
        </section>
      </div>

      {f && (
        <div className="grid gap-6 lg:grid-cols-5">
          <section className="card p-5 sm:p-6 lg:col-span-3">
            <h2 className="mb-1 font-semibold">Encaissements mensuels</h2>
            <p className="mb-5 text-xs text-bone-600">Paiements confirmés (en ligne et espèces), 6 derniers mois</p>
            <BarChart data={monthly} title="Encaissements mensuels" height={220} formatTick={compact} />
          </section>
          <section className="card p-5 sm:p-6 lg:col-span-2">
            <h2 className="mb-5 font-semibold">Encaissé par service</h2>
            {f.byService.length ? <HBarList data={f.byService.map((s) => ({ label: s.service, value: s.amount, display: fcfa(s.amount), hint: `${s.count} réservation(s)` }))} /> : <Empty title="Aucun encaissement" />}
          </section>
        </div>
      )}

      <section id="especes" className="card scroll-mt-24 p-5 sm:p-6">
        <h2 className="mb-5 font-semibold">Paiements en espèces à valider</h2>
        <CashList items={pending.data || []} loading={pending.loading} onChanged={() => { pending.reload(); reload(); }} onOpen={setOpenId} />
      </section>
      <ReservationDetail id={openId} onClose={() => setOpenId(null)} onChanged={() => { reload(); pending.reload(); }} />
    </div>
  );
};

const i18nDay = (d: string) => parseSql(d)!.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', timeZone: 'UTC' }).replace('.', '');

const CashList: React.FC<{ items: any[]; loading: boolean; onChanged: () => void; onOpen: (id: string) => void }> = ({ items, loading, onChanged, onOpen }) => {
  const toast = useToast();
  const [target, setTarget] = useState<any | null>(null);
  if (loading) return <Spinner className="py-6" />;
  if (!items.length) return <Empty title="Aucune demande en attente" text="Les clients qui choisissent de payer en espèces apparaissent ici." />;
  return (
    <>
      <ul className="divide-y divide-ink-700">
        {items.map((p) => (
          <li key={p.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
            <button onClick={() => onOpen(p.reservation_id)} className="min-w-0 flex-1 text-left">
              <p className="font-semibold">{p.nom} · <span className="text-ember">{fcfa(p.amount)}</span></p>
              <p className="text-xs text-bone-600">{p.service_name}{p.start_at ? ` · ${fDateShort(p.start_at)} ${fRange(p.start_at, null).replace(' – ', '')}` : ''} · {phoneDisplay(p.telephone)} · demandé {fAgo(p.created_at)}</p>
            </button>
            <Button size="sm" icon={<Banknote className="h-4 w-4" />} onClick={() => setTarget(p)}>Confirmer la réception</Button>
          </li>
        ))}
      </ul>
      <Confirm open={!!target} onClose={() => setTarget(null)} title="Paiement en espèces reçu ?" confirmLabel="Oui, reçu"
        message={<>Confirmez avoir reçu <strong>{fcfa(target?.amount)}</strong> de {target?.nom}. La session passera à « Autorisée à commencer ».</>}
        onConfirm={async () => {
          try { await api(`/admin/reservations/${target.reservation_id}/validate-cash`, { method: 'POST' }); toast('Paiement validé : session autorisée à commencer'); setTarget(null); onChanged(); }
          catch (e: any) { toast(e.message, 'error'); }
        }} />
    </>
  );
};

// ------------------------------------------------------------------ Calendrier
export const AdminCalendar: React.FC = () => {
  useDocumentTitle('Calendrier');
  const [week, setWeek] = useState(startOfWeek(studioToday()));
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, loading, error, reload } = useAsync(
    () => api<{ reservations: Reservation[]; closures: any[]; unavailability: any[] }>(`/admin/calendar?from=${week}&to=${addDaysStr(week, 6)}`),
    [week]
  );
  const blocks: CalBlock[] = [
    ...(data?.closures || []).map((c) => ({ id: `c${c.id}`, start: c.start_at, end: c.end_at, title: c.reason || 'Fermeture', tone: 'closure' as const })),
    ...(data?.unavailability || []).map((u) => ({ id: `u${u.id}`, start: u.start_at, end: u.end_at, title: `${u.engineer_name} absent`, subtitle: u.reason, tone: 'absence' as const })),
    ...(data?.reservations || []).filter((r) => r.statut !== 'annulee').map((r) => ({
      id: r.id, start: r.start_at!, end: r.end_at!, title: r.nom, subtitle: `${r.service_name}${r.engineer_name ? ` · ${r.engineer_name}` : ''}`, tone: reservationTone(r), onClick: () => setOpenId(r.id)
    }))
  ];
  return (
    <div>
      <PageHeader title="Calendrier" subtitle="Sessions, fermetures et absences des ingénieurs" actions={<Button to="/admin/disponibilites" variant="subtle">Horaires & fermetures</Button>} />
      {error ? <ErrorState message={error} onRetry={reload} /> : <WeekCalendar weekStart={week} onWeekChange={(d) => setWeek(startOfWeek(d))} blocks={blocks} loading={loading} />}
      <ReservationDetail id={openId} onClose={() => setOpenId(null)} onChanged={reload} />
    </div>
  );
};

// ------------------------------------------------------------------ Paiements
export const AdminPayments: React.FC = () => {
  useDocumentTitle('Paiements');
  const [tab, setTab] = useState('awaiting_validation');
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, loading, error, reload } = useAsync(() => api<{ payments: any[] }>(`/admin/payments${tab === 'all' ? '' : `?status=${tab}`}`).then((r) => r.payments), [tab]);
  const STATUS: Record<string, { label: string; tone: any }> = {
    completed: { label: 'Encaissé', tone: 'green' }, awaiting_validation: { label: 'Espèces à valider', tone: 'blue' }, pending: { label: 'En cours', tone: 'amber' }, canceled: { label: 'Annulé', tone: 'neutral' }, failed: { label: 'Échec', tone: 'red' }
  };
  return (
    <div>
      <PageHeader title="Paiements" subtitle="Paiements en ligne PayTech et encaissements en espèces" />
      <div className="mb-5"><Tabs value={tab} onChange={setTab} tabs={[{ id: 'awaiting_validation', label: 'Espèces à valider' }, { id: 'completed', label: 'Encaissés' }, { id: 'pending', label: 'En cours' }, { id: 'all', label: 'Tous' }]} /></div>
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && tab === 'awaiting_validation' && <div className="card p-5"><CashList items={data} loading={false} onChanged={reload} onOpen={setOpenId} /></div>}
      {data && tab !== 'awaiting_validation' && (data.length === 0 ? <Empty title="Aucun paiement" /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-ink-600/70"><tr><th className="table-head">Date</th><th className="table-head">Client</th><th className="table-head">Type</th><th className="table-head">Moyen</th><th className="table-head">Statut</th><th className="table-head text-right">Montant</th></tr></thead>
            <tbody className="divide-y divide-ink-700">
              {data.map((p) => (
                <tr key={p.id} className="cursor-pointer hover:bg-ink-700/50" onClick={() => setOpenId(p.reservation_id)}>
                  <td className="table-cell whitespace-nowrap text-bone-400">{fDateShort(p.completed_at || p.created_at)}</td>
                  <td className="table-cell"><p className="font-semibold">{p.nom}</p><p className="text-xs text-bone-600">{p.service_name}</p></td>
                  <td className="table-cell">{p.kind === 'initial' ? 'Réservation' : 'Solde'}</td>
                  <td className="table-cell">{p.method === 'cash' ? 'Espèces' : p.provider_method || 'En ligne'}{p.validated_by_name?.trim() && <p className="text-xs text-bone-600">validé par {p.validated_by_name}</p>}</td>
                  <td className="table-cell"><Badge tone={STATUS[p.status]?.tone}>{STATUS[p.status]?.label || p.status}</Badge></td>
                  <td className="table-cell text-right font-semibold tabular-nums">{fcfa(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <ReservationDetail id={openId} onClose={() => setOpenId(null)} onChanged={reload} />
    </div>
  );
};
