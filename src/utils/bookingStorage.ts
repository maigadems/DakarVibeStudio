interface BookingData {
  bookedSlots: { [key: string]: string[] };
  lastResetDate: string;
}

const STORAGE_KEY = 'westaf_studio_bookings';

// Fonction pour obtenir le premier jour du mois actuel
const getFirstDayOfCurrentMonth = (): string => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
};

// Fonction pour vérifier si on doit réinitialiser les données
const shouldResetData = (lastResetDate: string): boolean => {
  const currentFirstDay = getFirstDayOfCurrentMonth();
  return lastResetDate !== currentFirstDay;
};

// Charger les données de réservation
export const loadBookingData = (): { [key: string]: string[] } => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Première utilisation - initialiser avec la date actuelle
      const initialData: BookingData = {
        bookedSlots: {},
        lastResetDate: getFirstDayOfCurrentMonth()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return {};
    }

    const data: BookingData = JSON.parse(stored);
    
    // Vérifier si on doit réinitialiser (nouveau mois)
    if (shouldResetData(data.lastResetDate)) {
      console.log('🗓️ Nouveau mois détecté - Réinitialisation des réservations');
      const resetData: BookingData = {
        bookedSlots: {},
        lastResetDate: getFirstDayOfCurrentMonth()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resetData));
      return {};
    }

    return data.bookedSlots;
  } catch (error) {
    console.error('Erreur lors du chargement des réservations:', error);
    return {};
  }
};

// Sauvegarder les données de réservation
export const saveBookingData = (bookedSlots: { [key: string]: string[] }): void => {
  try {
    const data: BookingData = {
      bookedSlots,
      lastResetDate: getFirstDayOfCurrentMonth()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('💾 Réservations sauvegardées');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des réservations:', error);
  }
};

// Ajouter une nouvelle réservation
export const addBooking = (date: string, slots: string[]): void => {
  const currentBookings = loadBookingData();
  const existingSlots = currentBookings[date] || [];
  const updatedSlots = [...new Set([...existingSlots, ...slots])]; // Éviter les doublons
  
  const updatedBookings = {
    ...currentBookings,
    [date]: updatedSlots
  };
  
  saveBookingData(updatedBookings);
};

// Obtenir les statistiques de réservation
export const getBookingStats = (): { totalDays: number; totalSlots: number; currentMonth: string } => {
  const bookings = loadBookingData();
  const totalDays = Object.keys(bookings).length;
  const totalSlots = Object.values(bookings).reduce((sum, slots) => sum + slots.length, 0);
  const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  
  return { totalDays, totalSlots, currentMonth };
};

// Fonction pour forcer la réinitialisation (utile pour les tests)
export const forceReset = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  console.log('🔄 Réinitialisation forcée des réservations');
};