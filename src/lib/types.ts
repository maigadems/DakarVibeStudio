export type Role = 'super_admin' | 'admin' | 'engineer' | 'client';

export interface User {
  id: number;
  role: Role;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  must_change_password: boolean;
  has_password: boolean;
  google_linked: boolean;
  created_at: string;
  last_login_at: string | null;
}

export interface Service {
  id: number;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  booking_mode: 'slot' | 'per_track' | 'quote';
  price: number | null;
  price_unit: string | null;
  min_hours: number;
  max_hours: number;
  allow_deposit: boolean;
  deposit_percent: number;
  features: string[];
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  nb_reservations?: number;
}

export interface Photo { id: number; url: string; equipment_id?: number; sort_order?: number }

export interface Equipment {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  is_public?: boolean;
  is_featured: boolean;
  sort_order: number;
  photos: Photo[];
}

export interface GalleryPhoto {
  id: number;
  url: string;
  title: string | null;
  description: string | null;
  is_featured: boolean;
  is_public?: boolean;
  width: number | null;
  height: number | null;
  sort_order?: number;
}

export type Statut = 'en_attente' | 'confirmee' | 'annulee' | 'terminee' | 'expiree' | 'a_traiter';
export type PaymentStatus = 'non_paye' | 'acompte' | 'en_attente_validation' | 'paye';
export type SessionStatus = 'planifiee' | 'autorisee' | 'en_cours' | 'terminee' | 'absent' | 'annulee';
export type PresenceStatus = 'non_demandee' | 'demandee' | 'confirmee' | 'report_souhaite';

export interface Reservation {
  id: string;
  user_id: number | null;
  service_id: number | null;
  engineer_id: number | null;
  engineer_name?: string | null;
  nom: string;
  email: string;
  telephone: string;
  message: string;
  internal_notes?: string | null;
  date_reservation: string;
  start_at: string | null;
  end_at: string | null;
  duree_heures: number | null;
  nombre_titres: number | null;
  service_name: string;
  service_slug?: string;
  booking_mode: 'slot' | 'per_track' | 'quote';
  statut: Statut;
  session_status: SessionStatus;
  presence_status: PresenceStatus;
  reschedule_count: number;
  created_at: string;
  cancel_reason?: string | null;
  // Données financières : absentes pour les ingénieurs
  montant_total?: number;
  montant_paye?: number;
  solde?: number;
  payment_status?: PaymentStatus;
  type_paiement?: string;
  action_token?: string;
  // Règles côté client
  can_reschedule?: boolean;
  can_pay_balance?: boolean;
  can_resume_payment?: boolean;
  reschedule_limit_minutes?: number;
  autorisee_a_commencer?: boolean;
}

export interface Slot { start: string; end: string; label: string; available: boolean; reason: string | null }
export interface DaySummary { date: string; open: boolean; available: number }

export interface OpeningDay { weekday: number; is_open: boolean; open_time: string; close_time: string; break_start: string | null; break_end: string | null }

export interface PublicSettings {
  studio_name: string;
  contact_phone: string | null;
  contact_phone_2: string | null;
  contact_email: string | null;
  contact_email_2: string | null;
  address: string | null;
  maps_url: string | null;
  instagram_url: string | null;
  snapchat_url: string | null;
  facebook_url: string | null;
  booking_window_days: string;
  min_lead_minutes: string;
  reschedule_limit_minutes: string;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  body: string | null;
  reservation_id: string | null;
  read_at: string | null;
  created_at: string;
}

export interface HistoryEntry { id: number; action: string; actor_role: string; actor_name: string; details: Record<string, any>; created_at: string }
