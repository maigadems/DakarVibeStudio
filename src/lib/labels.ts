import type { PaymentStatus, PresenceStatus, SessionStatus, Statut } from './types';

type Tone = 'neutral' | 'ember' | 'green' | 'amber' | 'red' | 'blue';

export const STATUT: Record<Statut, { label: string; tone: Tone }> = {
  en_attente: { label: 'Paiement en attente', tone: 'amber' },
  confirmee: { label: 'Confirmée', tone: 'green' },
  annulee: { label: 'Annulée', tone: 'red' },
  terminee: { label: 'Terminée', tone: 'neutral' },
  expiree: { label: 'Expirée', tone: 'neutral' },
  a_traiter: { label: 'À traiter', tone: 'red' }
};

export const PAYMENT: Record<PaymentStatus, { label: string; tone: Tone }> = {
  non_paye: { label: 'Non payé', tone: 'red' },
  acompte: { label: 'Acompte versé', tone: 'amber' },
  en_attente_validation: { label: 'En attente de validation', tone: 'blue' },
  paye: { label: 'Payé', tone: 'green' }
};

export const SESSION: Record<SessionStatus, { label: string; tone: Tone }> = {
  planifiee: { label: 'Planifiée', tone: 'neutral' },
  autorisee: { label: 'Autorisée à commencer', tone: 'green' },
  en_cours: { label: 'En cours', tone: 'ember' },
  terminee: { label: 'Terminée', tone: 'neutral' },
  absent: { label: 'Client absent', tone: 'red' },
  annulee: { label: 'Annulée', tone: 'red' }
};

export const PRESENCE: Record<PresenceStatus, { label: string; tone: Tone }> = {
  non_demandee: { label: 'Présence non demandée', tone: 'neutral' },
  demandee: { label: 'Confirmation demandée', tone: 'amber' },
  confirmee: { label: 'Présence confirmée', tone: 'green' },
  report_souhaite: { label: 'Souhaite reporter', tone: 'red' }
};

export const ROLE: Record<string, string> = {
  super_admin: 'Super administrateur',
  admin: 'Administrateur',
  engineer: 'Ingénieur du son',
  client: 'Client'
};

export const HISTORY: Record<string, string> = {
  created: 'Réservation créée',
  migration: 'Reprise depuis l’ancien système',
  payment_initial: 'Paiement à la réservation',
  payment_balance: 'Solde payé en ligne',
  cash_requested: 'Paiement en espèces demandé',
  cash_validated: 'Espèces reçues et validées',
  payment_link_sent: 'Lien de paiement envoyé',
  payment_link_failed: 'Échec d’envoi du lien de paiement',
  payment_conflict: 'Conflit de paiement',
  rescheduled: 'Session reportée',
  cancelled: 'Réservation annulée',
  expired: 'Expirée (paiement non finalisé)',
  engineer_assigned: 'Ingénieur affecté',
  engineer_unassigned: 'Ingénieur retiré',
  updated: 'Réservation modifiée',
  duration_changed: 'Durée modifiée',
  status_changed: 'Statut modifié',
  session_status: 'Statut de session',
  reminder_sent: 'Rappel WhatsApp envoyé',
  reminder_failed: 'Échec d’envoi du rappel',
  reminder_skipped: 'Rappel non nécessaire',
  presence_confirmed: 'Présence confirmée par le client',
  reschedule_requested: 'Le client souhaite reporter',
  milestone_requested: 'Paiement d’étape demandé',
  milestone_reminded: 'Relance de paiement d’étape',
  milestone_paid: 'Étape réglée',
  plan_updated: 'Échéancier modifié'
};

export const MILESTONE: Record<string, { label: string; tone: Tone }> = {
  a_venir: { label: 'À venir', tone: 'neutral' },
  demande: { label: 'Paiement demandé', tone: 'amber' },
  en_attente_validation: { label: 'Espèces à valider', tone: 'blue' },
  paye: { label: 'Réglée', tone: 'green' }
};

export const PRODUCTION: Record<string, { label: string; tone: Tone }> = {
  en_attente: { label: 'En attente de l’acompte', tone: 'amber' },
  en_cours: { label: 'En production', tone: 'ember' },
  premiers_livrables: { label: 'Premiers livrables envoyés', tone: 'blue' },
  livree: { label: 'Livrée', tone: 'green' }
};

export const TONE_CLASS: Record<Tone, string> = {
  neutral: 'bg-ink-600/60 text-bone-200 ring-ink-500',
  ember: 'bg-ember/15 text-ember-400 ring-ember/30',
  green: 'bg-sage/15 text-sage ring-sage/30',
  amber: 'bg-amberish/15 text-amberish ring-amberish/30',
  red: 'bg-crimson/15 text-[#F07A7A] ring-crimson/30',
  blue: 'bg-sky-400/10 text-sky-300 ring-sky-400/30'
};
