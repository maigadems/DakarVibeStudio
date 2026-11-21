import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, MailCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { useDocumentTitle } from '../../lib/hooks';
import { homeFor, useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import { Alert, Button, Field, Input, Spinner } from '../../components/ui';
import { GoogleButton, OrDivider } from '../../components/GoogleButton';
import type { User } from '../../lib/types';

export const AuthShell: React.FC<{ title: string; subtitle?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode }> = ({ title, subtitle, children, footer }) => {
  const { settings } = useConfig();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-ink-900" />
        <img src="/westaf-studio-1200.jpg" alt="" className="absolute left-1/2 top-1/2 w-[85%] -translate-x-1/2 -translate-y-1/2 opacity-25 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/20 via-ink/50 to-ink" />
        <div className="absolute -left-20 bottom-0 h-96 w-96 rounded-full bg-ember/25 blur-[120px]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="" className="h-11 w-11 rounded-full ring-1 ring-ember/40" />
            <span className="font-display text-sm font-bold uppercase tracking-[0.14em]">{settings.studio_name}</span>
          </Link>
          <div>
            <p className="font-display text-5xl font-semibold leading-[1.05]">Votre son,<br /><span className="serif-accent text-gradient">votre espace.</span></p>
            <p className="mt-5 max-w-sm text-bone-200">Réservez, reportez et réglez vos sessions depuis votre compte, à tout moment.</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Link to="/" className="mb-10 inline-flex w-fit items-center gap-2 text-sm text-bone-400 hover:text-bone"><ArrowLeft className="h-4 w-4" />Retour au site</Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center pb-10">
          <h1 className="animate-fade-up text-3xl font-semibold sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-3 animate-fade-up text-bone-400" style={{ animationDelay: '60ms' }}>{subtitle}</p>}
          <div className="mt-8 animate-fade-up" style={{ animationDelay: '120ms' }}>{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-bone-400">{footer}</div>}
        </div>
      </div>
    </div>
  );
};

export const PasswordInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (p) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...p} type={show ? 'text' : 'password'} className="pr-12" />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-bone-600 hover:text-bone" aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};

const passwordProblem = (p: string) => (p.length < 8 ? '8 caractères minimum' : !/[A-Za-z]/.test(p) || !/\d/.test(p) ? 'Au moins une lettre et un chiffre' : null);

// Redirection après connexion : page demandée (si autorisée) ou espace du rôle
const useAfterLogin = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const location = useLocation() as any;
  return (u: User) => {
    const target = params.get('redirect') || location.state?.from;
    const allowed = target && target.startsWith('/') && !target.startsWith('//') &&
      (u.role === 'client' ? !target.startsWith('/admin') && !target.startsWith('/ingenieur') : true);
    navigate(allowed ? target : homeFor(u.role), { replace: true });
  };
};

export const Login: React.FC = () => {
  useDocumentTitle('Connexion');
  const { login, loginWithGoogle, user, ready } = useAuth();
  const after = useAfterLogin();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) after(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try { after(await login(email, password)); } catch (err: any) { setError(err.message); } finally { setBusy(false); }
  };
  const google = async (c: string) => {
    setError(null);
    try { after(await loginWithGoogle(c)); } catch (err: any) { setError(err.message); }
  };
  const redirect = params.get('redirect');

  return (
    <AuthShell title="Bon retour" subtitle="Connectez-vous pour réserver et suivre vos sessions."
      footer={<>Pas encore de compte ? <Link className="font-semibold text-bone hover:text-ember" to={`/inscription${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}>Créer un compte</Link></>}>
      <GoogleButton onCredential={google} text="signin_with" />
      <OrDivider />
      <form onSubmit={submit} className="space-y-5">
        {error && <Alert>{error}</Alert>}
        <Field label="Adresse e-mail" htmlFor="email" hint="Ancien compte créé avec votre numéro ? Saisissez votre numéro de téléphone.">
          <Input id="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" />
        </Field>
        <Field label="Mot de passe" htmlFor="password">
          <PasswordInput id="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <div className="flex justify-end"><Link to="/mot-de-passe-oublie" className="text-sm text-bone-400 hover:text-ember">Mot de passe oublié ?</Link></div>
        <Button type="submit" size="lg" loading={busy} className="w-full">Se connecter</Button>
      </form>
    </AuthShell>
  );
};

export const Register: React.FC = () => {
  useDocumentTitle('Créer un compte');
  const { register, loginWithGoogle } = useAuth();
  const after = useAfterLogin();
  const [params] = useSearchParams();
  const [f, setF] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const pwdIssue = f.password ? passwordProblem(f.password) : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (pwdIssue) return setError(`Mot de passe : ${pwdIssue}`);
    if (f.password !== f.confirm) return setError('Les mots de passe ne correspondent pas');
    setBusy(true);
    try {
      after(await register({ first_name: f.first_name, last_name: f.last_name, email: f.email, phone: f.phone, password: f.password }));
    } catch (err: any) { setError(err.message); } finally { setBusy(false); }
  };
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const redirect = params.get('redirect');

  return (
    <AuthShell title="Créer votre compte" subtitle="Quelques secondes suffisent pour réserver votre première session."
      footer={<>Déjà inscrit ? <Link className="font-semibold text-bone hover:text-ember" to={`/connexion${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}>Se connecter</Link></>}>
      <GoogleButton onCredential={async (c) => { try { after(await loginWithGoogle(c)); } catch (err: any) { setError(err.message); } }} text="signup_with" />
      <OrDivider />
      <form onSubmit={submit} className="space-y-5">
        {error && <Alert>{error}</Alert>}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Prénom"><Input required autoComplete="given-name" value={f.first_name} onChange={set('first_name')} /></Field>
          <Field label="Nom"><Input required autoComplete="family-name" value={f.last_name} onChange={set('last_name')} /></Field>
        </div>
        <Field label="Adresse e-mail"><Input required type="email" autoComplete="email" value={f.email} onChange={set('email')} /></Field>
        <Field label="Téléphone WhatsApp" hint="Pour vos confirmations et rappels de session (facultatif maintenant, requis pour réserver).">
          <Input type="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} placeholder="77 000 00 00" />
        </Field>
        <Field label="Mot de passe" error={pwdIssue}><PasswordInput required autoComplete="new-password" value={f.password} onChange={set('password')} /></Field>
        <Field label="Confirmer le mot de passe"><PasswordInput required autoComplete="new-password" value={f.confirm} onChange={set('confirm')} /></Field>
        <Button type="submit" size="lg" loading={busy} className="w-full">Créer mon compte</Button>
      </form>
    </AuthShell>
  );
};

