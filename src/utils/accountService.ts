import { adminFetch, apiUrl, type Reservation } from './reservationService';

export interface ClientProfile {
  telephone: string;
  nom: string | null;
  reservations: Reservation[];
}

export interface AdminOverview {
  totalReservations: number;
  encaisse: number;
  soldeAEncaisser: number;
  encaisseMois: number;
  aVenir: number;
  annulees: number;
  clients: number;
}

export interface AdminClient {
  telephone: string;
  nom: string | null;
  created_at: string;
  nb_reservations: number;
}

export type Result<T = undefined> = { ok: true; data: T } | { ok: false; message: string };

const request = async <T>(path: string, init: RequestInit = {}, token?: string | null): Promise<Result<T>> => {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = ['Bearer', token].join(' ');
    const res = await fetch(apiUrl(path), { ...init, headers });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, message: body.message || 'Une erreur est survenue' };
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, message: 'Impossible de joindre le serveur' };
  }
};

// Jeton client en mémoire de session (sessionStorage), jamais en localStorage
const CLIENT_TOKEN_KEY = 'westaf_client_token';
const getClientToken = () => sessionStorage.getItem(CLIENT_TOKEN_KEY);

export const hasClientSession = () => !!getClientToken();
export const clientLogout = () => sessionStorage.removeItem(CLIENT_TOKEN_KEY);

export const clientLogin = async (telephone: string, password: string) => {
  const r = await request<{ token: string }>('/client/login', {
    method: 'POST',
    body: JSON.stringify({ telephone, password })
  });
  if (r.ok) sessionStorage.setItem(CLIENT_TOKEN_KEY, r.data.token);
  return r;
};

export const clientMe = async () => {
  const r = await request<ClientProfile>('/client/me', {}, getClientToken());
  if (!r.ok) clientLogout();
  return r;
};

export const clientChangePassword = (oldPassword: string, newPassword: string) =>
  request('/client/password', { method: 'POST', body: JSON.stringify({ oldPassword, newPassword }) }, getClientToken());

export const fetchCredentials = (k: string) =>
  fetch(apiUrl(`/client/credentials?k=${encodeURIComponent(k)}`))
    .then(async (res) =>
      res.status === 200
        ? ((await res.json()) as { telephone: string; password: string | null })
        : res.status === 202
          ? 'pending'
          : null
    )
    .catch(() => null);

const adminJson = async <T>(path: string, init: RequestInit = {}): Promise<Result<T>> => {
  try {
    const res = await adminFetch(path, init);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, message: res.status === 401 ? 'Session expirée' : body.message || 'Erreur' };
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, message: 'Impossible de joindre le serveur' };
  }
};

export const adminOverview = () => adminJson<AdminOverview>('/admin/overview');
export const adminClients = () => adminJson<{ clients: AdminClient[] }>('/admin/clients');
export const adminResetClientPassword = (telephone: string) =>
  adminJson<{ password: string }>(`/admin/clients/${encodeURIComponent(telephone)}/reset-password`, { method: 'POST' });
