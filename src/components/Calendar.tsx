import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, MessageCircle, CreditCard, Settings, X, Eye } from 'lucide-react';
import { 
  createReservation, 
  getAllReservations, 
  getBookedSlotsForDate, 
  getReservationStats,
  type Reservation 
} from '../utils/reservationService';

const Calendar: React.FC = () => {
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
    return selectedSlots.length * 30000;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    // Vérifications spécifiques avec messages d'erreur personnalisés
    if (!selectedDate || selectedSlots.length === 0) {
      setErrorMessage('Veuillez sélectionner un horaire au niveau du calendrier.');
      return;
    }
    
    if (!formData.nom || !formData.email || !formData.telephone) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires du formulaire.');
      return;
    }
    
    try {
      // Enregistrer la réservation dans Supabase
      const reservation = await createReservation({
        nom: formData.nom,
        email: formData.email,
        telephone: formData.telephone,
        message: formData.message,
        date_reservation: selectedDate,
        creneaux: selectedSlots,
        duree_heures: selectedSlots.length,
        montant_total: getTotalPrice()
      });

      if (!reservation) {
        setErrorMessage('Erreur lors de l\'enregistrement de la réservation. Veuillez réessayer.');
        setIsLoading(false);
        return;
      }

      // Mettre à jour l'état local
      await loadBookedSlotsForDate(selectedDate);
      await loadStats();
      
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      setErrorMessage('Erreur lors de l\'enregistrement. Veuillez réessayer.');
      setIsLoading(false);
      return;
    }

    // Rediriger vers Wave pour le paiement
    const totalAmount = getTotalPrice();
    const wavePaymentUrl = `https://pay.wave.com/m/M_sn_zCHJuLFd2WBm/c/sn/?amount=${totalAmount}`;
    
    alert('Réservation confirmée ! Vous allez être redirigé vers Wave pour le paiement');
    window.open(wavePaymentUrl, '_blank');
    
    // Créer le message WhatsApp avec les détails de la réservation
    const selectedSlotsText = selectedSlots.length === 1 
      ? baseTimeSlots.find(slot => slot.id === selectedSlots[0])?.time
      : (() => {
          const firstSlot = baseTimeSlots.find(slot => slot.id === selectedSlots[0]);
          const lastSlot = baseTimeSlots.find(slot => slot.id === selectedSlots[selectedSlots.length - 1]);
          const endTime = lastSlot?.time.split(' - ')[1];
          return `${firstSlot?.time.split(' - ')[0]} - ${endTime}`;
        })();
        
    const selectedDateFormatted = new Date(selectedDate).toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const whatsappMessage = `Bonjour, j'ai effectué le paiement pour ma réservation au Westaf Studio.

Nom complet: ${formData.nom}
Email: ${formData.email}
Téléphone: ${formData.telephone}
Date souhaitée: ${selectedDateFormatted}
Créneau: ${selectedSlotsText}
Durée: ${selectedSlots.length} heure(s)
Montant payé: ${totalAmount.toLocaleString()} FCFA via Wave

Message: ${formData.message || 'Aucun message supplémentaire'}`;

    const whatsappUrl = `https://wa.me/221710162323?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Ouvrir WhatsApp dans un nouvel onglet après un court délai
    alert('Vous allez être redirigé vers WhatsApp pour confirmation.');
    window.open(whatsappUrl, '_blank');
    
    
    // Réinitialiser le formulaire
    setSelectedDate('');
    setSelectedSlots([]);
    setFormData({
      nom: '',
      email: '',
      telephone: '',
      message: ''
    });
    setErrorMessage('');
    
    setIsLoading(false);
    alert('Réservation confirmée ! Vous allez être redirigé vers Wave pour le paiement, puis vers WhatsApp pour confirmation.');
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
            {/* Date Selection */}
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

            {/* Time Slots */}
            {selectedDate && (
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

            {selectedSlots.length > 0 && (
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
                <div className="text-xs text-orange-400 mt-2">
                  ℹ️ Les réservations se réinitialisent automatiquement chaque 1er du mois
                </div>
                <div className="text-xs text-yellow-400 mt-1">
                  ⏰ Réservation minimum 20 minutes à l'avance
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Informations de réservation</h3>
            <form onSubmit={handlePayment} className="space-y-6">
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
              {selectedDate && selectedSlots.length > 0 && (
                <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-lg p-4 border border-orange-500/30">
                  <h4 className="font-semibold text-white mb-2">Récapitulatif</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>Date: {new Date(selectedDate).toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</div>
                    <div>Créneau: {getSelectedSlotsText()}</div>
                    <div>Durée: {selectedSlots.length} heure(s)</div>
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
                className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'} text-white`}
              >
                <CreditCard className="w-5 h-5" />
                <span>{isLoading ? 'Enregistrement...' : 'Payer par Wave'}</span>
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
                              <div className={`text-xs px-2 py-1 rounded-full ${
                                reservation.statut === 'confirmee' ? 'bg-green-500/20 text-green-400' :
                                reservation.statut === 'annulee' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {reservation.statut === 'confirmee' ? 'Confirmée' :
                                 reservation.statut === 'annulee' ? 'Annulée' : 'En attente'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <div className="text-sm text-white mb-1">
                              📅 {formatDateForDisplay(reservation.date_reservation)}
                            </div>
                            <div className="text-sm text-gray-300 mb-1">
                              ⏰ {reservation.duree_heures} heure{reservation.duree_heures > 1 ? 's' : ''}
                            </div>
                            <div className="text-sm text-orange-400 font-semibold">
                              💰 {reservation.montant_total.toLocaleString()} FCFA
                            </div>
                            {reservation.message && (
                              <div className="text-xs text-gray-400 mt-2 italic">
                                💬 {reservation.message}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {reservation.creneaux.map((slotId) => {
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
    </section>
  );
};

export default Calendar;