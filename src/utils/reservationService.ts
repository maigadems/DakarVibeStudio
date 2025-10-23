import { supabase } from '../lib/supabase';
import type { Reservation } from '../lib/supabase';

export type { Reservation };

// Créer une nouvelle réservation
export const createReservation = async (reservationData: {
  nom: string;
  email: string;
  telephone: string;
  message: string;
  date_reservation: string;
  creneaux?: string[] | null;
  duree_heures?: number | null;
  montant_total: number;
  type_service: 'horaire' | 'mixage' | 'mastering';
  nombre_titres?: number | null;
}): Promise<Reservation | null> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .insert([reservationData])
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la création de la réservation:', error);
    return null;
  }
};

// Récupérer toutes les réservations
export const getAllReservations = async (): Promise<Reservation[]> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    return [];
  }
};

// Récupérer les réservations pour une date donnée
export const getReservationsByDate = async (date: string): Promise<Reservation[]> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('date_reservation', date)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des réservations par date:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations par date:', error);
    return [];
  }
};

// Obtenir les créneaux réservés pour une date
export const getBookedSlotsForDate = async (date: string): Promise<string[]> => {
  try {
    const reservations = await getReservationsByDate(date);
    const bookedSlots: string[] = [];
    
    reservations.forEach(reservation => {
      if (reservation.statut !== 'annulee' && reservation.type_service === 'horaire' && reservation.creneaux) {
        bookedSlots.push(...reservation.creneaux);
      }
    });

    return bookedSlots;
  } catch (error) {
    console.error('Erreur lors de la récupération des créneaux réservés:', error);
    return [];
  }
};

// Obtenir les statistiques des réservations
export const getReservationStats = async (): Promise<{
  totalReservations: number;
  totalSlots: number;
  totalRevenue: number;
  currentMonth: string;
}> => {
  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .gte('date_reservation', firstDayOfMonth.toISOString().split('T')[0])
      .lte('date_reservation', lastDayOfMonth.toISOString().split('T')[0])
      .neq('statut', 'annulee');

    if (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        totalReservations: 0,
        totalSlots: 0,
        totalRevenue: 0,
        currentMonth: currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      };
    }

    const reservations = data || [];
    const totalReservations = reservations.length;
    const totalSlots = reservations.reduce((sum: number, res: Reservation) => sum + (res.duree_heures || 0), 0);
    const totalRevenue = reservations.reduce((sum: number, res: Reservation) => sum + res.montant_total, 0);

    return {
      totalReservations,
      totalSlots,
      totalRevenue,
      currentMonth: currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return {
      totalReservations: 0,
      totalSlots: 0,
      totalRevenue: 0,
      currentMonth: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    };
  }
};

// Mettre à jour le statut d'une réservation
export const updateReservationStatus = async (
  id: string, 
  statut: 'en_attente' | 'confirmee' | 'annulee'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('reservations')
      .update({ 
        statut, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    return false;
  }
};

// Supprimer une réservation
export const deleteReservation = async (id: string): Promise<boolean> => {
  try {
    console.log('🗑️ Tentative de suppression de la réservation ID:', id);
    
    // Vérifier d'abord que la réservation existe
    const { data: existingReservation, error: fetchError } = await supabase
      .from('reservations')
      .select('id, nom')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('❌ Erreur lors de la vérification de la réservation:', fetchError);
      return false;
    }

    if (!existingReservation) {
      console.error('❌ Réservation non trouvée:', id);
      return false;
    }

    console.log('✅ Réservation trouvée:', existingReservation.nom);
    
    const { data, error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ Erreur lors de la suppression:', error.message, error.details, error.hint);
      return false;
    }

    console.log('✅ Réservation supprimée avec succès. Données supprimées:', data);
    return true;
  } catch (error) {
    console.error('❌ Erreur générale lors de la suppression:', error);
    return false;
  }
};