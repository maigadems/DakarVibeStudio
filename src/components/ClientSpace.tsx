import React, { useEffect, useState } from 'react';
import { clientChangePassword, clientLogin, clientLogout, clientMe, hasClientSession, type ClientProfile } from '../utils/accountService';

const STATUT: Record<string, string> = { confirmee: 'Confirmée', en_attente: 'En attente', annulee: 'Annulée' };
const SERVICE: Record<string, string> = { horaire: 'Réservation horaire', mixage: 'Mixage', mastering: 'Mastering' };
const fmt = (n: number) => Number(n).toLocaleString('fr-FR');

const inputCls = 'w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500';

const ClientSpace: React.FC<{ goToReservation: () => void }> = ({ goToReservation }) => {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(hasClientSession());
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = async () => {
    const r = await clientMe();
    setProfile(r.ok ? r.data : null);
    setLoading(false);
  };

  useEffect(() => {
    if (hasClientSession()) load();
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const r = await clientLogin(telephone, password);
    if (!r.ok) return setError(r.message);
    setPassword('');
    setLoading(true);
    load();
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await clientChangePassword(oldPwd, newPwd);
    setPwdMsg({ ok: r.ok, text: r.ok ? 'Mot de passe modifié.' : r.message });
    if (r.ok) {
      setOldPwd('');
      setNewPwd('');
      load();
    }
  };

  const logout = () => {
    clientLogout();
    setProfile(null);
  };

  return (
    <section className="pt-28 pb-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Espace client</h1>

        {loading ? (
          <p className="text-gray-400">Chargement…</p>
        ) : !profile ? (
          <form onSubmit={login} className="bg-gray-800 rounded-2xl p-6 max-w-md space-y-4">
            <p className="text-gray-300 text-sm">
              Connectez-vous avec votre numéro de téléphone et le mot de passe reçu après votre première réservation.
            </p>
            <input className={inputCls} placeholder="Numéro de téléphone" value={telephone} onChange={(e) => setTelephone(e.target.value)} autoComplete="username" required />
            <input className={inputCls} type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button className="w-full bg-orange-500 hover:bg-orange-600 rounded-lg py-3 font-semibold">Se connecter</button>
          </form>
        ) : profile.mustChange ? (
          <form onSubmit={changePassword} className="bg-gray-800 rounded-2xl p-6 max-w-md space-y-3 border border-orange-500/50">
            <h2 className="text-xl font-semibold text-orange-400">Bienvenue ! Sécurisez votre compte</h2>
            <p className="text-sm text-gray-300">
              C'est votre première connexion : choisissez un nouveau mot de passe personnel pour accéder à votre espace.
            </p>
            <input className={inputCls} type="password" placeholder="Mot de passe reçu (actuel)" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} autoComplete="current-password" required />
            <input className={inputCls} type="password" placeholder="Nouveau mot de passe (8 caractères min.)" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} autoComplete="new-password" minLength={8} required />
            {pwdMsg && <p className={`text-sm ${pwdMsg.ok ? 'text-green-400' : 'text-red-400'}`}>{pwdMsg.text}</p>}
            <div className="flex items-center gap-4">
              <button className="bg-orange-500 hover:bg-orange-600 rounded-lg px-6 py-3 font-semibold">Valider</button>
              <button type="button" onClick={logout} className="text-sm text-gray-400 hover:text-white underline">Déconnexion</button>
            </div>
          </form>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <p className="text-gray-300">
                Connecté : <strong>{profile.nom || profile.telephone}</strong> ({profile.telephone})
              </p>
              <button onClick={logout} className="text-sm text-gray-400 hover:text-white underline">Déconnexion</button>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Mes réservations</h2>
              {profile.reservations.length === 0 ? (
                <div className="bg-gray-800 rounded-xl p-6 text-gray-400">
                  Aucune réservation.{' '}
                  <button onClick={goToReservation} className="text-orange-400 underline">Réserver une session</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.reservations.map((r) => (
                    <div key={r.id} className="bg-gray-800 rounded-xl p-4 text-sm space-y-1">
                      <div className="flex justify-between">
                        <strong>{SERVICE[r.type_service] || r.type_service}</strong>
                        <span className={r.statut === 'annulee' ? 'text-red-400' : 'text-green-400'}>{STATUT[r.statut]}</span>
                      </div>
                      {r.type_service === 'horaire' ? (
                        <div className="text-gray-300">
                          {new Date(r.date_reservation + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          {r.creneaux?.length ? ` — ${r.creneaux.join(', ')}` : ''}
                        </div>
                      ) : (
                        <div className="text-gray-300">{r.nombre_titres} titre(s)</div>
                      )}
                      <div className="text-gray-400">
                        Total {fmt(r.montant_total)} FCFA —{' '}
                        {r.type_paiement === 'partiel'
                          ? `acompte payé ${fmt(r.montant_paye)} FCFA, reste ${fmt(r.montant_total - r.montant_paye)} FCFA au studio`
                          : 'payé en totalité'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={changePassword} className="bg-gray-800 rounded-2xl p-6 max-w-md space-y-3">
              <h2 className="text-xl font-semibold">Changer mon mot de passe</h2>
              <input className={inputCls} type="password" placeholder="Mot de passe actuel" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} autoComplete="current-password" required />
              <input className={inputCls} type="password" placeholder="Nouveau mot de passe (8 caractères min.)" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} autoComplete="new-password" minLength={8} required />
              {pwdMsg && <p className={`text-sm ${pwdMsg.ok ? 'text-green-400' : 'text-red-400'}`}>{pwdMsg.text}</p>}
              <button className="bg-orange-500 hover:bg-orange-600 rounded-lg px-6 py-3 font-semibold">Enregistrer</button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default ClientSpace;
