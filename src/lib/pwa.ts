// Applications installables (PWA) et notifications push.
//  - « Westaf Records » (clients) : blanche  → manifest-client.webmanifest
//  - « Westaf Admin » (équipe : /admin, /ingenieur) : noire → manifest-admin.webmanifest
import { useEffect, useState } from 'react';
import { api } from './api';

export type AppKind = 'client' | 'admin';
export const appForPath = (path: string): AppKind => (path.startsWith('/admin') || path.startsWith('/ingenieur') ? 'admin' : 'client');

const setLink = (rel: string, href: string) => {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) { el = document.createElement('link'); el.rel = rel; document.head.appendChild(el); }
  if (el.getAttribute('href') !== href) el.href = href;
};
const setMeta = (name: string, content: string) => {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
  el.content = content;
};

/** Fiche d'application, couleur de la barre d'état et icône selon la page affichée. */
export const applyAppIdentity = (path: string) => {
  const app = appForPath(path);
  setLink('manifest', app === 'admin' ? '/manifest-admin.webmanifest' : '/manifest-client.webmanifest');
  setLink('apple-touch-icon', app === 'admin' ? '/icons/admin-apple-180.png' : '/icons/client-apple-180.png');
  setMeta('theme-color', app === 'admin' ? '#09090a' : '#ffffff');
  setMeta('apple-mobile-web-app-title', app === 'admin' ? 'Westaf Admin' : 'Westaf Records');
  setMeta('apple-mobile-web-app-status-bar-style', app === 'admin' ? 'black' : 'default');
};

export const registerServiceWorker = () => {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); });
};

export const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone === true;
export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// --- Installation (Android / ordinateur : invite native ; iPhone : instructions) ---
let deferredPrompt: any = null;
const listeners = new Set<() => void>();
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; listeners.forEach((l) => l()); });
  window.addEventListener('appinstalled', () => { deferredPrompt = null; listeners.forEach((l) => l()); });
}

export const useInstallPrompt = () => {
  const [, force] = useState(0);
  useEffect(() => { const l = () => force((n) => n + 1); listeners.add(l); return () => { listeners.delete(l); }; }, []);
  return {
    canInstall: !!deferredPrompt && !isStandalone(),
    iosHint: isIOS() && !isStandalone(),
    install: async () => {
      if (!deferredPrompt) return false;
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice.catch(() => null);
      deferredPrompt = null;
      listeners.forEach((l) => l());
      return choice?.outcome === 'accepted';
    }
  };
};

// --- Notifications push ---
export const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

const urlBase64ToUint8Array = (base64: string) => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

/** Demande l'autorisation puis abonne cet appareil aux notifications de l'utilisateur connecté. */
export const enablePush = async (vapidPublicKey: string, app: AppKind): Promise<NotificationPermission> => {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission;
  const reg = await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) ||
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) }));
  await api('/auth/push/subscribe', { method: 'POST', body: { subscription: sub.toJSON(), app } });
  return permission;
};

/** Ré-enregistre silencieusement l'abonnement si l'autorisation est déjà accordée (ex. après reconnexion). */
export const syncPush = async (vapidPublicKey: string, app: AppKind) => {
  if (!pushSupported() || Notification.permission !== 'granted') return;
  try { await enablePush(vapidPublicKey, app); } catch { /* sans effet si le navigateur refuse */ }
};

export const disablePush = async () => {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    await api('/auth/push/unsubscribe', { method: 'POST', body: { endpoint: sub.endpoint } }).catch(() => {});
    await sub.unsubscribe().catch(() => {});
  }
};
