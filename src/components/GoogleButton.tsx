// Bouton « Continuer avec Google » (Google Identity Services).
// Le jeton d'identité est vérifié côté serveur ; seul l'ID client public est utilisé ici.
import React, { useEffect, useRef, useState } from 'react';
import { useConfig } from '../context/ConfigContext';

declare global {
  interface Window { google?: any }
}

let scriptPromise: Promise<void> | null = null;
const loadScript = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => { scriptPromise = null; reject(new Error('Google indisponible')); };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
};

export const GoogleButton: React.FC<{ onCredential: (c: string) => void; text?: 'signin_with' | 'signup_with' | 'continue_with' }> = ({ onCredential, text = 'continue_with' }) => {
  const { googleClientId, loaded } = useConfig();
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onCredential);
  cb.current = onCredential;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!googleClientId || !ref.current) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !ref.current) return;
        window.google.accounts.id.initialize({ client_id: googleClientId, callback: (r: any) => r?.credential && cb.current(r.credential), ux_mode: 'popup' });
        window.google.accounts.id.renderButton(ref.current, {
          theme: 'filled_black', size: 'large', shape: 'pill', text, logo_alignment: 'center', width: Math.min(ref.current.offsetWidth || 360, 400), locale: 'fr'
        });
      })
      .catch(() => setFailed(true));
    return () => { cancelled = true; };
  }, [googleClientId, text]);

  if (!loaded || !googleClientId) return null;
  if (failed) return <p className="text-center text-xs text-bone-600">Connexion Google momentanément indisponible.</p>;
  return <div ref={ref} className="flex min-h-[44px] w-full justify-center" />;
};

export const OrDivider: React.FC = () => {
  const { googleClientId } = useConfig();
  if (!googleClientId) return null;
  return (
    <div className="my-6 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-widest text-bone-600">
      <span className="h-px flex-1 bg-ink-600" />ou<span className="h-px flex-1 bg-ink-600" />
    </div>
  );
};
