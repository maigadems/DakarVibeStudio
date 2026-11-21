// WhatsApp manuel : ouvre WhatsApp avec le message déjà rédigé, la personne n'a plus qu'à appuyer sur Envoyer.
import type { Reservation } from './types';
import { fDate, fTime, fcfa } from './format';

/** Lien wa.me vers un numéro sénégalais ou international (9 chiffres = numéro local, +221 ajouté). */
export const waLink = (phone: string | null | undefined, text: string) => {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 9) d = `221${d}`;
  return d ? `https://wa.me/${d}?text=${encodeURIComponent(text)}` : null;
};

const firstName = (r: Reservation) => (r.client_first_name || r.nom || '').split(' ')[0];
const when = (r: Reservation) => (r.start_at ? `${fDate(r.start_at)} de ${fTime(r.start_at)} à ${fTime(r.end_at!)}` : '');

/** Messages prêts à envoyer au client depuis la fiche réservation (admin). */
export const clientMessages = (r: Reservation, opts: { origin: string; mapsUrl?: string | null; studio?: string }) => {
  const studio = opts.studio || 'Westaf Records';
  const payUrl = r.action_token ? `${opts.origin}/paiement/${r.action_token}` : null;
  const maps = opts.mapsUrl ? `\nItinéraire : ${opts.mapsUrl}` : '';
  const list: { id: string; label: string; text: string }[] = [];
  if (r.start_at) {
    list.push({ id: 'confirm', label: 'Confirmation', text: `Bonjour ${firstName(r)}, votre réservation chez ${studio} est confirmée : ${r.service_name}, ${when(r)}.${maps}\nÀ bientôt !` });
    list.push({ id: 'reminder', label: 'Rappel', text: `Bonjour ${firstName(r)}, petit rappel : votre session ${r.service_name} est prévue ${when(r)}.${maps}\nÀ tout à l’heure !` });
  } else {
    list.push({ id: 'confirm', label: 'Confirmation', text: `Bonjour ${firstName(r)}, votre commande « ${r.service_name} » chez ${studio} est bien enregistrée. Nous vous tenons informé(e) à chaque étape.` });
  }
  if (payUrl && (r.solde || 0) > 0 && r.statut !== 'annulee') {
    list.push({ id: 'pay', label: 'Lien de paiement', text: `Bonjour ${firstName(r)}, voici le lien pour régler ${fcfa(r.solde)} pour « ${r.service_name} » (Wave, Orange Money, carte) :\n${payUrl}` });
  }
  return list;
};
