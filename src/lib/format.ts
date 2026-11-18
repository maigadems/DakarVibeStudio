// Les dates de l'API sont en heure du studio (Dakar, UTC+0) au format "YYYY-MM-DD HH:MM:SS".
// On les affiche telles quelles, quel que soit le fuseau du navigateur.
export const parseSql = (s?: string | null) => (s ? new Date(`${String(s).slice(0, 19).replace(' ', 'T')}${String(s).length <= 10 ? 'T00:00:00' : ''}Z`) : null);

const fmt = (s: string | null | undefined, o: Intl.DateTimeFormatOptions) => {
  const d = parseSql(s);
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleString('fr-FR', { ...o, timeZone: 'UTC' }) : '';
};

export const fDate = (s?: string | null) => fmt(s, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
export const fDateShort = (s?: string | null) => fmt(s, { weekday: 'short', day: 'numeric', month: 'short' });
export const fDateNum = (s?: string | null) => fmt(s, { day: '2-digit', month: '2-digit', year: 'numeric' });
export const fTime = (s?: string | null) => (s ? String(s).slice(11, 16).replace(':', 'h') : '');
export const fDateTime = (s?: string | null) => (s ? `${fDateShort(s)} · ${fTime(s)}` : '');
export const fRange = (a?: string | null, b?: string | null) => (a ? `${fTime(a)} – ${fTime(b)}` : '');

// created_at des notifications / historique : horodatage UTC
export const fAgo = (s?: string | null) => {
  const d = parseSql(s);
  if (!d) return '';
  const min = Math.round((Date.now() - d.getTime()) / 60000);
  if (min < 1) return 'à l’instant';
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const days = Math.round(h / 24);
  if (days < 7) return `il y a ${days} j`;
  return fDateNum(s);
};

export const fcfa = (n?: number | null) => `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;

export const phoneDisplay = (p?: string | null) => {
  if (!p) return '';
  let d = String(p).replace(/\D/g, '');
  if (d.length === 9) d = `221${d}`; // numéro local sénégalais saisi sans indicatif
  if (d.startsWith('221') && d.length === 12) return `+221 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10)}`;
  return `+${d}`;
};

// Aujourd'hui en heure du studio
export const studioToday = () => new Date().toISOString().slice(0, 10);
export const studioNow = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

export const addDaysStr = (date: string, n: number) => {
  const d = parseSql(date)!;
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export const startOfWeek = (date: string) => {
  const d = parseSql(date)!;
  const day = (d.getUTCDay() + 6) % 7; // lundi = 0
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
};

export const weekdayFr = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export const fullName = (u?: { first_name?: string; last_name?: string } | null) => `${u?.first_name || ''} ${u?.last_name || ''}`.trim();

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
