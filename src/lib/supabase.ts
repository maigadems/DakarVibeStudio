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
  creneaux: string[];
  duree_heures: number;
  montant_total: number;
  statut: 'en_attente' | 'confirmee' | 'annulee';
  created_at: string;
  updated_at: string;
}