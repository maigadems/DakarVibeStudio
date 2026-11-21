// Bandeau « Installer l'application » + « Activer les notifications sur ce téléphone »
import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Download, Share, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { useToast } from '../context/ToastContext';
import { cx } from '../lib/format';
import { type AppKind, disablePush, enablePush, isIOS, isStandalone, pushSupported, syncPush, useInstallPrompt } from '../lib/pwa';
import { Button } from './ui';

const DISMISS_KEY = 'westaf_prompt_dismissed';
const readDismissed = (k: string) => { try { return localStorage.getItem(`${DISMISS_KEY}:${k}`) === '1'; } catch { return false; } };
const writeDismissed = (k: string) => { try { localStorage.setItem(`${DISMISS_KEY}:${k}`, '1'); } catch { /* stockage indisponible */ } };

export const AppPrompts: React.FC<{ app: AppKind; tone?: 'dark' | 'light' }> = ({ app }) => {
  const { user } = useAuth();
  const { googleClientId, ...cfg } = useConfig() as any;
  const vapid: string | null = cfg.vapidPublicKey || null;
  const toast = useToast();
  const { canInstall, iosHint, install } = useInstallPrompt();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() => (pushSupported() ? Notification.permission : 'unsupported'));
  const [hidden, setHidden] = useState(() => readDismissed(app));
  const [busy, setBusy] = useState(false);

  // Abonnement resynchronisé à chaque connexion si l'autorisation a déjà été donnée
  useEffect(() => { if (user && vapid) syncPush(vapid, app); }, [user?.id, vapid, app]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user || hidden) return null;
  // Sur iPhone, les notifications ne fonctionnent que dans l'application installée (écran d'accueil)
  const iosNeedsInstall = isIOS() && !isStandalone();
  const showPush = !!vapid && permission === 'default' && !iosNeedsInstall;
  const showInstall = canInstall || iosHint;
  if (!showPush && !showInstall) return null;

  const activate = async () => {
    setBusy(true);
    try {
      const p = await enablePush(vapid!, app);
      setPermission(p);
      toast(p === 'granted' ? 'Notifications activées sur cet appareil' : 'Notifications refusées : modifiable dans les réglages du navigateur', p === 'granted' ? 'success' : 'info');
    } catch (e: any) { toast(e.message || 'Activation impossible', 'error'); } finally { setBusy(false); }
  };

  return (
    <div className="mb-6 flex animate-fade-up flex-col gap-3 rounded-2xl border border-ember/30 bg-gradient-to-r from-ember/15 to-transparent p-4 sm:flex-row sm:items-center">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ember/20 text-ember">{showPush ? <Bell className="h-5 w-5" /> : <Download className="h-5 w-5" />}</span>
      <div className="min-w-0 flex-1 text-sm">
        {showPush ? (
          <><p className="font-semibold">Recevoir les notifications sur cet appareil</p>
            <p className="text-bone-400">{app === 'admin' ? 'Nouvelles réservations, paiements, demandes d’espèces, reports… directement sur l’écran de votre téléphone.' : 'Confirmations, rappels de session et paiements directement sur votre téléphone.'}</p></>
        ) : iosHint ? (
          <><p className="font-semibold">Installer l’application {app === 'admin' ? 'Westaf Admin' : 'Westaf Records'}</p>
            <p className="text-bone-400">Touchez <Share className="inline h-3.5 w-3.5" /> Partager puis « Sur l’écran d’accueil »{app === 'admin' ? ' : les notifications pourront ensuite être activées.' : '.'}</p></>
        ) : (
          <><p className="font-semibold">Installer l’application {app === 'admin' ? 'Westaf Admin' : 'Westaf Records'}</p>
            <p className="text-bone-400">Accès en un geste depuis l’écran d’accueil, comme une application.</p></>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {showPush && <Button size="sm" loading={busy} icon={<Bell className="h-4 w-4" />} onClick={activate}>Activer</Button>}
        {!showPush && canInstall && <Button size="sm" icon={<Download className="h-4 w-4" />} onClick={async () => { if (await install()) toast('Application installée'); }}>Installer</Button>}
        <button onClick={() => { writeDismissed(app); setHidden(true); }} className="rounded-full p-2 text-bone-600 hover:bg-ink-700 hover:text-bone" aria-label="Masquer"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
};

// Réglage dans le profil / les paramètres : activer ou couper les notifications de cet appareil
export const PushToggle: React.FC<{ app: AppKind }> = ({ app }) => {
  const cfg = useConfig() as any;
  const toast = useToast();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() => (pushSupported() ? Notification.permission : 'unsupported'));
  const [busy, setBusy] = useState(false);
  if (!cfg.vapidPublicKey) return <p className="text-sm text-bone-600">Les notifications push ne sont pas encore configurées sur le serveur.</p>;
  if (permission === 'unsupported') return <p className="text-sm text-bone-600">{isIOS() ? 'Sur iPhone, installez d’abord l’application sur l’écran d’accueil (Partager → Sur l’écran d’accueil).' : 'Ce navigateur ne prend pas en charge les notifications.'}</p>;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className={cx('inline-flex items-center gap-2 text-sm', permission === 'granted' ? 'text-sage' : 'text-bone-400')}>
        {permission === 'granted' ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        {permission === 'granted' ? 'Activées sur cet appareil' : permission === 'denied' ? 'Bloquées dans les réglages du navigateur' : 'Désactivées'}
      </span>
      {permission !== 'granted' && permission !== 'denied' && (
        <Button size="sm" loading={busy} onClick={async () => { setBusy(true); try { setPermission(await enablePush(cfg.vapidPublicKey, app)); } catch (e: any) { toast(e.message, 'error'); } finally { setBusy(false); } }}>Activer</Button>
      )}
      {permission === 'granted' && (
        <Button size="sm" variant="ghost" loading={busy} onClick={async () => { setBusy(true); await disablePush(); toast('Notifications coupées sur cet appareil'); setBusy(false); }}>Couper sur cet appareil</Button>
      )}
    </div>
  );
};
