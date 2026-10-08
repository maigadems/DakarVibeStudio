const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const apiUrl = (path: string) => `${API_URL}${path}`;

export interface Reservation {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  message: string;
  date_reservation: string;
  creneaux: string[] | null;
  duree_heures: number | null;
  montant_total: number;
  statut: 'en_attente' | 'confirmee' | 'annulee';
  type_service: 'horaire' | 'mixage' | 'mastering';
  nombre_titres: number | null;
  created_at: string;
  updated_at: string;
}

let adminToken: string | null = null;

const adminFetch = (path: string, init: RequestInit = {}) =>
  fetch(apiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken ?? ''}`
    }
  });

export const adminLogin = async (login: string, password: string): Promise<boolean> => {
  try {
    const res = await fetch(apiUrl('/admin/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password })
    });
    if (!res.ok) return false;
    adminToken = (await res.json()).token;
    return true;
  } catch {
    return false;
  }
};

export const adminLogout = () => {
  adminToken = null;
};

export const getAllReservations = async (): Promise<Reservation[]> => {
  try {
    const res = await adminFetch('/admin/reservations');
    if (!res.ok) return [];
    return (await res.json()).reservations ?? [];
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    return [];
  }
};

export const getBookedSlotsForDate = async (date: string): Promise<string[]> => {
  try {
    const res = await fetch(apiUrl(`/reservations/slots?date=${encodeURIComponent(date)}`));
    if (!res.ok) return [];
    return (await res.json()).slots ?? [];
  } catch (error) {
    console.error('Erreur lors de la récupération des créneaux réservés:', error);
    return [];
  }
};

export const getReservationStats = async (): Promise<{
  totalReservations: number;
  totalSlots: number;
  totalRevenue: number;
  currentMonth: string;
}> => {
  const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  try {
    const res = await fetch(apiUrl('/reservations/stats'));
    if (!res.ok) throw new Error(String(res.status));
    return { ...(await res.json()), currentMonth };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return { totalReservations: 0, totalSlots: 0, totalRevenue: 0, currentMonth };
  }
};

export const updateReservationStatus = async (
  id: string,
  statut: 'en_attente' | 'confirmee' | 'annulee'
): Promise<boolean> => {
  try {
    const res = await adminFetch(`/admin/reservations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ statut })
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const deleteReservation = async (id: string): Promise<boolean> => {
  try {
    const res = await adminFetch(`/admin/reservations/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
};
