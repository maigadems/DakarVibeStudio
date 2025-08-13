import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, MessageCircle, CreditCard } from 'lucide-react';
import { loadBookingData, addBooking, getBookingStats } from '../utils/bookingStorage';

const Calendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<{[key: string]: string[]}>(() => loadBookingData());
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    message: ''
  });
  const [errorMessage, setErrorMessage] = useState('');

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
    return baseTimeSlots.map(slot => ({
      ...slot,
      status: dateBookedSlots.includes(slot.id) ? 'booked' : 'available'
    }));
  };

  const timeSlots = selectedDate ? getTimeSlotsForDate(selectedDate) : baseTimeSlots.map(slot => ({ ...slot, status: 'available' }));

  // Generate next 14 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        day: date.getDate(),
        month: date.toLocaleDateString('fr-FR', { month: 'short' }),
        weekday: date.toLocaleDateString('fr-FR', { weekday: 'short' })
      });
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

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
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
    
    // Rediriger vers Wave pour le paiement
    const totalAmount = getTotalPrice();
    const wavePaymentUrl = `https://pay.wave.com/m/M_sn_uas2k2yeBltT/c/sn/?amount=${totalAmount}`;
    
    // Sauvegarder les données dans le localStorage pour les récupérer après paiement
    const reservationData = {
      selectedDate,
      selectedSlots,
      formData,
      totalPrice: totalAmount,
      timestamp: Date.now()
    };
    localStorage.setItem('pendingReservation', JSON.stringify(reservationData));
    
    // Ouvrir Wave dans un nouvel onglet
    window.open(wavePaymentUrl, '_blank');
    
    // Simuler la completion du paiement après 3 secondes (en réalité, cela devrait être géré par un webhook Wave)
    setTimeout(() => {
      setPaymentCompleted(true);
    }, 3000);
  };

  const handleWhatsAppSend = () => {
    // Récupérer les données sauvegardées
    const savedData = localStorage.getItem('pendingReservation');
    if (!savedData) {
      setErrorMessage('Erreur: Données de réservation non trouvées. Veuillez recommencer.');
      return;
    }

    const reservationData = JSON.parse(savedData);
    
    // Créer le message WhatsApp
    const selectedSlotsText = reservationData.selectedSlots.length === 1 
      ? baseTimeSlots.find(slot => slot.id === reservationData.selectedSlots[0])?.time
      : (() => {
          const firstSlot = baseTimeSlots.find(slot => slot.id === reservationData.selectedSlots[0]);
          const lastSlot = baseTimeSlots.find(slot => slot.id === reservationData.selectedSlots[reservationData.selectedSlots.length - 1]);
          const endTime = lastSlot?.time.split(' - ')[1];
          return `${firstSlot?.time.split(' - ')[0]} - ${endTime}`;
        })();
        
    const selectedDateFormatted = new Date(reservationData.selectedDate).toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const whatsappMessage = `Bonjour, j'ai effectué le paiement pour ma réservation au Westaf Studio.

Nom complet: ${reservationData.formData.nom}
Email: ${reservationData.formData.email}
Téléphone: ${reservationData.formData.telephone}
Date souhaitée: ${selectedDateFormatted}
Créneau: ${selectedSlotsText}
Durée: ${reservationData.selectedSlots.length} heure(s)
Montant payé: ${reservationData.totalPrice.toLocaleString()} FCFA via Wave

Message: ${reservationData.formData.message || 'Aucun message supplémentaire'}`;

    const whatsappUrl = `https://wa.me/221710162323?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
    
    // Marquer les créneaux comme réservés
    // Ajouter la réservation au stockage persistant
    addBooking(reservationData.selectedDate, reservationData.selectedSlots);
    
    // Mettre à jour l'état local
    setBookedSlots(loadBookingData());
    
    // Nettoyer les données sauvegardées
    localStorage.removeItem('pendingReservation');
    
    // Réinitialiser le formulaire
    setPaymentCompleted(false);
    setSelectedDate('');
    setSelectedSlots([]);
    setFormData({
      nom: '',
      email: '',
      telephone: '',
      message: ''
    });
    setErrorMessage('');
    
    alert('Réservation confirmée ! Vous allez être redirigé vers WhatsApp.');
  };

  const handleCall = () => {
    window.location.href = 'tel:+221710162323';
  };

  // Obtenir les statistiques pour affichage (optionnel)
  const stats = getBookingStats();

  return (
    <section className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Réserver Une Session
            </span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Choisissez votre date et créneau horaire, puis remplissez le formulaire pour finaliser votre réservation.
          </p>
          <div className="mt-4 text-sm text-gray-400">
            📊 Ce mois ({stats.currentMonth}) : {stats.totalSlots} créneaux réservés sur {stats.totalDays} jours
          </div>
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
                  <span className="text-yellow-400 font-semibold">100 000 FCFA</span>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  * Studio ouvert 24h/24 - Paiement échelonné possible pour mixage
                </div>
                <div className="text-xs text-orange-400 mt-2">
                  ℹ️ Les réservations se réinitialisent automatiquement chaque 1er du mois
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
                disabled={paymentCompleted}
                className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 ${
                  paymentCompleted 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>{paymentCompleted ? 'Paiement en cours...' : 'Payer par Wave'}</span>
              </button>

              {paymentCompleted && (
                <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-green-400 font-semibold mb-2">✅ Paiement effectué avec succès !</div>
                    <p className="text-gray-300 text-sm mb-4">
                      Cliquez sur le bouton ci-dessous pour confirmer votre réservation via WhatsApp
                    </p>
                    <button
                      type="button"
                      onClick={handleWhatsAppSend}
                      className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Confirmer via WhatsApp</span>
                    </button>
                  </div>
                </div>
              )}
              
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
    </section>
  );
};

export default Calendar;