export const ForgotPassword: React.FC = () => {
  useDocumentTitle('Mot de passe oublié');
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api('/auth/forgot-password', { method: 'POST', body: { email }, auth: false });
      setDone(true);
    } catch (err: any) { setError(err.message); } finally { setBusy(false); }
  };
  return (
    <AuthShell title="Mot de passe oublié" subtitle="Indiquez votre adresse e-mail : nous vous envoyons un lien sécurisé pour définir un nouveau mot de passe."
      footer={<Link to="/connexion" className="font-semibold text-bone hover:text-ember">Retour à la connexion</Link>}>
      {done ? (
        <div className="card flex flex-col items-center gap-4 p-8 text-center">
          <MailCheck className="h-10 w-10 text-ember" />
          <p className="font-display text-lg font-semibold">Vérifiez votre boîte mail</p>
          <p className="text-sm text-bone-400">Si un compte correspond à <strong className="text-bone">{email}</strong>, un lien valable 1 heure vient d’être envoyé. Pensez aux courriers indésirables.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          {error && <Alert>{error}</Alert>}
          <Field label="Adresse e-mail"><Input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Button type="submit" size="lg" loading={busy} className="w-full">Envoyer le lien</Button>
        </form>
      )}
    </AuthShell>
  );
};

export const ResetPassword: React.FC = () => {
  useDocumentTitle('Nouveau mot de passe');
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const { applySession } = useAuth();
  const navigate = useNavigate();
  const [valid, setValid] = useState<boolean | null>(null);
  const [p, setP] = useState({ password: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!/^[a-f0-9]{64}$/.test(token)) return setValid(false);
    api<{ valid: boolean }>(`/auth/reset-password/${token}`, { auth: false }).then((r) => setValid(r.valid)).catch(() => setValid(false));
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const issue = passwordProblem(p.password);
    if (issue) return setError(`Mot de passe : ${issue}`);
    if (p.password !== p.confirm) return setError('Les mots de passe ne correspondent pas');
    setBusy(true);
    setError(null);
    try {
      const s = await api<{ token: string; user: User }>('/auth/reset-password', { method: 'POST', body: { token, password: p.password }, auth: false });
      navigate(homeFor(applySession(s).role), { replace: true });
    } catch (err: any) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <AuthShell title="Nouveau mot de passe" subtitle="Choisissez un mot de passe d’au moins 8 caractères, avec une lettre et un chiffre.">
      {valid === null && <Spinner />}
      {valid === false && (
        <div className="space-y-5">
          <Alert>Ce lien est invalide ou a expiré.</Alert>
          <Button to="/mot-de-passe-oublie" variant="subtle" className="w-full">Faire une nouvelle demande</Button>
        </div>
      )}
      {valid && (
        <form onSubmit={submit} className="space-y-5">
          {error && <Alert>{error}</Alert>}
          <Field label="Nouveau mot de passe"><PasswordInput required autoComplete="new-password" value={p.password} onChange={(e) => setP({ ...p, password: e.target.value })} /></Field>
          <Field label="Confirmer"><PasswordInput required autoComplete="new-password" value={p.confirm} onChange={(e) => setP({ ...p, confirm: e.target.value })} /></Field>
          <Button type="submit" size="lg" loading={busy} className="w-full">Enregistrer et me connecter</Button>
        </form>
      )}
    </AuthShell>
  );
};
