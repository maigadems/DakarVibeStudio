// Espace ingénieur : aucune donnée financière n'est demandée ni affichée (l'API ne les renvoie pas).
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays, CheckCheck, Clock, Lock, Mail, Phone, Play, Plus, RotateCcw, Save, Trash2, UserX, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync, useDocumentTitle } from '../../lib/hooks';
import { addDaysStr, cx, fAgo, fDate, fDateShort, fDateTime, fRange, phoneDisplay, startOfWeek, studioNow, studioToday } from '../../lib/format';
import { HISTORY, PRESENCE, SESSION } from '../../lib/labels';
import type { HistoryEntry, Reservation } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Alert, Badge, Button, Empty, ErrorState, Field, Input, Modal, PageHeader, Spinner, StatCard, StatusBadge, Tabs, Textarea } from '../../components/ui';
import { WeekCalendar, reservationTone, type CalBlock } from '../../components/WeekCalendar';
import { ProfileForm } from '../account/Account';

const SessionDetail: React.FC<{ id: string | null; onClose: () => void; onChanged: () => void }> = ({ id, onClose, onChanged }) => {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => (id ? api<{ session: Reservation; history: HistoryEntry[] }>(`/engineer/sessions/${id}`) : Promise.resolve(null)), [id]);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const s = data?.session;
  useEffect(() => { setNotes(s?.internal_notes || ''); }, [s]);

  const setStatus = async (status: string) => {
    setBusy(status);
    try { await api(`/engineer/sessions/${s!.id}/status`, { method: 'POST', body: { status } }); toast('Statut mis à jour'); reload(); onChanged(); }
    catch (e: any) { toast(e.message, 'error'); } finally { setBusy(null); }
  };
  const started = s?.start_at ? s.start_at <= studioNow() : false;

  return (
    <Modal open={!!id} onClose={onClose} size="lg" title={s ? `${s.nom} · ${s.service_name}` : 'Session'}>
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {s && (
        <div className="space-y-6">
          <div className={cx('flex items-center gap-3 rounded-2xl border p-4', s.autorisee_a_commencer ? 'border-sage/40 bg-sage/10' : 'border-amberish/30 bg-amberish/10')}>
            {s.autorisee_a_commencer ? <ShieldCheck className="h-6 w-6 text-sage" /> : <Lock className="h-6 w-6 text-amberish" />}
            <div>
              <p className="font-semibold">{s.autorisee_a_commencer ? 'Autorisée à commencer' : 'Pas encore autorisée'}</p>
              <p className="text-xs text-bone-400">{s.autorisee_a_commencer ? 'Le règlement a été confirmé par le studio.' : 'La session pourra démarrer dès que le studio aura confirmé le règlement.'}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-ink-600 bg-ink-900 p-4">
              <p className="text-xs uppercase tracking-wider text-bone-600">Horaire</p>
              <p className="mt-1 font-semibold">{s.start_at ? fDate(s.start_at) : '—'}</p>
              <p className="text-sm text-bone-400">{fRange(s.start_at, s.end_at)} · {s.duree_heures} h</p>
            </div>
            <div className="rounded-2xl border border-ink-600 bg-ink-900 p-4">
              <p className="text-xs uppercase tracking-wider text-bone-600">Client</p>
              <p className="mt-1 font-semibold">{s.nom}</p>
              <a href={`tel:+${s.telephone}`} className="flex items-center gap-1.5 text-sm text-bone-400 hover:text-bone"><Phone className="h-3.5 w-3.5" />{phoneDisplay(s.telephone)}</a>
              {s.email && <a href={`mailto:${s.email}`} className="flex items-center gap-1.5 truncate text-sm text-bone-400 hover:text-bone"><Mail className="h-3.5 w-3.5" />{s.email}</a>}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <StatusBadge map={SESSION} value={s.session_status} />
            {s.presence_status !== 'non_demandee' && <StatusBadge map={PRESENCE} value={s.presence_status} />}
            {s.reschedule_count > 0 && <Badge tone="blue"><RotateCcw className="h-3 w-3" />Reportée ×{s.reschedule_count}</Badge>}
          </div>
          {s.message && <div className="rounded-2xl border border-ink-600 bg-ink-900 p-4 text-sm"><p className="text-xs uppercase tracking-wider text-bone-600">Remarques du client</p><p className="mt-1 whitespace-pre-wrap">{s.message}</p></div>}

          {s.statut === 'confirmee' && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" icon={<Play className="h-4 w-4" />} disabled={!s.autorisee_a_commencer || s.session_status !== 'autorisee'} loading={busy === 'en_cours'} onClick={() => setStatus('en_cours')}>Démarrer la session</Button>
              <Button size="sm" variant="subtle" icon={<CheckCheck className="h-4 w-4" />} disabled={!['en_cours', 'autorisee'].includes(s.session_status)} loading={busy === 'terminee'} onClick={() => setStatus('terminee')}>Terminer</Button>
              <Button size="sm" variant="ghost" icon={<UserX className="h-4 w-4" />} disabled={!started || s.session_status === 'en_cours'} loading={busy === 'absent'} onClick={() => setStatus('absent')}>Client absent</Button>
            </div>
          )}

          <div>
            <Field label="Notes de session (partagées avec le studio)"><Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Micro utilisé, réglages, fichiers à envoyer…" /></Field>
            <Button size="sm" variant="subtle" className="mt-2" icon={<Save className="h-4 w-4" />} loading={busy === 'notes'} onClick={async () => {
              setBusy('notes');
              try { await api(`/engineer/sessions/${s.id}/notes`, { method: 'PATCH', body: { internal_notes: notes } }); toast('Notes enregistrées'); } catch (e: any) { toast(e.message, 'error'); } finally { setBusy(null); }
            }}>Enregistrer les notes</Button>
          </div>

          <div>
            <p className="label">Modifications et reports</p>
            <ol className="space-y-2 text-sm">
              {data!.history.map((h) => (
                <li key={h.id} className="flex flex-wrap justify-between gap-2 border-b border-ink-700 pb-2">
                  <span>{HISTORY[h.action] || h.action}{h.details?.from && h.details?.to ? ` : ${fDateTime(h.details.from)} → ${fDateTime(h.details.to)}` : ''}{h.details?.engineer ? ` · ${h.details.engineer}` : ''}</span>
                  <span className="text-xs text-bone-600">{fAgo(h.created_at)}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </Modal>
  );
};

const SessionRow: React.FC<{ s: Reservation; onOpen: () => void }> = ({ s, onOpen }) => (
  <button onClick={onOpen} className="flex w-full items-center gap-4 border-b border-ink-700 py-4 text-left last:border-0">
    <div className="flex w-16 shrink-0 flex-col items-center rounded-2xl border border-ink-600 bg-ink-900 py-2">
      <span className="text-[10px] uppercase text-bone-600">{fDateShort(s.start_at).split(' ')[0]}</span>
      <span className="font-display text-xl font-semibold">{Number(String(s.start_at).slice(8, 10))}</span>
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate font-semibold">{s.nom}</p>
      <p className="text-sm text-bone-400">{s.service_name} · {fRange(s.start_at, s.end_at)} ({s.duree_heures} h)</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {s.autorisee_a_commencer ? <Badge tone="green">Autorisée à commencer</Badge> : <Badge>En attente d’autorisation</Badge>}
        {s.presence_status === 'confirmee' && <Badge tone="green">Présence confirmée</Badge>}
        {s.presence_status === 'report_souhaite' && <Badge tone="red">Souhaite reporter</Badge>}
        {s.reschedule_count > 0 && <Badge tone="blue">Reportée</Badge>}
      </div>
    </div>
  </button>
);

export const EngineerHome: React.FC = () => {
  useDocumentTitle('Mes sessions');
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState('upcoming');
  const overview = useAsync(() => api<{ today: Reservation[]; upcoming: Reservation[]; counts: Record<string, number> }>('/engineer/overview'), []);
  const past = useAsync(() => (tab === 'past' ? api<{ sessions: Reservation[] }>(`/engineer/sessions?to=${studioToday()}&order=desc`).then((r) => r.sessions.filter((s) => s.end_at && s.end_at < studioNow() || s.statut === 'terminee')) : Promise.resolve(null)), [tab]);
  const openId = params.get('session');
  const setOpen = (id: string | null) => setParams(id ? { session: id } : {}, { replace: true });

  if (overview.loading) return <Spinner />;
  if (overview.error || !overview.data) return <ErrorState message={overview.error || 'Erreur'} onRetry={overview.reload} />;
  const o = overview.data;

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Espace ingénieur" title={`Bonjour ${user?.first_name || ''}`} subtitle="Vos sessions attribuées, leurs horaires et leur statut." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Aujourd’hui" value={o.counts.today} icon={<Clock className="h-4 w-4" />} accent />
        <StatCard label="À venir" value={o.counts.upcoming} icon={<CalendarDays className="h-4 w-4" />} />
        <StatCard label="Terminées" value={o.counts.completed} icon={<CheckCheck className="h-4 w-4" />} />
        <StatCard label="Reportées" value={o.counts.rescheduled} icon={<RotateCcw className="h-4 w-4" />} />
      </div>
      <section className="card p-5 sm:p-6">
        <h2 className="mb-2 font-semibold">Aujourd’hui</h2>
        {o.today.length === 0 ? <p className="py-6 text-sm text-bone-600">Aucune session aujourd’hui.</p> : o.today.map((s) => <SessionRow key={s.id} s={s} onOpen={() => setOpen(s.id)} />)}
      </section>
      <section className="card p-5 sm:p-6">
        <div className="mb-3"><Tabs value={tab} onChange={setTab} tabs={[{ id: 'upcoming', label: 'À venir' }, { id: 'past', label: 'Terminées' }]} /></div>
        {tab === 'upcoming' && (o.upcoming.length === 0 ? <Empty title="Aucune session à venir" text="Les sessions que le studio vous attribue apparaîtront ici." /> : o.upcoming.map((s) => <SessionRow key={s.id} s={s} onOpen={() => setOpen(s.id)} />))}
        {tab === 'past' && (past.loading ? <Spinner /> : !past.data?.length ? <Empty title="Aucune session passée" /> : past.data.map((s) => <SessionRow key={s.id} s={s} onOpen={() => setOpen(s.id)} />))}
      </section>
      <SessionDetail id={openId} onClose={() => setOpen(null)} onChanged={overview.reload} />
    </div>
  );
};

export const EngineerCalendar: React.FC = () => {
  useDocumentTitle('Mon calendrier');
  const [week, setWeek] = useState(startOfWeek(studioToday()));
  const [openId, setOpenId] = useState<string | null>(null);
  const sessions = useAsync(() => api<{ sessions: Reservation[] }>(`/engineer/sessions?from=${week}&to=${addDaysStr(week, 6)}`).then((r) => r.sessions), [week]);
  const absences = useAsync(() => api<{ unavailability: any[] }>('/engineer/unavailability').then((r) => r.unavailability), []);
  const blocks: CalBlock[] = [
    ...(absences.data || []).map((u) => ({ id: `u${u.id}`, start: u.start_at, end: u.end_at, title: 'Absence', subtitle: u.reason, tone: 'absence' as const })),
    ...(sessions.data || []).filter((s) => s.start_at && s.statut !== 'annulee').map((s) => ({ id: s.id, start: s.start_at!, end: s.end_at!, title: s.nom, subtitle: s.service_name, tone: reservationTone(s), onClick: () => setOpenId(s.id) }))
  ];
  return (
    <div>
      <PageHeader title="Mon calendrier" />
      {sessions.error ? <ErrorState message={sessions.error} onRetry={sessions.reload} /> : <WeekCalendar weekStart={week} onWeekChange={(d) => setWeek(startOfWeek(d))} blocks={blocks} loading={sessions.loading} />}
      <SessionDetail id={openId} onClose={() => setOpenId(null)} onChanged={sessions.reload} />
    </div>
  );
};

export const EngineerAbsences: React.FC = () => {
  useDocumentTitle('Mes absences');
  const toast = useToast();
  const { data, loading, reload } = useAsync(() => api<{ unavailability: any[] }>('/engineer/unavailability').then((r) => r.unavailability), []);
  const [f, setF] = useState({ start_at: `${studioToday()}T08:00`, end_at: `${studioToday()}T23:00`, reason: '' });
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <PageHeader title="Mes absences" subtitle="Signalez vos indisponibilités : le studio en tient compte pour vous attribuer des sessions." />
      <div className="card space-y-4 p-5 sm:p-6">
        {error && <Alert>{error}</Alert>}
        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="Début"><Input type="datetime-local" value={f.start_at} onChange={(e) => setF({ ...f, start_at: e.target.value })} /></Field>
          <Field label="Fin"><Input type="datetime-local" value={f.end_at} onChange={(e) => setF({ ...f, end_at: e.target.value })} /></Field>
          <Field label="Motif (facultatif)"><Input value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></Field>
          <div className="flex items-end"><Button className="w-full" icon={<Plus className="h-4 w-4" />} onClick={async () => {
            setError(null);
            try { await api('/engineer/unavailability', { method: 'POST', body: f }); toast('Absence enregistrée'); reload(); } catch (e: any) { setError(e.message); }
          }}>Ajouter</Button></div>
        </div>
        {loading ? <Spinner /> : (
          <ul className="divide-y divide-ink-700 rounded-2xl border border-ink-600">
            {(data || []).map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span>{fDateTime(u.start_at)} → {fDateTime(u.end_at)}{u.reason ? ` · ${u.reason}` : ''}</span>
                <button onClick={async () => { await api(`/engineer/unavailability/${u.id}`, { method: 'DELETE' }); reload(); }} className="text-bone-600 hover:text-[#F07A7A]" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
            {data && !data.length && <li className="px-4 py-6 text-center text-sm text-bone-600">Aucune absence prévue</li>}
          </ul>
        )}
      </div>
    </div>
  );
};

export const EngineerProfile: React.FC = () => {
  useDocumentTitle('Mon profil');
  return <div><PageHeader title="Mon profil" /><ProfileForm /></div>;
};
