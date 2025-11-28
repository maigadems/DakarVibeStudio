import React, { useState } from 'react';
import PayButton from "./PayButton";
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, MessageCircle, CreditCard, Settings, X, Eye, Trash2 } from 'lucide-react';
import { 
  createReservation, 
  getAllReservations, 
  getBookedSlotsForDate, 
  getReservationStats,
  deleteReservation,
  type Reservation 
} from '../utils/reservationService';

const Calendar: React.FC = () => {
  const [serviceType, setServiceType] = useState<'horaire' | 'mixage' | 'mastering'>('horaire');
  const [nombreTitres, setNombreTitres] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<{[key: string]: string[]}>({});
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState({
    totalReservations: 0,
    totalSlots: 0,
    totalRevenue: 0,
    currentMonth: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  });
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ login: '', password: '' });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reservationConfirmed, setReservationConfirmed] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<any>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    reservationId: '',
    reservationName: ''
  });
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    message: ''
  });
  const [errorMessage, setErrorMessage] = useState('');

  // Charger les créneaux réservés pour une date
  const loadBookedSlotsForDate = async (date: string) => {
    const slots = await getBookedSlotsForDate(date);
    setBookedSlots(prev => ({
      ...prev,
      [date]: slots
    }));
  };

  // Charger toutes les réservations (pour l'admin)
  const loadAllReservations = async () => {
    const reservations = await getAllReservations();
    setAllReservations(reservations);
  };

  // Charger les statistiques
  const loadStats = async () => {
    const statsData = await getReservationStats();
    setStats(statsData);
  };

  // Charger les données au changement de date
  React.useEffect(() => {
    if (selectedDate) {
      loadBookedSlotsForDate(selectedDate);
    }
  }, [selectedDate]);

  // Charger les données initiales
  React.useEffect(() => {
    loadStats();
    if (isAdminAuthenticated) {
      loadAllReservations();
    }
  }, [isAdminAuthenticated]);

  const baseTimeSlots = [
    { id: '08-09', time: '08h00 - 09h00' },
    { id: '09-10', time: '09h00 - 10h00' },
    { id: '10-11', time: '10h00 - 11h00' },
    { id: '11-12', time: '11h00 - 12h00' },
    { id: '12-13', time: '12h00 - 13h00' },
    { id: '13-14', time: '13h00 - 14h00' },
    { id: '14-15', time: '14h00 - 15h00' },
    { id: '15-16', time: '15h00 - 16h00' },
    { id: '16-17', time: '16h00 - 17h00' },
    { id: '17-18', time: '17h00 - 18h00' },
    { id: '18-19', time: '18h00 - 19h00' },
    { id: '19-20', time: '19h00 - 20h00' },
    { id: '20-21', time: '20h00 - 21h00' },
    { id: '21-22', time: '21h00 - 22h00' },
    { id: '22-23', time: '22h00 - 23h00' },
    { id: '23-00', time: '23h00 - 00h00' },
  ];

  // Fonction pour obtenir les créneaux avec leur statut
  const getTimeSlotsForDate = (date: string) => {
    const dateBookedSlots = bookedSlots[date] || [];
    const now = new Date();
    const selectedDateObj = new Date(date);
    const isToday = selectedDateObj.toDateString() === now.toDateString();
    
    return baseTimeSlots.map(slot => ({
      ...slot,
      status: (() => {
        if (dateBookedSlots.includes(slot.id)) {
          return 'booked';
        }
        
        // Vérifier si c'est aujourd'hui et si le créneau est dans moins de 30 minutes
        if (isToday) {
          const [startHour] = slot.id.split('-').map(Number);
          const slotStartTime = new Date(selectedDateObj);
          slotStartTime.setHours(startHour, 0, 0, 0);
          
          // Calculer la différence en minutes
          const timeDifference = (slotStartTime.getTime() - now.getTime()) / (1000 * 60);
          
          if (timeDifference < 20) {
            return 'too_late';
          }
        }
        
        return 'available';
      })()
    }));
  };

  const timeSlots = selectedDate 
    ? getTimeSlotsForDate(selectedDate).filter(slot => slot.status !== 'too_late')
    : baseTimeSlots.map(slot => ({ ...slot, status: 'available' }));

  // Generate next 14 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    let daysAdded = 0;
    let i = 0;
    
    while (daysAdded < 14) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Exclure les dimanches (0 = dimanche)
      if (date.getDay() !== 0) {
        dates.push({
          date: date.toISOString().split('T')[0],
          day: date.getDate(),
          month: date.toLocaleDateString('fr-FR', { month: 'short' }),
          weekday: date.toLocaleDateString('fr-FR', { weekday: 'short' })
        });
        daysAdded++;
      }
      i++;
    }
    return dates;
  };

  const dates = generateDates();

  const handleSlotSelection = (slotId: string) => {
    setSelectedSlots(prev => {
      if (prev.includes(slotId)) {
        // Désélectionner le créneau
        return prev.filter(id => id !== slotId);
      } else {
        // Ajouter le créneau
        const newSlots = [...prev, slotId].sort();
        
        // Vérifier que les créneaux sont consécutifs
        if (newSlots.length > 1) {
          const slotIndices = newSlots.map(id => baseTimeSlots.findIndex(slot => slot.id === id));
          const isConsecutive = slotIndices.every((index, i) => 
            i === 0 || index === slotIndices[i - 1] + 1
          );
          
          if (!isConsecutive) {
            // Si pas consécutifs, remplacer par le nouveau créneau seulement
            return [slotId];
          }
        }
        
        return newSlots;
      }
    });
  };

  const getSelectedSlotsText = () => {
    if (selectedSlots.length === 0) return '';
    if (selectedSlots.length === 1) {
      return baseTimeSlots.find(slot => slot.id === selectedSlots[0])?.time || '';
    }
    
    const firstSlot = baseTimeSlots.find(slot => slot.id === selectedSlots[0]);
    const lastSlot = baseTimeSlots.find(slot => slot.id === selectedSlots[selectedSlots.length - 1]);
    const endTime = lastSlot?.time.split(' - ')[1];
    
    return `${firstSlot?.time.split(' - ')[0]} - ${endTime}`;
  };

  const getTotalPrice = () => {
    if (serviceType === 'horaire') {
      return selectedSlots.length * 30000;
    } else if (serviceType === 'mixage') {
      return nombreTitres * 150000;
    } else if (serviceType === 'mastering') {
      return nombreTitres * 70000;
    }
    return 0;
  };

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Vérifications spécifiques avec messages d'erreur personnalisés
      if (serviceType === 'horaire') {
        if (!selectedDate || selectedSlots.length === 0) {
          setErrorMessage('Veuillez sélectionner un horaire au niveau du calendrier.');
          setIsLoading(false);
          return;
        }
      } else {
        if (nombreTitres < 1) {
          setErrorMessage('Veuillez sélectionner au moins 1 titre.');
          setIsLoading(false);
          return;
        }
      }
      
      if (!formData.nom || !formData.email || !formData.telephone) {
        setErrorMessage('Veuillez remplir tous les champs obligatoires du formulaire.');
        setIsLoading(false);
        return;
      }

      // Enregistrer la réservation dans Supabase
      const reservationData: any = {
        nom: formData.nom,
        email: formData.email,
        telephone: formData.telephone,
        message: formData.message,
        date_reservation: serviceType === 'horaire' ? selectedDate : new Date().toISOString().split('T')[0],
        montant_total: getTotalPrice(),
        type_service: serviceType,
      };

      if (serviceType === 'horaire') {
        reservationData.creneaux = selectedSlots;
        reservationData.duree_heures = selectedSlots.length;
        reservationData.nombre_titres = null;
      } else {
        reservationData.creneaux = null;
        reservationData.duree_heures = null;
        reservationData.nombre_titres = nombreTitres;
      }

      const reservation = await createReservation(reservationData);

      if (!reservation) {
        setErrorMessage('Erreur lors de l\'enregistrement de la réservation. Veuillez réessayer.');
        setIsLoading(false);
        return;
      }

      // Mettre à jour l'état local
      if (serviceType === 'horaire') {
        await loadBookedSlotsForDate(selectedDate);
      }
      await loadStats();
      
      // Marquer la réservation comme confirmée
      const confirmedData: any = {
        ...reservation,
        serviceType: serviceType,
      };

      if (serviceType === 'horaire') {
        confirmedData.selectedSlotsText = selectedSlots.length === 1 
          ? baseTimeSlots.find(slot => slot.id === selectedSlots[0])?.time
          : (() => {
              const firstSlot = baseTimeSlots.find(slot => slot.id === selectedSlots[0]);
              const lastSlot = baseTimeSlots.find(slot => slot.id === selectedSlots[selectedSlots.length - 1]);
              const endTime = lastSlot?.time.split(' - ')[1];
              return `${firstSlot?.time.split(' - ')[0]} - ${endTime}`;
            })();
        confirmedData.selectedDateFormatted = new Date(selectedDate).toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      } else {
        confirmedData.nombreTitres = nombreTitres;
        confirmedData.serviceLabel = serviceType === 'mixage' ? 'Mixage de titre' : 'Mastering';
      }

      setReservationConfirmed(true);
      setConfirmedReservation(confirmedData);
      setIsLoading(false);
      
      // Scroll vers la section de confirmation
      setTimeout(() => {
        const confirmationSection = document.getElementById('confirmation-section');
        if (confirmationSection) {
          confirmationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      setErrorMessage('Erreur lors de l\'enregistrement. Veuillez réessayer.');
      setIsLoading(false);
    }
  };
  const montant = confirmedReservation?.montant_total ?? 0;
  const namev = confirmedReservation?.nom ?? '';
  const datev = confirmedReservation?.selectedDateFormatted ?? '';

  const handleWavePayment = () => {
    if (!confirmedReservation) return;
    
    // Construire l'URL Wave avec les paramètres
    const waveUrl = `https://pay.wave.com/m/M_sn_zCHJuLFd2WBm/c/sn/?amount=${confirmedReservation.montant_total}&currency=XOF&reference=${confirmedReservation.id}&description=Reservation Studio - ${confirmedReservation.nom}`;
    
    // Détecter si on est sur mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Sur mobile, ouvrir dans un nouvel onglet pour éviter l'App Store
      const newWindow = window.open(waveUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        // Si le popup est bloqué, utiliser location.href
        window.location.href = waveUrl;
      }
    } else {
      // Sur desktop, redirection normale
      window.location.href = waveUrl;
    }
  };

  const handleNewReservation = () => {
    setReservationConfirmed(false);
    setConfirmedReservation(null);
    setServiceType('horaire');
    setNombreTitres(1);
    setSelectedDate('');
    setSelectedSlots([]);
    setFormData({
      nom: '',
      email: '',
      telephone: '',
      message: ''
    });
    setErrorMessage('');
  };
  const handleCall = () => {
    window.location.href = 'tel:+221710162323';
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCredentials.login === 'JeussW' && adminCredentials.password === 'JeussW') {
      setIsAdminAuthenticated(true);
    } else {
      alert('Identifiants incorrects');
      setAdminCredentials({ login: '', password: '' });
    }
  };

  const closeAdminModal = () => {
    setShowAdminModal(false);
    setIsAdminAuthenticated(false);
    setAdminCredentials({ login: '', password: '' });
  };

  const handleDeleteClick = (reservation: Reservation) => {
    setDeleteConfirmation({
      isOpen: true,
      reservationId: reservation.id,
      reservationName: reservation.nom
    });
  };

  const handleDeleteConfirm = async () => {
    console.log('🗑️ Confirmation de suppression pour:', deleteConfirmation.reservationId);
    
    try {
      setIsLoading(true);
      
      const success = await deleteReservation(deleteConfirmation.reservationId);
      if (success) {
        console.log('✅ Suppression réussie, rechargement des données...');
        // Recharger les données
        await loadAllReservations();
        await loadStats();
        alert('Réservation supprimée avec succès !');
        // Recharger les créneaux réservés pour la date sélectionnée si elle existe
        if (selectedDate) {
          await loadBookedSlotsForDate(selectedDate);
        }
        console.log('✅ Données rechargées');
      } else {
        console.error('❌ Échec de la suppression');
        alert('Erreur lors de la suppression de la réservation');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de la réservation');
    } finally {
      setIsLoading(false);
    }
    
    // Fermer la modal de confirmation
    setDeleteConfirmation({
      isOpen: false,
      reservationId: '',
      reservationName: ''
    });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      reservationId: '',
      reservationName: ''
    });
  };

  const formatDateForDisplay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 relative">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Réserver Une Session
            </span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Choisissez votre date et créneau horaire, puis remplissez le formulaire pour finaliser votre réservation.
          </p>
          
          {/* Bouton Admin discret */}
          <button
            onClick={() => setShowAdminModal(true)}
            className="absolute top-0 right-0 w-6 h-6 bg-gray-800/50 hover:bg-gray-700/50 rounded-full flex items-center justify-center opacity-30 hover:opacity-60 transition-all duration-300"
            title="Administration"
          >
            <Settings className="w-3 h-3 text-gray-400" />
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Calendar Section */}
          <div className="space-y-8">
            {/* Service Type Selection */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Type de Service</h3>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    setServiceType('horaire');
                    setNombreTitres(1);
                  }}
                  className={`p-4 rounded-lg text-center transition-all duration-300 ${
                    serviceType === 'horaire'
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg border-2 border-orange-400'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border-2 border-gray-700'
                  }`}
                >
                  <Clock className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-semibold">Réservation Horaire</div>
                  <div className="text-xs mt-1">30,000 FCFA/h</div>
                </button>
                <button
                  onClick={() => {
                    setServiceType('mixage');
                    setSelectedDate('');
                    setSelectedSlots([]);
                  }}
                  className={`p-4 rounded-lg text-center transition-all duration-300 ${
                    serviceType === 'mixage'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg border-2 border-purple-400'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border-2 border-gray-700'
                  }`}
                >
                  <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <div className="font-semibold">Mixage de Titre</div>
                  <div className="text-xs mt-1">150,000 FCFA/titre</div>
                </button>
                <button
                  onClick={() => {
                    setServiceType('mastering');
                    setSelectedDate('');
                    setSelectedSlots([]);
                  }}
                  className={`p-4 rounded-lg text-center transition-all duration-300 ${
                    serviceType === 'mastering'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg border-2 border-blue-400'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border-2 border-gray-700'
                  }`}
                >
                  <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <div className="font-semibold">Mastering</div>
                  <div className="text-xs mt-1">70,000 FCFA/titre</div>
                </button>
              </div>
            </div>

            {/* Nombre de titres pour Mixage/Mastering */}
            {(serviceType === 'mixage' || serviceType === 'mastering') && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Nombre de Titres</h3>
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setNombreTitres(Math.max(1, nombreTitres - 1))}
                      className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-white font-bold text-xl transition-colors"
                    >
                      -
                    </button>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white">{nombreTitres}</div>
                      <div className="text-sm text-gray-400">titre{nombreTitres > 1 ? 's' : ''}</div>
                    </div>
                    <button
                      onClick={() => setNombreTitres(Math.min(20, nombreTitres + 1))}
                      className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-white font-bold text-xl transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={nombreTitres}
                    onChange={(e) => setNombreTitres(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>1</span>
                    <span>20</span>
                  </div>
                  <div className="mt-4 p-4 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-lg border border-orange-500/30">
                    <div className="text-center">
                      <div className="text-sm text-gray-300 mb-1">Prix Total</div>
                      <div className="text-2xl font-bold text-orange-400">
                        {getTotalPrice().toLocaleString()} FCFA
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Date Selection - Only for Horaire */}
            {serviceType === 'horaire' && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-orange-400" />
                  Sélectionner une date
                </h3>
                <div className="grid grid-cols-7 gap-2">
                {dates.map((date) => (
                  <button
                    key={date.date}
                    onClick={() => setSelectedDate(date.date)}
                    className={`p-3 rounded-lg text-center transition-all duration-300 ${
                      selectedDate === date.date
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                    }`}
                  >
                    <div className="text-xs text-gray-400">{date.weekday}</div>
                    <div className="font-semibold">{date.day}</div>
                    <div className="text-xs">{date.month}</div>
                  </button>
                ))}
                </div>
              </div>
            )}

            {/* Time Slots - Only for Horaire */}
            {serviceType === 'horaire' && selectedDate && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-red-400" />
                  Créneaux disponibles (sélection multiple possible)
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Cliquez sur plusieurs créneaux consécutifs pour réserver plusieurs heures
                </p>
                <div className="space-y-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => slot.status === 'available' && handleSlotSelection(slot.id)}
                      disabled={slot.status !== 'available'}
                      className={`w-full p-4 rounded-lg text-left transition-all duration-300 ${
                        selectedSlots.includes(slot.id)
                          ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                          : slot.status === 'available' 
                            ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                            : 'bg-red-900/30 text-red-400 cursor-not-allowed border border-red-700/50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{slot.time}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          selectedSlots.includes(slot.id)
                            ? 'bg-orange-500/20 text-orange-300'
                            : slot.status === 'available' 
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                        }`}>
                          {selectedSlots.includes(slot.id) 
                            ? 'Sélectionné'
                            : slot.status === 'available' 
                              ? 'Disponible'
                              : 'Réservé'
                          }
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {serviceType === 'horaire' && selectedSlots.length > 0 && (
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Créneaux sélectionnés</h4>
                <div className="text-sm text-gray-300 space-y-1">
                  <div>Horaire: {getSelectedSlotsText()}</div>
                  <div>Durée: {selectedSlots.length} heure(s)</div>
                  <div className="text-orange-400 font-semibold">
                    Total: {getTotalPrice().toLocaleString()} FCFA
                  </div>
                </div>
              </div>
            )}

            {/* Pricing Info */}
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-orange-500/20">
              <h4 className="text-lg font-semibold text-white mb-4">Tarifs</h4>
              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between">
                  <span>Tarif par heure</span>
                  <span className="text-orange-400 font-semibold">30 000 FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span>Mixage de titre</span>
                  <span className="text-red-400 font-semibold">150 000 FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span>Mastering</span>
                  <span className="text-yellow-400 font-semibold">70 000 FCFA</span>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  * Studio ouvert 6j/7 (Lun-Sam) - Paiement échelonné possible pour mixage
                </div>
                {serviceType === 'horaire' && (
                  <>
                    <div className="text-xs text-orange-400 mt-2">
                      ℹ️ Les réservations se réinitialisent automatiquement chaque 1er du mois
                    </div>
                    <div className="text-xs text-yellow-400 mt-1">
                      ⏰ Réservation minimum 20 minutes à l'avance
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div>
            {!reservationConfirmed ? (
              <>
                <h3 className="text-xl font-semibold text-white mb-6">Informations de réservation</h3>
                <form onSubmit={handleConfirmReservation} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      placeholder="Votre nom d'artiste ou nom complet"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      placeholder="+221 XX XXX XX XX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <MessageCircle className="w-4 h-4 inline mr-2" />
                      Message (optionnel)
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      placeholder="Parlez-nous de votre projet musical..."
                    />
                  </div>

                  {/* Booking Summary */}
                  {((serviceType === 'horaire' && selectedDate && selectedSlots.length > 0) || 
                    (serviceType !== 'horaire' && nombreTitres > 0)) && (
                    <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-lg p-4 border border-orange-500/30">
                      <h4 className="font-semibold text-white mb-2">Récapitulatif</h4>
                      <div className="text-sm text-gray-300 space-y-1">
                        <div>Type: {
                          serviceType === 'horaire' ? 'Réservation Horaire' :
                          serviceType === 'mixage' ? 'Mixage de Titre' : 'Mastering'
                        }</div>
                        {serviceType === 'horaire' ? (
                          <>
                            <div>Date: {new Date(selectedDate).toLocaleDateString('fr-FR', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</div>
                            <div>Créneau: {getSelectedSlotsText()}</div>
                            <div>Durée: {selectedSlots.length} heure(s)</div>
                          </>
                        ) : (
                          <div>Nombre de titres: {nombreTitres}</div>
                        )}
                        <div className="text-orange-400 font-semibold">
                          Total à payer: {getTotalPrice().toLocaleString()} FCFA
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message d'erreur */}
                  {errorMessage && (
                    <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-4">
                      <div className="text-red-400 font-semibold text-center">
                        ⚠️ {errorMessage}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'} text-white`}
                  >
                    <span>{isLoading ? 'Enregistrement...' : 'Confirmer la Réservation'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCall}
                    className="w-full mt-3 bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Appeler Maintenant</span>
                  </button>
                </form>
              </>
            ) : (
              /* Confirmation de réservation */
              <div id="confirmation-section" className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-green-400 mb-2">Réservation Confirmée !</h3>
                  <p className="text-gray-300 mb-6">
                    Votre réservation a été enregistrée avec succès dans notre système.
                  </p>
                </div>

                {/* Récapitulatif de la réservation confirmée */}
                <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-lg p-6 border border-green-500/30">
                  <h4 className="font-semibold text-white mb-4">Détails de votre réservation</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div><strong>Nom:</strong> {confirmedReservation?.nom}</div>
                    <div><strong>Email:</strong> {confirmedReservation?.email}</div>
                    <div><strong>Téléphone:</strong> {confirmedReservation?.telephone}</div>
                    <div><strong>Type de service:</strong> {
                      confirmedReservation?.serviceType === 'horaire' ? 'Réservation Horaire' :
                      confirmedReservation?.serviceType === 'mixage' ? 'Mixage de Titre' : 'Mastering'
                    }</div>
                    {confirmedReservation?.serviceType === 'horaire' ? (
                      <>
                        <div><strong>Date:</strong> {confirmedReservation?.selectedDateFormatted}</div>
                        <div><strong>Créneau:</strong> {confirmedReservation?.selectedSlotsText}</div>
                        <div><strong>Durée:</strong> {confirmedReservation?.duree_heures} heure(s)</div>
                      </>
                    ) : (
                      <div><strong>Nombre de titres:</strong> {confirmedReservation?.nombreTitres}</div>
                    )}
                    <div className="text-orange-400 font-semibold text-lg">
                      <strong>Total:</strong> {confirmedReservation?.montant_total.toLocaleString()} FCFA
                    </div>
                  </div>
                </div>

                {/* Bouton de paiement*/}
                {confirmedReservation && (
        <div className="mt-6">
          <PayButton
            amount={confirmedReservation.type_service === 'horaire' ? montant/2 : montant}
            description="Paiement de la réservation"
            name={namev}
            date={datev}
          />
        </div>
      )}

                {/* Bouton pour nouvelle réservation */}
                <button
                  onClick={handleNewReservation}
                  className="w-full mt-3 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Nouvelle Réservation</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Admin */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-orange-500/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">
                {isAdminAuthenticated ? 'Panneau d\'Administration' : 'Connexion Admin'}
              </h3>
              <button
                onClick={closeAdminModal}
                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {!isAdminAuthenticated ? (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Login
                  </label>
                  <input
                    type="text"
                    required
                    value={adminCredentials.login}
                    onChange={(e) => setAdminCredentials({ ...adminCredentials, login: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    placeholder="Entrez votre login"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    value={adminCredentials.password}
                    onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    placeholder="Entrez votre mot de passe"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                >
                  Se connecter
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Statistiques */}
                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-4 border border-orange-500/20">
                  <h4 className="text-lg font-semibold text-white mb-2">Statistiques du mois</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-orange-400">{stats.totalReservations}</div>
                      <div className="text-sm text-gray-400">Réservations</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-400">{stats.totalSlots}</div>
                      <div className="text-sm text-gray-400">Créneaux réservés</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">{stats.totalRevenue.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">FCFA</div>
                    </div>
                  </div>
                </div>

                {/* Liste des réservations */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-orange-400" />
                    Toutes les réservations
                  </h4>
                  
                  {allReservations.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      Aucune réservation trouvée
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {allReservations.map((reservation) => (
                        <div key={reservation.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-semibold text-white">{reservation.nom}</h5>
                              <p className="text-sm text-gray-400">{reservation.email}</p>
                              <p className="text-sm text-gray-400">{reservation.telephone}</p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2 mb-2">
                                <button
                                  onClick={() => handleDeleteClick(reservation)}
                                  className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                                  title="Supprimer la réservation"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className={`text-xs px-2 py-1 rounded-full ${
                                reservation.statut === 'confirmee' ? 'bg-green-500/20 text-green-400' :
                                reservation.statut === 'annulee' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {reservation.statut === 'confirmee' ? 'Confirmée' :
                                 reservation.statut === 'annulee' ? 'Annulée' : 'Confirmée'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <div className="text-sm text-purple-400 mb-1 font-semibold">
                              🎯 {reservation.type_service === 'horaire' ? 'Réservation Horaire' :
                                  reservation.type_service === 'mixage' ? 'Mixage de Titre' : 'Mastering'}
                            </div>
                            <div className="text-sm text-white mb-1">
                              📅 {formatDateForDisplay(reservation.date_reservation)}
                            </div>
                            {reservation.type_service === 'horaire' ? (
                              <div className="text-sm text-gray-300 mb-1">
                                ⏰ {reservation.duree_heures} heure{(reservation.duree_heures || 0) > 1 ? 's' : ''}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-300 mb-1">
                                🎵 {reservation.nombre_titres} titre{(reservation.nombre_titres || 0) > 1 ? 's' : ''}
                              </div>
                            )}
                            <div className="text-sm text-orange-400 font-semibold">
                              💰 {reservation.montant_total.toLocaleString()} FCFA
                            </div>
                            {reservation.message && (
                              <div className="text-xs text-gray-400 mt-2 italic">
                                💬 {reservation.message}
                              </div>
                            )}
                          </div>
                          
                          {reservation.type_service === 'horaire' && reservation.creneaux && (
                            <div className="flex flex-wrap gap-2">
                              {reservation.creneaux.map((slotId: string) => {
                                const slot = baseTimeSlots.find(s => s.id === slotId);
                                return (
                                  <span
                                    key={slotId}
                                    className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs border border-orange-500/30"
                                  >
                                    {slot ? slot.time : slotId}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500 mt-2">
                            Créé le {new Date(reservation.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions admin */}
                <div className="border-t border-gray-600 pt-4">
                  <div className="text-xs text-gray-400 text-center">
                    💡 Toutes les réservations sont enregistrées dans Supabase
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-red-500/20">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Confirmer la suppression</h3>
              <p className="text-gray-300">
                Êtes-vous sûr de vouloir supprimer la réservation de{' '}
                <span className="font-semibold text-orange-400">{deleteConfirmation.reservationName}</span> ?
              </p>
              <p className="text-sm text-red-400 mt-2">
                ⚠️ Cette action est irréversible
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleDeleteCancel}
                className={`flex-1 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                className={`flex-1 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Calendar;