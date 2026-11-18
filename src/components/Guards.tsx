import React, { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { homeFor, useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { Role, User } from '../lib/types';
import { Alert, Button, Field, Modal, Spinner } from './ui';
import { PasswordInput } from '../pages/auth/AuthPages';

// Protection des routes par rôle (l'API applique les mêmes règles côté serveur)
export const RequireRole: React.FC<{ roles: Role[]; loginPath?: string; children?: React.ReactNode }> = ({ roles, loginPath = '/connexion', children }) => {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <div className="flex min-h-screen items-center justify-center"><Spinner /></div>;
  if (!user) return <Navigate to={`${loginPath}?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (!roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  return <>{children ?? <Outlet />}</>;
};

// Changement obligatoire du mot de passe provisoire (comptes créés par l'administration)
export const ForcePasswordChange: React.FC = () => {
  const { user, applySession } = useAuth();
  const [f, setF] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!user?.must_change_password) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (f.next !== f.confirm) return setError('Les mots de passe ne correspondent pas');
    setBusy(true);
    try {
      applySession(await api<{ token: string; user: User }>('/auth/change-password', { method: 'POST', body: { current_password: f.current, new_password: f.next } }));
    } catch (err: any) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <Modal open onClose={() => {}} size="sm" title={<span className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-ember" />Choisissez votre mot de passe</span>}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-bone-400">Votre compte a été créé avec un mot de passe provisoire. Remplacez-le pour continuer.</p>
        {error && <Alert>{error}</Alert>}
        <Field label="Mot de passe provisoire"><PasswordInput required value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} autoComplete="current-password" /></Field>
        <Field label="Nouveau mot de passe" hint="8 caractères minimum, une lettre et un chiffre"><PasswordInput required value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} autoComplete="new-password" /></Field>
        <Field label="Confirmer"><PasswordInput required value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} autoComplete="new-password" /></Field>
        <Button type="submit" className="w-full" loading={busy}>Enregistrer</Button>
      </form>
    </Modal>
  );
};
