import { useCallback, useEffect, useRef, useState } from 'react';

// Chargement de données avec états de chargement / erreur et rechargement
// Cache local (mémoire + stockage du navigateur) : la page affiche tout de suite les dernières données
// connues, puis les met à jour en arrière-plan. Propre à chaque compte, vidé à la déconnexion.
export const DATA_CACHE_PREFIX = 'westaf_dc:';
const memCache = new Map<string, unknown>();
const scope = () => { try { return (localStorage.getItem('westaf_token') || 'anon').slice(-16); } catch { return 'anon'; } };
const readCache = <T,>(key: string): T | null => {
  if (memCache.has(key)) return memCache.get(key) as T;
  try { const v = localStorage.getItem(DATA_CACHE_PREFIX + key); if (v) { const d = JSON.parse(v) as T; memCache.set(key, d); return d; } } catch { /* indisponible */ }
  return null;
};
const writeCache = (key: string, data: unknown) => {
  memCache.set(key, data);
  try { const s = JSON.stringify(data); if (s.length < 300000) localStorage.setItem(DATA_CACHE_PREFIX + key, s); } catch { /* plein ou indisponible */ }
};
export const clearDataCache = () => {
  memCache.clear();
  try { Object.keys(localStorage).filter((k) => k.startsWith(DATA_CACHE_PREFIX)).forEach((k) => localStorage.removeItem(k)); } catch { /* indisponible */ }
};
const hashKey = (s: string) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const keyFor = () => { try { return `${scope()}:${hashKey(fn.toString() + JSON.stringify(deps))}`; } catch { return null; } };
  const initialKey = keyFor();
  const initial = initialKey ? readCache<T>(initialKey) : null;
  const [data, setData] = useState<T | null>(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initial);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const keyRef = useRef(initialKey);
  keyRef.current = keyFor();

  const reload = useCallback(async () => {
    const key = keyRef.current;
    const cached = key ? readCache<T>(key) : null;
    // Données déjà connues : affichées immédiatement, sans écran de chargement
    if (cached) { setData(cached); setLoading(false); } else setLoading(true);
    setError(null);
    try {
      const fresh = await fnRef.current();
      setData(fresh);
      if (key) writeCache(key, fresh);
    } catch (e: any) {
      if (!cached) setError(e?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading, reload, setData };
}

// Animation d'apparition au défilement (classe .reveal)
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = [el, ...Array.from(el.querySelectorAll<HTMLElement>('.reveal'))].filter((t) => t.classList.contains('reveal'));
    if (!('IntersectionObserver' in window)) {
      targets.forEach((t) => t.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  });
  return ref;
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} — Westaf Records` : 'Westaf Records — Studio d’enregistrement à Dakar';
  }, [title]);
}

export function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
