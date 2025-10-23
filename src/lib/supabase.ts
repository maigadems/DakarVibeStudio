import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d\'environnement Supabase manquantes');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour les réservations
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
