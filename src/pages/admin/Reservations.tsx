import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Banknote, CalendarClock, Plus, Search, UserCheck, XCircle, Play, CheckCheck, History, MessageCircle, Phone, Mail, Save, Filter, FileText } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync, useDebounced, useDocumentTitle } from '../../lib/hooks';
import { cx, fAgo, fDate, fDateShort, fRange, fcfa, phoneDisplay, studioToday } from '../../lib/format';
import { HISTORY, PAYMENT, PRESENCE, SESSION, STATUT } from '../../lib/labels';
import type { HistoryEntry, Reservation, Service, Slot, User } from '../../lib/types';
import { useToast } from '../../context/ToastContext';
import { Alert, Badge, Button, Confirm, Empty, ErrorState, Field, Input, Modal, PageHeader, Select, Spinner, StatusBadge, Tabs, Textarea } from '../../components/ui';
import { SlotPicker } from '../../components/SlotPicker';
import { DownloadInvoiceButton } from '../../components/InvoiceDocument';

export const useEngineers = () => useAsync(() => api<{ users: User[] }>('/admin/users?role=engineer').then((r) => r.users.filter((u) => u.is_active)), []);

// ------------------------------------------------------------------ Fiche réservation
export const ReservationDetail: React.FC<{ id: string | null; onClose: () => void; onChanged?: () => void }> = ({ id, onClose, onChanged }) => {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(
    () => (id ? api<{ reservation: Reservation; history: HistoryEntry[]; payments: any[]; messages: any[]; invoice: { id: number; number: string } | null }>(`/admin/reservations/${id}`) : Promise.resolve(null)),
    [id]
  );
  const engineers = useEngineers();
  const [tab, setTab] = useState('details');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [cashOpen, setCashOpen] = useState(false);
  const [resched, setResched] = useState(false);
  const [newStart, setNewStart] = useState<string | null>(null);
  const [edit, setEdit] = useState<{ internal_notes: string; montant_total: string; nom: string; telephone: string; email: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const r = data?.reservation;

  useEffect(() => {
    setTab('details'); setResched(false); setNewStart(null);
  }, [id]);
  useEffect(() => {
    if (r) setEdit({ internal_notes: r.internal_notes || '', montant_total: String(r.montant_total ?? ''), nom: r.nom, telephone: phoneDisplay(r.telephone), email: r.email });
  }, [r]);

  const run = async (key: string, fn: () => Promise<any>, ok: string) => {
    setBusy(key);
    try { await fn(); toast(ok); await reload(); onChanged?.(); return true; }
    catch (e: any) { toast(e.message, 'error'); return false; }
    finally { setBusy(null); }
  };

  const loadDays = useMemo(() => async () => {
    // 45 jours à partir d'aujourd'hui, calculés via les créneaux admin (hors délai et fenêtre client)
    const out = [];
    for (let i = 0; i < 45; i++) {
      const d = new Date(Date.now() + i * 86400000).toISOString().slice(0, 10);
      out.push({ date: d, open: true, available: 1 });
    }
    return out;
  }, []);
  const loadSlots = useMemo(() => (d: string) => api<{ slots: Slot[] }>(`/admin/reservations/${id}/availability?date=${d}`).then((x) => x.slots), [id]);

  const active = r && ['confirmee', 'a_traiter', 'en_attente'].includes(r.statut);

  return (
    <Modal open={!!id} onClose={onClose} size="lg" title={r ? <span className="flex flex-wrap items-center gap-2">{r.nom}<span className="text-sm font-normal text-bone-600">#{r.id.slice(0, 8)}</span></span> : 'Réservation'}>
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {r && edit && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-1.5">
            <StatusBadge map={STATUT} value={r.statut} />
            <StatusBadge map={PAYMENT} value={r.payment_status} />
            {r.booking_mode === 'slot' && <StatusBadge map={SESSION} value={r.session_status} />}
            {r.booking_mode === 'slot' && r.presence_status !== 'non_demandee' && <StatusBadge map={PRESENCE} value={r.presence_status} />}
            {r.reschedule_count > 0 && <Badge tone="blue">Reportée ×{r.reschedule_count}</Badge>}
          </div>

          {r.statut === 'a_traiter' && <Alert tone="warning">Paiement reçu alors que le créneau avait été repris : proposez un autre créneau (bouton « Reporter ») puis confirmez, ou procédez à un remboursement.</Alert>}
          {r.payment_status === 'en_attente_validation' && (
            <div className="flex flex-col gap-3 rounded-2xl border border-sky-400/30 bg-sky-400/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-bone-200"><Banknote className="mr-2 inline h-4 w-4 text-sky-300" />Le client souhaite payer <strong>{fcfa(r.solde)}</strong> en espèces.</p>
              <Button size="sm" onClick={() => setCashOpen(true)}>Confirmer la réception</Button>
            </div>
          )}

          {data!.invoice ? (
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-ink-600 bg-ink-900 px-4 py-3">
              <FileText className="h-4 w-4 text-ember" />
              <Link to={`/admin/factures/${data!.invoice.id}`} className="flex-1 text-sm font-semibold hover:text-ember">Facture {data!.invoice.number}</Link>
              <DownloadInvoiceButton scope="admin" id={data!.invoice.id} number={data!.invoice.number} variant="subtle" />
            </div>
          ) : (r.montant_paye || 0) > 0 ? (
            <Button size="sm" variant="subtle" icon={<FileText className="h-4 w-4" />} loading={busy === 'invoice'} onClick={() => run('invoice', () => api(`/admin/reservations/${r.id}/invoice`, { method: 'POST' }), 'Facture émise')}>Émettre la facture</Button>
          ) : null}

          <Tabs value={tab} onChange={setTab} tabs={[{ id: 'details', label: 'Détails' }, { id: 'edit', label: 'Modifier' }, { id: 'history', label: `Historique (${data!.history.length})` }, { id: 'payments', label: 'Paiements' }, { id: 'messages', label: 'WhatsApp' }]} />

          {tab === 'details' && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-ink-600 bg-ink-900 p-4">
                  <p className="text-xs uppercase tracking-wider text-bone-600">Session</p>
                  <p className="mt-1 font-semibold">{r.service_name}</p>
                  <p className="text-sm text-bone-400">{r.start_at ? `${fDate(r.start_at)} · ${fRange(r.start_at, r.end_at)} (${r.duree_heures} h)` : `${r.nombre_titres || 1} titre(s)`}</p>
                </div>
                <div className="rounded-2xl border border-ink-600 bg-ink-900 p-4">
                  <p className="text-xs uppercase tracking-wider text-bone-600">Client</p>
                  <p className="mt-1 font-semibold">{r.nom}</p>
                  <p className="flex items-center gap-1.5 text-sm text-bone-400"><Phone className="h-3.5 w-3.5" /><a href={`tel:+${r.telephone}`}>{phoneDisplay(r.telephone)}</a></p>
                  {r.email && <p className="flex items-center gap-1.5 truncate text-sm text-bone-400"><Mail className="h-3.5 w-3.5" />{r.email}</p>}
                </div>
                <div className="rounded-2xl border border-ink-600 bg-ink-900 p-4">
                  <p className="text-xs uppercase tracking-wider text-bone-600">Paiement</p>
                  <p className="mt-1 font-semibold">{fcfa(r.montant_paye)} / {fcfa(r.montant_total)}</p>
                  <p className="text-sm text-bone-400">{r.solde ? `Reste ${fcfa(r.solde)}` : 'Soldé'} · {r.type_paiement === 'partiel' ? 'acompte' : 'total'}</p>
                </div>
                <div className="rounded-2xl border border-ink-600 bg-ink-900 p-4">
                  <p className="text-xs uppercase tracking-wider text-bone-600">Ingénieur du son</p>
                  <Select className="mt-2 py-2" value={r.engineer_id || ''} disabled={!active || busy === 'assign'}
                    onChange={(e) => run('assign', () => api(`/admin/reservations/${r.id}/assign`, { method: 'POST', body: { engineer_id: e.target.value || null } }), e.target.value ? 'Ingénieur affecté et notifié' : 'Ingénieur retiré')}>
                    <option value="">— Non affecté —</option>
                    {(engineers.data || []).map((u) => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
                  </Select>
                </div>
              </div>
              {r.message && <div className="rounded-2xl border border-ink-600 bg-ink-900 p-4 text-sm"><p className="text-xs uppercase tracking-wider text-bone-600">Remarques du client</p><p className="mt-1 whitespace-pre-wrap text-bone-200">{r.message}</p></div>}

              {active && (
                <div className="flex flex-wrap gap-2 border-t border-ink-600/70 pt-5">
                  {r.booking_mode === 'slot' && <Button size="sm" variant="outline" icon={<CalendarClock className="h-4 w-4" />} onClick={() => setResched(!resched)}>Reporter</Button>}
                  {r.statut === 'a_traiter' && <Button size="sm" loading={busy === 'confirm'} onClick={() => run('confirm', () => api(`/admin/reservations/${r.id}`, { method: 'PATCH', body: { statut: 'confirmee' } }), 'Réservation confirmée')}>Confirmer</Button>}
                  {r.statut === 'confirmee' && r.payment_status !== 'paye' && r.payment_status !== 'en_attente_validation' && <Button size="sm" variant="subtle" icon={<Banknote className="h-4 w-4" />} onClick={() => setCashOpen(true)}>Encaisser en espèces</Button>}
                  {r.statut === 'confirmee' && r.session_status === 'autorisee' && <Button size="sm" variant="subtle" icon={<Play className="h-4 w-4" />} loading={busy === 'start'} onClick={() => run('start', () => api(`/admin/reservations/${r.id}/session-status`, { method: 'POST', body: { status: 'en_cours' } }), 'Session démarrée')}>Démarrer</Button>}
                  {r.statut === 'confirmee' && ['en_cours', 'autorisee'].includes(r.session_status) && <Button size="sm" variant="subtle" icon={<CheckCheck className="h-4 w-4" />} loading={busy === 'done'} onClick={() => run('done', () => api(`/admin/reservations/${r.id}/session-status`, { method: 'POST', body: { status: 'terminee' } }), 'Session terminée')}>Terminer</Button>}
                  <Button size="sm" variant="danger" icon={<XCircle className="h-4 w-4" />} onClick={() => setCancelOpen(true)}>Annuler</Button>
                </div>
              )}
              {resched && (
                <div className="rounded-2xl border border-ember/30 p-4">
                  <p className="mb-3 text-sm font-semibold">Nouveau créneau ({r.duree_heures} h) — le client, Jeuss et l’ingénieur sont notifiés</p>
                  <SlotPicker loadDays={loadDays} loadSlots={loadSlots} value={newStart} currentStart={r.start_at} onChange={(s) => setNewStart(s)} reloadKey={r.id} />
                  <div className="mt-4 flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setResched(false)}>Fermer</Button>
                    <Button size="sm" disabled={!newStart} loading={busy === 'resched'} onClick={async () => { if (await run('resched', () => api(`/admin/reservations/${r.id}/reschedule`, { method: 'POST', body: { start: newStart } }), 'Session reportée')) setResched(false); }}>Valider le report</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'edit' && (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); run('save', () => api(`/admin/reservations/${r.id}`, { method: 'PATCH', body: { ...edit, montant_total: Number(edit.montant_total) } }), 'Réservation modifiée'); }}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom du client"><Input value={edit.nom} onChange={(e) => setEdit({ ...edit, nom: e.target.value })} /></Field>
                <Field label="Téléphone"><Input value={edit.telephone} onChange={(e) => setEdit({ ...edit, telephone: e.target.value })} /></Field>
                <Field label="E-mail"><Input value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></Field>
                <Field label="Montant total (FCFA)"><Input type="number" min={0} value={edit.montant_total} onChange={(e) => setEdit({ ...edit, montant_total: e.target.value })} /></Field>
              </div>
              <Field label="Notes internes (visibles par l’ingénieur affecté)"><Textarea rows={4} value={edit.internal_notes} onChange={(e) => setEdit({ ...edit, internal_notes: e.target.value })} /></Field>
              <Button type="submit" loading={busy === 'save'} icon={<Save className="h-4 w-4" />}>Enregistrer</Button>
            </form>
          )}

          {tab === 'history' && (
            <ol className="relative space-y-4 border-l border-ink-600 pl-5">
              {data!.history.map((h) => (
                <li key={h.id} className="relative">
                  <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full bg-ember ring-4 ring-ink-800" />
                  <p className="text-sm font-semibold">{HISTORY[h.action] || h.action}</p>
                  <p className="text-xs text-bone-600">{fAgo(h.created_at)} · {h.actor_name || (h.actor_role === 'system' ? 'Système' : h.actor_role)}</p>
                  {h.details && Object.keys(h.details).length > 0 && (
                    <p className="mt-1 text-xs text-bone-400">
                      {h.details.from && <>De {fDateShort(h.details.from)} {fRange(h.details.from, null).replace(' – ', '')} </>}
                      {h.details.to && <>→ {fDateShort(h.details.to)} {fRange(h.details.to, null).replace(' – ', '')} </>}
                      {h.details.amount !== undefined && <>{fcfa(h.details.amount)} </>}
                      {h.details.engineer && <>{h.details.engineer} </>}
                      {h.details.reason && <>« {h.details.reason} » </>}
                      {h.details.status && SESSION[h.details.status as keyof typeof SESSION] && <>{SESSION[h.details.status as keyof typeof SESSION].label}</>}
                    </p>
                  )}
                </li>
              ))}
              {!data!.history.length && <li className="text-sm text-bone-600"><History className="mr-1 inline h-4 w-4" />Aucun historique</li>}
            </ol>
          )}

          {tab === 'payments' && (
            data!.payments.length ? (
              <div className="divide-y divide-ink-600/70 rounded-2xl border border-ink-600">
                {data!.payments.map((p) => (
                  <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                    <div>
                      <p className="font-semibold">{fcfa(p.amount)} · {p.kind === 'initial' ? 'À la réservation' : 'Solde'} · {p.method === 'cash' ? 'Espèces' : p.provider_method || 'En ligne'}</p>
                      <p className="text-xs text-bone-600">{p.ref_command} · {fAgo(p.created_at)}{p.validated_by_name?.trim() ? ` · validé par ${p.validated_by_name}` : ''}</p>
                    </div>
                    <Badge tone={p.status === 'completed' ? 'green' : p.status === 'awaiting_validation' ? 'blue' : p.status === 'pending' ? 'amber' : 'neutral'}>
                      {{ completed: 'Encaissé', awaiting_validation: 'À valider', pending: 'En cours', canceled: 'Annulé', failed: 'Échec' }[p.status as string] || p.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : <Empty title="Aucun paiement" />
          )}

          {tab === 'messages' && (
            data!.messages.length ? (
              <div className="divide-y divide-ink-600/70 rounded-2xl border border-ink-600">
                {data!.messages.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-2 px-4 py-3 text-sm">
                    <div className="min-w-0"><p className="truncate font-semibold"><MessageCircle className="mr-1.5 inline h-3.5 w-3.5 text-ember" />{m.kind}</p><p className="truncate text-xs text-bone-600">{phoneDisplay(m.to_phone)} · {fAgo(m.created_at)}{m.error ? ` · ${m.error}` : ''}</p></div>
                    <Badge tone={['sent', 'delivered', 'read'].includes(m.status) ? 'green' : m.status === 'failed' || m.status === 'not_configured' ? 'red' : 'neutral'}>{m.status}</Badge>
                  </div>
                ))}
              </div>
            ) : <Empty title="Aucun message WhatsApp" />
          )}
        </div>
      )}

      <Confirm open={cancelOpen} onClose={() => setCancelOpen(false)} danger title="Annuler la réservation" confirmLabel="Annuler la réservation"
        message="Le créneau sera libéré. Le client, Jeuss et l’ingénieur affecté seront notifiés."
        onConfirm={async () => { if (await run('cancel', () => api(`/admin/reservations/${r!.id}/cancel`, { method: 'POST', body: { reason } }), 'Réservation annulée')) setCancelOpen(false); }}>
        <Field label="Motif (envoyé au client)" className="mt-4"><Input value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
      </Confirm>
      <Confirm open={cashOpen} onClose={() => setCashOpen(false)} title="Paiement en espèces reçu ?" confirmLabel="Oui, j’ai reçu le paiement"
        message={<>Confirmez avoir reçu <strong>{fcfa(r?.solde)}</strong> en espèces. Le paiement passera à « Payé » et la session à « Autorisée à commencer ».</>}
        onConfirm={async () => { if (await run('cash', () => api(`/admin/reservations/${r!.id}/validate-cash`, { method: 'POST' }), 'Paiement validé : session autorisée à commencer')) setCashOpen(false); }} />
    </Modal>
  );
};

// ------------------------------------------------------------------ Création manuelle
const NewReservation: React.FC<{ open: boolean; onClose: () => void; onCreated: (r: Reservation) => void }> = ({ open, onClose, onCreated }) => {
  const toast = useToast();
  const services = useAsync(() => api<{ services: Service[] }>('/admin/services').then((r) => r.services.filter((s) => s.booking_mode !== 'quote')), []);
  const engineers = useEngineers();
  const [f, setF] = useState({ service_id: '', hours: '1', tracks: '1', nom: '', telephone: '', email: '', message: '', engineer_id: '', montant_total: '' });
  const [date, setDate] = useState(studioToday());
  const [start, setStart] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const service = services.data?.find((s) => String(s.id) === f.service_id);

  useEffect(() => {
    if (!service || service.booking_mode !== 'slot' || !date) return setSlots(null);
    setSlots(null); setStart(null);
    api<{ slots: Slot[] }>(`/admin/availability?date=${date}&hours=${f.hours}`).then((r) => setSlots(r.slots)).catch((e) => setError(e.message));
  }, [service, date, f.hours]);

  const submit = async () => {
    setBusy(true); setError(null);
    try {
      const r = await api<{ reservation: Reservation }>('/admin/reservations', { method: 'POST', body: { ...f, start, montant_total: f.montant_total === '' ? undefined : Number(f.montant_total) } });
      toast('Réservation créée'); onCreated(r.reservation);
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };
  const estimated = service?.price ? service.price * Number(service.booking_mode === 'slot' ? f.hours : f.tracks) : 0;

  return (
    <Modal open={open} onClose={onClose} size="lg" title="Nouvelle réservation (téléphone / sur place)"
      footer={<><Button variant="ghost" onClick={onClose}>Annuler</Button><Button loading={busy} disabled={!service || !f.nom || !f.telephone || (service.booking_mode === 'slot' && !start)} onClick={submit}>Créer la réservation</Button></>}>
      <div className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Service"><Select value={f.service_id} onChange={(e) => setF({ ...f, service_id: e.target.value })}><option value="">Choisir…</option>{(services.data || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
          {service?.booking_mode === 'per_track' ? (
            <Field label="Nombre de titres"><Input type="number" min={1} value={f.tracks} onChange={(e) => setF({ ...f, tracks: e.target.value })} /></Field>
          ) : (
            <Field label="Durée (heures)"><Input type="number" min={1} max={16} value={f.hours} onChange={(e) => setF({ ...f, hours: e.target.value })} /></Field>
          )}
          <Field label="Nom du client"><Input value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} /></Field>
          <Field label="Téléphone WhatsApp"><Input value={f.telephone} onChange={(e) => setF({ ...f, telephone: e.target.value })} /></Field>
          <Field label="E-mail (facultatif)" hint="Rattache la réservation au compte client s’il existe"><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
          <Field label="Montant total (FCFA)" hint={estimated ? `Tarif standard : ${fcfa(estimated)}` : undefined}><Input type="number" min={0} placeholder={String(estimated || '')} value={f.montant_total} onChange={(e) => setF({ ...f, montant_total: e.target.value })} /></Field>
          <Field label="Ingénieur (facultatif)"><Select value={f.engineer_id} onChange={(e) => setF({ ...f, engineer_id: e.target.value })}><option value="">—</option>{(engineers.data || []).map((u) => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}</Select></Field>
        </div>
        {service?.booking_mode === 'slot' && (
          <div>
            <Field label="Date"><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {slots === null ? <Spinner className="col-span-full py-4" /> : slots.length === 0 ? <p className="col-span-full text-sm text-bone-400">Studio fermé ce jour-là.</p> : slots.map((s) => (
                <button key={s.start} type="button" disabled={!s.available} onClick={() => setStart(s.start)}
                  className={cx('h-10 rounded-lg border text-xs font-semibold', start === s.start ? 'border-ember bg-ember/15' : s.available ? 'border-ink-600 hover:border-ember/60' : 'border-ink-700 text-bone-600 line-through')}>{s.label}</button>
              ))}
            </div>
          </div>
        )}
        <Field label="Remarques"><Textarea rows={2} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></Field>
      </div>
    </Modal>
  );
};

// ------------------------------------------------------------------ Liste
export const AdminReservations: React.FC = () => {
  useDocumentTitle('Réservations');
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ statut: params.get('statut') || '', payment_status: params.get('paiement') || '', service_id: '', from: '', to: '', engineer_id: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [creating, setCreating] = useState(false);
  const q = useDebounced(search, 300);
  const services = useAsync(() => api<{ services: Service[] }>('/admin/services').then((r) => r.services), []);
  const engineers = useEngineers();
  const query = new URLSearchParams(Object.entries({ ...filters, search: q }).filter(([, v]) => v) as [string, string][]).toString();
  const { data, loading, error, reload } = useAsync(() => api<{ reservations: Reservation[] }>(`/admin/reservations?${query}`).then((r) => r.reservations), [query]);
  const openId = params.get('id');
  const setOpen = (id: string | null) => {
    const n = new URLSearchParams(params);
    if (id) n.set('id', id); else n.delete('id');
    setParams(n, { replace: true });
  };
  const activeFilters = Object.values(filters).filter(Boolean).length;

  return (
    <div>
      <PageHeader title="Réservations" subtitle={data ? `${data.length} résultat${data.length > 1 ? 's' : ''}` : undefined}
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setCreating(true)}>Nouvelle réservation</Button>} />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bone-600" />
          <Input className="pl-11" placeholder="Rechercher un client (nom, e-mail, téléphone, référence)…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="subtle" onClick={() => setShowFilters(!showFilters)} icon={<Filter className="h-4 w-4" />}>Filtres{activeFilters ? ` (${activeFilters})` : ''}</Button>
      </div>
      {showFilters && (
        <div className="card mb-5 grid animate-fade-in gap-3 p-4 sm:grid-cols-3 lg:grid-cols-6">
          <Select value={filters.statut} onChange={(e) => setFilters({ ...filters, statut: e.target.value })}>
            <option value="">Tous les statuts</option><option value="a_venir">À venir</option><option value="confirmee">Confirmées (non passées)</option><option value="terminee">Terminées</option>
            <option value="reportee">Reportées</option><option value="annulee">Annulées</option><option value="a_traiter">À traiter</option><option value="en_attente">Paiement en cours</option><option value="expiree">Expirées</option>
          </Select>
          <Select value={filters.payment_status} onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}>
            <option value="">Tous paiements</option>{Object.entries(PAYMENT).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
          <Select value={filters.service_id} onChange={(e) => setFilters({ ...filters, service_id: e.target.value })}>
            <option value="">Tous services</option>{(services.data || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Select value={filters.engineer_id} onChange={(e) => setFilters({ ...filters, engineer_id: e.target.value })}>
            <option value="">Tous ingénieurs</option>{(engineers.data || []).map((u) => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
          </Select>
          <Input type="date" aria-label="Du" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
          <Input type="date" aria-label="Au" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
          {activeFilters > 0 && <button className="text-left text-xs font-semibold text-ember sm:col-span-3 lg:col-span-6" onClick={() => setFilters({ statut: '', payment_status: '', service_id: '', from: '', to: '', engineer_id: '' })}>Réinitialiser les filtres</button>}
        </div>
      )}

      {loading && !data && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && data.length === 0 && <Empty title="Aucune réservation" text="Aucun résultat pour ces critères." />}
      {data && data.length > 0 && (
        <div className={cx('card overflow-hidden transition-opacity', loading && 'opacity-60')}>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead className="border-b border-ink-600/70 bg-ink-900/60"><tr>
                <th className="table-head">Client</th><th className="table-head">Service</th><th className="table-head">Date</th><th className="table-head">Statut</th><th className="table-head">Paiement</th><th className="table-head">Ingénieur</th><th className="table-head text-right">Montant</th>
              </tr></thead>
              <tbody className="divide-y divide-ink-700">
                {data.map((r) => (
                  <tr key={r.id} onClick={() => setOpen(r.id)} className="cursor-pointer transition hover:bg-ink-700/50">
                    <td className="table-cell"><p className="font-semibold">{r.nom}</p><p className="text-xs text-bone-600">{phoneDisplay(r.telephone)}</p></td>
                    <td className="table-cell text-bone-200">{r.service_name}</td>
                    <td className="table-cell whitespace-nowrap">{r.start_at ? <><p>{fDateShort(r.start_at)}</p><p className="text-xs text-bone-600">{fRange(r.start_at, r.end_at)}</p></> : <span className="text-bone-400">{r.nombre_titres} titre(s)</span>}</td>
                    <td className="table-cell"><div className="flex flex-col items-start gap-1"><StatusBadge map={STATUT} value={r.statut} />{r.session_status === 'autorisee' && r.statut === 'confirmee' && <Badge tone="green">Autorisée</Badge>}{r.reschedule_count > 0 && <Badge tone="blue">Reportée</Badge>}</div></td>
                    <td className="table-cell"><StatusBadge map={PAYMENT} value={r.payment_status} /></td>
                    <td className="table-cell text-bone-400">{r.engineer_name || <UserCheck className="h-4 w-4 text-bone-600" />}</td>
                    <td className="table-cell text-right font-semibold tabular-nums">{fcfa(r.montant_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-ink-700 md:hidden">
            {data.map((r) => (
              <button key={r.id} onClick={() => setOpen(r.id)} className="block w-full px-4 py-4 text-left">
                <div className="flex justify-between gap-3"><p className="font-semibold">{r.nom}</p><p className="text-sm font-semibold tabular-nums">{fcfa(r.montant_total)}</p></div>
                <p className="text-sm text-bone-400">{r.service_name} · {r.start_at ? `${fDateShort(r.start_at)} ${fRange(r.start_at, r.end_at)}` : `${r.nombre_titres} titre(s)`}</p>
                <div className="mt-2 flex flex-wrap gap-1.5"><StatusBadge map={STATUT} value={r.statut} /><StatusBadge map={PAYMENT} value={r.payment_status} /></div>
              </button>
            ))}
          </div>
        </div>
      )}
      <ReservationDetail id={openId} onClose={() => setOpen(null)} onChanged={reload} />
      <NewReservation open={creating} onClose={() => setCreating(false)} onCreated={(r) => { setCreating(false); reload(); setOpen(r.id); }} />
    </div>
  );
};
