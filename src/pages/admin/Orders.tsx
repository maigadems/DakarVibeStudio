// Commandes payées par étapes (mixage, mastering…) : suivi et pilotage par Jeuss.
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Banknote, Search, Send, SlidersHorizontal, BellRing, Package } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync, useDebounced, useDocumentTitle } from '../../lib/hooks';
import { cx, fDateNum, fcfa, phoneDisplay } from '../../lib/format';
import { PRODUCTION, STATUT } from '../../lib/labels';
import type { Milestone, OrderInfo, Reservation } from '../../lib/types';
import { useToast } from '../../context/ToastContext';
import { Alert, Badge, Button, Confirm, Empty, ErrorState, Field, Input, Modal, PageHeader, Spinner, StatusBadge, Tabs, Textarea } from '../../components/ui';
import { OrderSteps } from '../../components/OrderSteps';
import { ReservationDetail } from './Reservations';

// ------------------------------------------------------------------ Panneau d'une commande (dans la fiche réservation)
export const OrderPanel: React.FC<{ reservation: Reservation; order: OrderInfo; onChanged: () => void }> = ({ reservation: r, order, onChanged }) => {
  const toast = useToast();
  const [requesting, setRequesting] = useState<Milestone | null>(null);
  const [note, setNote] = useState('');
  const [cashFor, setCashFor] = useState<Milestone | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [percents, setPercents] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);
  const ms = order.milestones;
  const active = ['confirmee', 'terminee'].includes(r.statut);
  const firstUnpaid = ms.find((m) => m.status !== 'paye');
  const editable = ms.filter((m) => m.status === 'a_venir');
  const last = ms[ms.length - 1];
  const canEditPlan = ms.length > 1 && last.status === 'a_venir' && editable.length > 1;

  const call = async (path: string, body: unknown, ok: string) => {
    setBusy(true);
    try { await api(`/admin/reservations/${r.id}${path}`, { method: path === '/plan' ? 'PATCH' : 'POST', body }); toast(ok); onChanged(); return true; }
    catch (e: any) { toast(e.message, 'error'); return false; }
    finally { setBusy(false); }
  };

  const actions = (m: Milestone) => {
    if (!active || m.status === 'paye') return null;
    const isNext = firstUnpaid?.id === m.id;
    return (
      <div className="flex flex-wrap gap-1.5">
        {m.status === 'a_venir' && isNext && m.kind !== 'acompte' && (
          <Button size="sm" icon={<Send className="h-4 w-4" />} onClick={() => { setNote(m.deliverable_note || ''); setRequesting(m); }}>
            {m.kind === 'livraison_finale' ? 'Livrer et demander le solde' : 'Envoyer les livrables et demander le paiement'}
          </Button>
        )}
        {m.status === 'demande' && <Button size="sm" variant="ghost" icon={<BellRing className="h-4 w-4" />} onClick={() => { setNote(m.deliverable_note || ''); setRequesting(m); }}>Relancer le client</Button>}
        {isNext && (m.status !== 'a_venir' || m.kind === 'acompte') && (
          <Button size="sm" variant={m.status === 'en_attente_validation' ? 'primary' : 'subtle'} icon={<Banknote className="h-4 w-4" />} onClick={() => setCashFor(m)}>
            {m.status === 'en_attente_validation' ? 'Confirmer la réception des espèces' : 'Encaisser en espèces'}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-ember/25 bg-ember/5 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-semibold"><Package className="h-4 w-4 text-ember" />Commande · {r.nombre_titres || 1} titre{(r.nombre_titres || 1) > 1 ? 's' : ''}</p>
        <div className="flex items-center gap-2">
          {order.production_status && PRODUCTION[order.production_status] && <Badge tone={PRODUCTION[order.production_status].tone}>{PRODUCTION[order.production_status].label}</Badge>}
          {canEditPlan && active && <Button size="sm" variant="ghost" icon={<SlidersHorizontal className="h-4 w-4" />} onClick={() => { setPercents(Object.fromEntries(editable.filter((m) => m.id !== last.id).map((m) => [m.id, String(m.percent)]))); setPlanOpen(true); }}>Ajuster les %</Button>}
        </div>
      </div>
      <OrderSteps milestones={ms} actions={actions} />

      <Modal open={!!requesting} onClose={() => setRequesting(null)} title={requesting?.status === 'demande' ? 'Relancer le client' : requesting?.kind === 'livraison_finale' ? 'Livraison finale' : 'Premiers livrables'}
        footer={<><Button variant="ghost" onClick={() => setRequesting(null)}>Annuler</Button>
          <Button loading={busy} icon={<Send className="h-4 w-4" />} onClick={async () => { if (await call(`/milestones/${requesting!.id}/request`, { note }, requesting!.status === 'demande' ? 'Relance envoyée au client' : 'Paiement demandé : le client est prévenu')) setRequesting(null); }}>
            {requesting?.status === 'demande' ? 'Envoyer la relance' : `Demander ${fcfa(requesting?.amount)}`}
          </Button></>}>
        <div className="space-y-4">
          <p className="text-sm text-bone-400">Le client reçoit un message WhatsApp, une notification dans son espace et un e-mail, avec un lien pour régler <strong className="text-bone">{fcfa(requesting?.amount)}</strong> ({requesting?.percent} %) en ligne ou en espèces.</p>
          <Field label="Lien ou message pour les livrables (facultatif)" hint="Ex. lien Google Drive / WeTransfer vers les fichiers, consignes d’écoute…">
            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="https://…" />
          </Field>
        </div>
      </Modal>

      <Confirm open={!!cashFor} onClose={() => setCashFor(null)} title="Paiement en espèces reçu ?" confirmLabel="Oui, j’ai reçu le paiement"
        message={<>Confirmez avoir reçu <strong>{fcfa(cashFor?.amount)}</strong> pour l’étape « {cashFor?.label} ».</>}
        onConfirm={async () => { if (await call(`/milestones/${cashFor!.id}/validate-cash`, {}, 'Paiement enregistré')) setCashFor(null); }} />

      <Modal open={planOpen} onClose={() => setPlanOpen(false)} size="sm" title="Ajuster l’échéancier de cette commande"
        footer={<><Button variant="ghost" onClick={() => setPlanOpen(false)}>Annuler</Button>
          <Button loading={busy} onClick={async () => { if (await call('/plan', { percents: Object.fromEntries(Object.entries(percents).map(([k, v]) => [k, Number(v)])) }, 'Échéancier mis à jour')) setPlanOpen(false); }}>Enregistrer</Button></>}>
        <div className="space-y-4">
          {ms.filter((m) => m.status !== 'a_venir').map((m) => <p key={m.id} className="flex justify-between text-sm text-bone-400"><span>{m.label}</span><span>{m.percent} % (fixé)</span></p>)}
          {editable.filter((m) => m.id !== last.id).map((m) => (
            <Field key={m.id} label={`${m.label} (%)`}><Input type="number" min={0} max={99} value={percents[m.id] ?? ''} onChange={(e) => setPercents({ ...percents, [m.id]: e.target.value })} /></Field>
          ))}
          {(() => {
            const used = ms.filter((m) => m.status !== 'a_venir').reduce((s, m) => s + m.percent, 0) + Object.values(percents).reduce((s, v) => s + (Number(v) || 0), 0);
            return used >= 100 ? <Alert>La livraison finale doit garder un pourcentage supérieur à 0.</Alert>
              : <p className="flex justify-between rounded-xl border border-ink-600 bg-ink-900 px-3 py-2 text-sm"><span>{last.label}</span><strong>{100 - used} % · {fcfa(Math.round((Number(r.montant_total) * (100 - used)) / 100))}</strong></p>;
          })()}
        </div>
      </Modal>
    </div>
  );
};

// ------------------------------------------------------------------ Onglet « Commandes »
type OrderRow = Reservation & { order: OrderInfo | null };

export const AdminOrders: React.FC = () => {
  useDocumentTitle('Commandes');
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState('en_cours');
  const [search, setSearch] = useState('');
  const q = useDebounced(search);
  const { data, loading, error, reload } = useAsync(
    () => api<{ orders: OrderRow[] }>(`/admin/orders?status=${tab === 'toutes' ? '' : tab}&search=${encodeURIComponent(q)}`).then((r) => r.orders), [tab, q]
  );
  const openId = params.get('id');
  const setOpen = (id: string | null) => setParams(id ? { id } : {}, { replace: true });

  return (
    <div>
      <PageHeader title="Commandes" subtitle="Mixage, mastering… payés par étapes : acompte, premiers livrables, livraison finale." />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={tab} onChange={setTab} tabs={[{ id: 'en_cours', label: 'En cours' }, { id: 'a_regler', label: 'Paiement demandé' }, { id: 'terminees', label: 'Terminées' }, { id: 'toutes', label: 'Toutes' }]} />
        <div className="relative lg:w-80">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bone-600" />
          <Input className="pl-11" placeholder="Client, e-mail, téléphone…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      {loading && !data && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && data.length === 0 && <Empty icon={<Package className="h-8 w-8" />} title="Aucune commande" text="Les commandes de mixage et de mastering passées en ligne ou saisies par le studio apparaissent ici." />}
      {data && data.length > 0 && (
        <ul className={cx('space-y-3', loading && 'opacity-60')}>
          {data.map((o) => {
            const ms = o.order?.milestones || [];
            const due = ms.find((m) => m.id === o.order?.current_id);
            const next = ms.find((m) => m.status === 'a_venir');
            return (
              <li key={o.id}>
                <button onClick={() => setOpen(o.id)} className="card flex w-full flex-col gap-4 p-4 text-left transition hover:border-ember/40 sm:flex-row sm:items-center sm:p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{o.nom}</p>
                      {o.order?.production_status && PRODUCTION[o.order.production_status] ? <Badge tone={PRODUCTION[o.order.production_status].tone}>{PRODUCTION[o.order.production_status].label}</Badge> : <StatusBadge map={STATUT} value={o.statut} />}
                    </div>
                    <p className="mt-0.5 text-sm text-bone-400">{o.service_name} · {o.nombre_titres || 1} titre(s) · {phoneDisplay(o.telephone)} · commandé le {fDateNum(o.created_at)}</p>
                    {ms.length > 0 && (
                      <div className="mt-3 flex items-center gap-1.5">
                        {ms.map((m) => <span key={m.id} title={`${m.label} : ${m.status}`} className={cx('h-1.5 flex-1 rounded-full', m.status === 'paye' ? 'bg-sage' : m.status === 'demande' ? 'bg-amberish' : m.status === 'en_attente_validation' ? 'bg-sky-400' : 'bg-ink-600')} />)}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-left sm:w-56 sm:text-right">
                    <p className="font-display font-semibold tabular-nums">{fcfa(o.montant_paye)} <span className="text-sm font-normal text-bone-600">/ {fcfa(o.montant_total)}</span></p>
                    <p className="text-xs text-bone-400">
                      {due ? (due.status === 'en_attente_validation' ? `Espèces à valider · ${fcfa(due.amount)}` : `${due.label} demandé · ${fcfa(due.amount)}`)
                        : next ? `Prochaine étape : ${next.label}` : o.statut === 'terminee' ? 'Commande terminée' : '—'}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <ReservationDetail id={openId} onClose={() => setOpen(null)} onChanged={reload} />
    </div>
  );
};
