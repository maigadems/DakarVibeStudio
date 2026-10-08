import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  adminLogin, adminLogout, deleteReservation, getAllReservations, updateReservationStatus, type Reservation
} from '../utils/reservationService';
import {
  adminClients, adminOverview, adminResetClientPassword, type AdminClient, type AdminOverview
} from '../utils/accountService';

const fmt = (n: number) => Number(n).toLocaleString('fr-FR');
const STATUT: Record<string, string> = { confirmee: 'Confirmée', en_attente: 'En attente', annulee: 'Annulée' };
const SERVICE: Record<string, string> = { horaire: 'Horaire', mixage: 'Mixage', mastering: 'Mastering' };
const inputCls = 'bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500';

type Tab = 'apercu' | 'reservations' | 'clients';

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-gray-800 rounded-xl p-4">
    <div className="text-xs text-gray-400">{label}</div>
    <div className="text-2xl font-bold text-orange-400">{value}</div>
  </div>
);

const AdminPanel: React.FC = () => {
  const [authed, setAuthed] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('apercu');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [notice, setNotice] = useState('');

  const logout = useCallback(() => {
    adminLogout();
    setAuthed(false);
  }, []);

  const refresh = useCallback(async () => {
    const [o, rs, cl] = await Promise.all([adminOverview(), getAllReservations(), adminClients()]);
    if (!o.ok && o.message === 'Session expirée') return logout();
    if (o.ok) setOverview(o.data);
    setReservations(rs);
    if (cl.ok) setClients(cl.data.clients);
  }, [logout]);

  useEffect(() => {
    if (authed) refresh();
  }, [authed, refresh]);

  // Ne jamais laisser une session admin ouverte en quittant la page
  useEffect(() => () => adminLogout(), []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (await adminLogin(login, password)) {
      setPassword('');
      setAuthed(true);
    } else {
      setError('Identifiants incorrects ou trop de tentatives.');
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reservations.filter(
      (r) =>
        (!statusFilter || r.statut === statusFilter) &&
        (!q || [r.nom, r.email, r.telephone].some((v) => v?.toLowerCase().includes(q)))
    );
  }, [reservations, search, statusFilter]);

  const changeStatus = async (id: string, statut: Reservation['statut']) => {
    if (await updateReservationStatus(id, statut)) refresh();
  };

  const remove = async (r: Reservation) => {
    if (!window.confirm(`Supprimer définitivement la réservation de ${r.nom} ?`)) return;
    if (await deleteReservation(r.id)) refresh();
  };

  const reset = async (c: AdminClient) => {
    if (!window.confirm(`Générer un nouveau mot de passe pour ${c.telephone} ?`)) return;
    const r = await adminResetClientPassword(c.telephone);
    setNotice(r.ok ? `Nouveau mot de passe de ${c.telephone} : ${r.data.password} (à transmettre au client)` : r.message);
  };

  if (!authed) {
    return (
      <section className="pt-28 pb-16 min-h-screen">
        <form onSubmit={submit} className="max-w-sm mx-auto bg-gray-800 rounded-2xl p-6 space-y-4">
          <h1 className="text-2xl font-bold">Administration</h1>
          <input className={`${inputCls} w-full`} placeholder="Identifiant" value={login} onChange={(e) => setLogin(e.target.value)} autoComplete="username" required />
          <input className={`${inputCls} w-full`} type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button className="w-full bg-orange-500 hover:bg-orange-600 rounded-lg py-3 font-semibold">Connexion</button>
        </form>
      </section>
    );
  }

  return (
    <section className="pt-28 pb-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Supervision</h1>
          <div className="flex gap-4 text-sm">
            <button onClick={refresh} className="text-gray-300 hover:text-white underline">Actualiser</button>
            <button onClick={logout} className="text-gray-300 hover:text-white underline">Déconnexion</button>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {([['apercu', 'Aperçu'], ['reservations', 'Réservations'], ['clients', 'Clients']] as [Tab, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-lg ${tab === id ? 'bg-orange-500' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {notice && (
          <div className="mb-4 bg-orange-500/10 border border-orange-500/40 rounded-lg p-3 text-sm flex justify-between">
            <span className="select-all">{notice}</span>
            <button onClick={() => setNotice('')} className="text-gray-400">Fermer</button>
          </div>
        )}

        {tab === 'apercu' && overview && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Encaissé ce mois (FCFA)" value={fmt(overview.encaisseMois)} />
            <Stat label="Total encaissé (FCFA)" value={fmt(overview.encaisse)} />
            <Stat label="Soldes à encaisser (FCFA)" value={fmt(overview.soldeAEncaisser)} />
            <Stat label="Réservations à venir" value={String(overview.aVenir)} />
            <Stat label="Réservations totales" value={String(overview.totalReservations)} />
            <Stat label="Annulées" value={String(overview.annulees)} />
            <Stat label="Clients" value={String(overview.clients)} />
          </div>
        )}

        {tab === 'reservations' && (
          <div>
            <div className="flex flex-wrap gap-3 mb-4">
              <input className={`${inputCls} flex-1 min-w-[200px]`} placeholder="Rechercher (nom, email, téléphone)" value={search} onChange={(e) => setSearch(e.target.value)} />
              <select className={inputCls} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">Tous les statuts</option>
                <option value="confirmee">Confirmées</option>
                <option value="en_attente">En attente</option>
                <option value="annulee">Annulées</option>
              </select>
            </div>
            <div className="overflow-x-auto bg-gray-800 rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="p-3">Client</th><th className="p-3">Service</th><th className="p-3">Date</th>
                    <th className="p-3">Paiement</th><th className="p-3">Statut</th><th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="p-6 text-center text-gray-400">Aucune réservation</td></tr>
                  )}
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-gray-700/50 align-top">
                      <td className="p-3">
                        <div className="font-medium">{r.nom}</div>
                        <div className="text-gray-400">{r.telephone}</div>
                        <div className="text-gray-400">{r.email}</div>
                      </td>
                      <td className="p-3">
                        {SERVICE[r.type_service]}
                        {r.type_service !== 'horaire' && r.nombre_titres ? ` (${r.nombre_titres})` : ''}
                      </td>
                      <td className="p-3">
                        {r.date_reservation}
                        {r.creneaux?.length ? <div className="text-gray-400">{r.creneaux.join(', ')}</div> : null}
                      </td>
                      <td className="p-3">
                        {fmt(r.montant_paye)} / {fmt(r.montant_total)}
                        <div className={r.type_paiement === 'partiel' ? 'text-yellow-400' : 'text-green-400'}>
                          {r.type_paiement === 'partiel' ? `Partiel — reste ${fmt(r.montant_total - r.montant_paye)}` : 'Total'}
                        </div>
                      </td>
                      <td className="p-3">
                        <select className={inputCls} value={r.statut} onChange={(e) => changeStatus(r.id, e.target.value as Reservation['statut'])}>
                          {Object.entries(STATUT).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </td>
                      <td className="p-3">
                        <button onClick={() => remove(r)} className="text-red-400 hover:text-red-300">Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'clients' && (
          <div className="overflow-x-auto bg-gray-800 rounded-xl">
            <table className="w-full text-sm text-left">
              <thead className="text-gray-400 border-b border-gray-700">
                <tr><th className="p-3">Téléphone</th><th className="p-3">Nom</th><th className="p-3">Réservations</th><th className="p-3">Inscrit le</th><th className="p-3"></th></tr>
              </thead>
              <tbody>
                {clients.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-400">Aucun client</td></tr>}
                {clients.map((c) => (
                  <tr key={c.telephone} className="border-b border-gray-700/50">
                    <td className="p-3">{c.telephone}</td>
                    <td className="p-3">{c.nom}</td>
                    <td className="p-3">{c.nb_reservations}</td>
                    <td className="p-3">{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="p-3"><button onClick={() => reset(c)} className="text-orange-400 hover:text-orange-300">Réinitialiser le mot de passe</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminPanel;
