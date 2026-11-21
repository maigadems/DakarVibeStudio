// Client HTTP de l'API. Le jeton est conservé dans le navigateur (localStorage) pour
// que le client retrouve sa session ; aucune clé secrète n'est présente dans le frontend.
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'westaf_token';

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (t: string | null) => {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* stockage indisponible : session limitée à l'onglet */
  }
};

let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn;
};

type Options = { method?: string; body?: unknown; form?: FormData; auth?: boolean };

export async function api<T = any>(path: string, { method = 'GET', body, form, auth = true }: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (!form) headers['Content-Type'] = 'application/json';
  const token = auth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(API_URL + path, { method, headers, body: form || (body !== undefined ? JSON.stringify(body) : undefined) });
  } catch {
    throw new ApiError(0, 'Impossible de joindre le serveur. Vérifiez votre connexion.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized?.();
    throw new ApiError(res.status, data.message || 'Une erreur est survenue', data.code);
  }
  return data as T;
}

// Téléchargement d'un fichier protégé (ex. facture PDF) : le jeton est envoyé dans l'en-tête
export async function downloadFile(path: string, filename: string): Promise<void> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(API_URL + path, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  } catch {
    throw new ApiError(0, 'Impossible de joindre le serveur. Vérifiez votre connexion.');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && token) onUnauthorized?.();
    throw new ApiError(res.status, data.message || 'Téléchargement impossible');
  }
  // Nom de fichier fourni par le serveur (ex. facture-WR-2026-0001.pdf) si disponible
  const fromServer = /filename="?([^";]+)"?/.exec(res.headers.get('Content-Disposition') || '')?.[1];
  if (fromServer) filename = fromServer;
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// Images importées depuis l'administration (servies par l'API) ou fichiers du site
export const mediaUrl = (u?: string | null) => (!u ? '' : u.startsWith('/uploads/') ? API_URL + u : u);
