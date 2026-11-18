import React, { useState } from 'react';
import { Copy, KeyRound, Mail, Plus, Search, UserX, UserCheck, Trash2, CalendarOff, Pencil } from 'lucide-react';
import { api } from '../../lib/api';
import { useAsync, useDebounced, useDocumentTitle } from '../../lib/hooks';
import { fDateNum, fDateShort, fDateTime, fRange, fcfa, phoneDisplay, studioToday } from '../../lib/format';
import { PAYMENT, ROLE, STATUT } from '../../lib/labels';
import type { Reservation, User } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Alert, Badge, Button, Confirm, Empty, ErrorState, Field, Input, Modal, PageHeader, Select, Spinner, StatusBadge } from '../../components/ui';
import { ReservationDetail } from './Reservations';

type ClientRow = User & { nb_reservations: number; derniere_session: string | null; total_paye: number };

// ------------------------------------------------------------------ Clients
export const AdminClients: React.FC = () => {
  useDocumentTitle('Clients');
  const toast = useToast();
  const [search, setSearch] = useState('');
  const q = useDebounced(search);
  const { data, loading, error, reload } = useAsync(() => api<{ clients: ClientRow[] }>(`/admin/clients?search=${encodeURIComponent(q)}`).then((r) => r.clients), [q]);
  const [open, setOpen] = useState<ClientRow | null>(null);
  const [resId, setResId] = useState<string | null>(null);
  const detail = useAsync(() => (open ? api<{ client: User; reservations: Reservation[] }>(`/admin/clients/${open.id}`) : Promise.resolve(null)), [open?.id]);
  const [busy, setBusy] = useState<string | null>(null);

  const act = async (key: string, fn: () => Promise<any>, ok: string) => {
    setBusy(key);
    try { await fn(); toast(ok); reload(); detail.reload(); } catch (e: any) { toast(e.message, 'error'); } finally { setBusy(null); }
  };

  return (
    <div>
      <PageHeader title="Clients" subtitle={data ? `${data.length} compte(s) client` : undefined} />
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bone-600" />
        <Input className="pl-11" placeholder="Rechercher par nom, e-mail ou téléphone…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {loading && !data && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && data.length === 0 && <Empty title="Aucun client" />}
      {data && data.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-ink-600/70"><tr><th className="table-head">Client</th><th className="table-head">Contact</th><th className="table-head">Réservations</th><th className="table-head">Dernière session</th><th className="table-head text-right">Total payé</th></tr></thead>
            <tbody className="divide-y divide-ink-700">
              {data.map((c) => (
                <tr key={c.id} className="cursor-pointer hover:bg-ink-700/50" onClick={() => setOpen(c)}>
                  <td className="table-cell"><p className="font-semibold">{c.first_name} {c.last_name}{!c.is_active && <Badge tone="red" className="ml-2">Désactivé</Badge>}</p><p className="text-xs text-bone-600">Inscrit le {fDateNum(c.created_at)}{c.google_linked ? ' · Google' : ''}</p></td>
                  <td className="table-cell"><p className="text-bone-200">{c.email || '—'}</p><p className="text-xs text-bone-600">{phoneDisplay(c.phone)}</p></td>
                  <td className="table-cell tabular-nums">{c.nb_reservations}</td>
                  <td className="table-cell text-bone-400">{c.derniere_session ? fDateShort(c.derniere_session) : '—'}</td>
                  <td className="table-cell text-right font-semibold tabular-nums">{fcfa(c.total_paye)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!open} onClose={() => setOpen(null)} size="lg" title={open ? `${open.first_name} ${open.last_name}` : ''}>
        {detail.loading && <Spinner />}
        {detail.data && (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-ink-600 bg-ink-900 p-4 text-sm"><p className="text-xs uppercase tracking-wider text-bone-600">E-mail</p><p className="mt-1 break-all">{detail.data.client.email || '—'}</p></div>
              <div className="rounded-2xl border border-ink-600 bg-ink-900 p-4 text-sm"><p className="text-xs uppercase tracking-wider text-bone-600">Téléphone</p><p className="mt-1">{phoneDisplay(detail.data.client.phone) || '—'}</p></div>
              <div className="rounded-2xl border border-ink-600 bg-ink-900 p-4 text-sm"><p className="text-xs uppercase tracking-wider text-bone-600">Connexion</p><p className="mt-1">{detail.data.client.last_login_at ? fDateTime(detail.data.client.last_login_at) : 'Jamais'}</p></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {detail.data.client.email && <Button size="sm" variant="subtle" icon={<Mail className="h-4 w-4" />} loading={busy === 'reset'} onClick={() => act('reset', () => api(`/admin/clients/${open!.id}/send-reset-link`, { method: 'POST' }), 'Lien de réinitialisation envoyé au client')}>Envoyer un lien de mot de passe</Button>}
              {detail.data.client.is_active
                ? <Button size="sm" variant="danger" icon={<UserX className="h-4 w-4" />} loading={busy === 'off'} onClick={() => act('off', () => api(`/admin/clients/${open!.id}`, { method: 'PATCH', body: { is_active: false } }), 'Compte désactivé')}>Désactiver</Button>
                : <Button size="sm" variant="subtle" icon={<UserCheck className="h-4 w-4" />} loading={busy === 'on'} onClick={() => act('on', () => api(`/admin/clients/${open!.id}`, { method: 'PATCH', body: { is_active: true } }), 'Compte réactivé')}>Réactiver</Button>}
            </div>
            <div>
              <h3 className="mb-3 font-semibold">Réservations</h3>
              {detail.data.reservations.length === 0 ? <Empty title="Aucune réservation" /> : (
                <ul className="divide-y divide-ink-700 rounded-2xl border border-ink-600">
                  {detail.data.reservations.map((r) => (
                    <li key={r.id}>
                      <button onClick={() => setResId(r.id)} className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left hover:bg-ink-700/50">
                        <span><span className="block font-semibold">{r.service_name}</span><span className="text-xs text-bone-600">{r.start_at ? `${fDateShort(r.start_at)} ${fRange(r.start_at, r.end_at)}` : `${r.nombre_titres} titre(s)`}</span></span>
                        <span className="flex gap-1.5"><StatusBadge map={STATUT} value={r.statut} /><StatusBadge map={PAYMENT} value={r.payment_status} /></span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
      <ReservationDetail id={resId} onClose={() => setResId(null)} onChanged={detail.reload} />
    </div>
  );
};

// ------------------------------------------------------------------ Équipe (ingénieurs / administrateurs)
const UserForm: React.FC<{ initial?: User | null; roles: string[]; onSaved: (tmp?: string) => void; onCancel: () => void }> = ({ initial, roles, onSaved, onCancel }) => {
  const [f, setF] = useState({ first_name: initial?.first_name || '', last_name: initial?.last_name || '', email: initial?.email || '', phone: phoneDisplay(initial?.phone), role: initial?.role || roles[0], password: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      if (initial) {
        await api(`/admin/users/${initial.id}`, { method: 'PATCH', body: { first_name: f.first_name, last_name: f.last_name, email: f.email, phone: f.phone, role: f.role } });
        onSaved();
      } else {
        const body: any = { ...f };
        if (!body.password) delete body.password;
        const r = await api<{ temporaryPassword?: string }>('/admin/users', { method: 'POST', body });
        onSaved(r.temporaryPassword);
      }
    } catch (err: any) { setError(err.message); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <Alert>{error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Prénom"><Input required value={f.first_name} onChange={(e) => setF({ ...f, first_name: e.target.value })} /></Field>
        <Field label="Nom"><Input value={f.last_name} onChange={(e) => setF({ ...f, last_name: e.target.value })} /></Field>
        <Field label="E-mail (identifiant)"><Input required type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Téléphone WhatsApp" hint="Pour les notifications de sessions"><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        {roles.length > 1 && <Field label="Rôle"><Select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as any })}>{roles.map((r) => <option key={r} value={r}>{ROLE[r]}</option>)}</Select></Field>}
        {!initial && <Field label="Mot de passe provisoire" hint="Laisser vide pour en générer un. À changer à la 1re connexion."><Input value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>}
      </div>
      <div className="flex justify-end gap-2 pt-2"><Button variant="ghost" type="button" onClick={onCancel}>Annuler</Button><Button type="submit" loading={busy}>{initial ? 'Enregistrer' : 'Créer le compte'}</Button></div>
    </form>
  );
};

const TempPassword: React.FC<{ value: string | null; onClose: () => void }> = ({ value, onClose }) => {
  const toast = useToast();
  return (
    <Modal open={!!value} onClose={onClose} size="sm" title="Identifiants créés">
      <p className="text-sm text-bone-400">Communiquez ce mot de passe provisoire à la personne : il ne sera plus affiché. Elle devra le changer à sa première connexion sur <strong className="text-bone">/admin</strong>.</p>
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-ember/30 bg-ink-900 p-3">
        <code className="flex-1 select-all font-mono text-lg tracking-wider">{value}</code>
        <button onClick={() => { navigator.clipboard?.writeText(value || ''); toast('Copié'); }} className="rounded-lg p-2 hover:bg-ink-700" aria-label="Copier"><Copy className="h-4 w-4" /></button>
      </div>
      <Button className="mt-5 w-full" onClick={onClose}>J’ai noté le mot de passe</Button>
    </Modal>
  );
};

const Absences: React.FC<{ engineer: User }> = ({ engineer }) => {
  const toast = useToast();
  const { data, reload } = useAsync(() => api<{ unavailability: any[] }>(`/admin/unavailability?user_id=${engineer.id}`).then((r) => r.unavailability), [engineer.id]);
  const [f, setF] = useState({ start_at: `${studioToday()}T08:00`, end_at: `${studioToday()}T23:00`, reason: '' });
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Début"><Input type="datetime-local" value={f.start_at} onChange={(e) => setF({ ...f, start_at: e.target.value })} /></Field>
        <Field label="Fin"><Input type="datetime-local" value={f.end_at} onChange={(e) => setF({ ...f, end_at: e.target.value })} /></Field>
        <Field label="Motif"><Input value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></Field>
      </div>
      <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={async () => {
        try { await api('/admin/unavailability', { method: 'POST', body: { ...f, user_id: engineer.id } }); toast('Absence ajoutée'); reload(); } catch (e: any) { toast(e.message, 'error'); }
      }}>Ajouter l’absence</Button>
      <ul className="divide-y divide-ink-700 rounded-2xl border border-ink-600">
        {(data || []).map((u) => (
          <li key={u.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <span>{fDateTime(u.start_at)} → {fDateTime(u.end_at)}{u.reason ? ` · ${u.reason}` : ''}</span>
            <button onClick={async () => { await api(`/admin/unavailability/${u.id}`, { method: 'DELETE' }); reload(); }} className="text-bone-600 hover:text-[#F07A7A]" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button>
          </li>
        ))}
        {data && !data.length && <li className="px-4 py-6 text-center text-sm text-bone-600">Aucune absence prévue</li>}
      </ul>
    </div>
  );
};

export const AdminTeam: React.FC<{ kind: 'engineer' | 'admin' }> = ({ kind }) => {
  useDocumentTitle(kind === 'engineer' ? 'Ingénieurs du son' : 'Administrateurs');
  const toast = useToast();
  const { user: me } = useAuth();
  const roles = kind === 'engineer' ? ['engineer'] : ['admin', 'super_admin'];
  const { data, loading, error, reload } = useAsync(() => Promise.all(roles.map((r) => api<{ users: (User & { nb_sessions_a_venir: number })[] }>(`/admin/users?role=${r}`))).then((all) => all.flatMap((x) => x.users)), [kind]);
  const [editing, setEditing] = useState<User | 'new' | null>(null);
  const [tmp, setTmp] = useState<string | null>(null);
  const [del, setDel] = useState<User | null>(null);
  const [absences, setAbsences] = useState<User | null>(null);

  const act = async (fn: () => Promise<any>, ok: string) => { try { await fn(); toast(ok); reload(); } catch (e: any) { toast(e.message, 'error'); } };

  return (
    <div>
      <PageHeader title={kind === 'engineer' ? 'Ingénieurs du son' : 'Administrateurs'}
        subtitle={kind === 'engineer' ? 'Comptes des ingénieurs : accès à leurs sessions uniquement, sans aucune donnée financière.' : 'Comptes ayant accès à toute l’administration et aux finances.'}
        actions={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing('new')}>{kind === 'engineer' ? 'Ajouter un ingénieur' : 'Ajouter un administrateur'}</Button>} />
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && data.length === 0 && <Empty title="Aucun compte" text={kind === 'engineer' ? 'Créez le compte d’un ingénieur du son pour lui donner accès à son calendrier.' : undefined} />}
      {data && data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((u) => (
            <div key={u.id} className="card flex flex-col p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ember to-crimson font-display font-bold">{u.first_name[0]}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{u.first_name} {u.last_name}</p>
                  <p className="truncate text-xs text-bone-600">{u.email}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge tone={u.role === 'super_admin' ? 'ember' : 'neutral'}>{ROLE[u.role]}</Badge>
                    {!u.is_active && <Badge tone="red">Désactivé</Badge>}
                    {u.must_change_password && <Badge tone="amber">Mot de passe provisoire</Badge>}
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-1 text-sm text-bone-400">
                {u.phone && <p>{phoneDisplay(u.phone)}</p>}
                {kind === 'engineer' && <p>{u.nb_sessions_a_venir} session(s) à venir</p>}
                <p className="text-xs text-bone-600">Dernière connexion : {u.last_login_at ? fDateTime(u.last_login_at) : 'jamais'}</p>
              </div>
              {u.id !== me?.id && (
                <div className="mt-5 flex flex-wrap gap-1.5 border-t border-ink-600/70 pt-4">
                  <Button size="sm" variant="ghost" icon={<Pencil className="h-3.5 w-3.5" />} onClick={() => setEditing(u)}>Modifier</Button>
                  {kind === 'engineer' && <Button size="sm" variant="ghost" icon={<CalendarOff className="h-3.5 w-3.5" />} onClick={() => setAbsences(u)}>Absences</Button>}
                  <Button size="sm" variant="ghost" icon={<KeyRound className="h-3.5 w-3.5" />} onClick={() => act(async () => setTmp((await api<{ temporaryPassword: string }>(`/admin/users/${u.id}/reset-password`, { method: 'POST' })).temporaryPassword), 'Nouveau mot de passe provisoire généré')}>Réinitialiser</Button>
                  <Button size="sm" variant="ghost" icon={u.is_active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />} onClick={() => act(() => api(`/admin/users/${u.id}`, { method: 'PATCH', body: { is_active: !u.is_active } }), u.is_active ? 'Compte désactivé' : 'Compte réactivé')}>{u.is_active ? 'Désactiver' : 'Réactiver'}</Button>
                  <Button size="sm" variant="ghost" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setDel(u)}>Supprimer</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'Nouveau compte' : 'Modifier le compte'}>
        {editing && <UserForm initial={editing === 'new' ? null : editing} roles={roles} onCancel={() => setEditing(null)} onSaved={(t) => { setEditing(null); reload(); if (t) setTmp(t); else toast('Compte enregistré'); }} />}
      </Modal>
      <Modal open={!!absences} onClose={() => setAbsences(null)} size="lg" title={`Absences — ${absences?.first_name || ''}`}>{absences && <Absences engineer={absences} />}</Modal>
      <TempPassword value={tmp} onClose={() => setTmp(null)} />
      <Confirm open={!!del} onClose={() => setDel(null)} danger title="Supprimer le compte" confirmLabel="Supprimer"
        message="Un compte lié à des réservations ne peut pas être supprimé (l’historique est conservé) : désactivez-le dans ce cas."
        onConfirm={async () => { await act(() => api(`/admin/users/${del!.id}`, { method: 'DELETE' }), 'Compte supprimé'); setDel(null); }} />
    </div>
  );
};
