import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, MessageCircle } from 'lucide-react';

const Calendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    message: ''
  });

  const timeSlots = [
    { id: '9-13', time: '09h00 - 13h00', status: 'available' },
    { id: '14-18', time: '14h00 - 18h00', status: 'available' },
    { id: '19-23', time: '19h00 - 23h00', status: 'booked' },
  ];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Réservation envoyée ! Nous vous contacterons sous 24h pour confirmer.');
  };

  return (
    <section className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Réserver Une Session
            </span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Choisissez votre date et créneau horaire, puis remplissez le formulaire pour finaliser votre réservation.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Calendar Section */}
          <div className="space-y-8">
            {/* Date Selection */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-purple-400" />
                Sélectionner une date
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {dates.map((date) => (
                  <button
                    key={date.date}
                    onClick={() => setSelectedDate(date.date)}
                    className={`p-3 rounded-lg text-center transition-all duration-300 ${
                      selectedDate === date.date
                        ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg'
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
                  <Clock className="w-5 h-5 mr-2 text-cyan-400" />
                  Créneaux disponibles
                </h3>
                <div className="space-y-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => slot.status === 'available' && setSelectedSlot(slot.id)}
                      disabled={slot.status !== 'available'}
                      className={`w-full p-4 rounded-lg text-left transition-all duration-300 ${
                        selectedSlot === slot.id
                          ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg'
                          : slot.status === 'available'
                          ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                          : 'bg-gray-800/20 text-gray-500 cursor-not-allowed border border-gray-700/50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{slot.time}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          slot.status === 'available' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {slot.status === 'available' ? 'Disponible' : 'Réservé'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Info */}
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-purple-500/20">
              <h4 className="text-lg font-semibold text-white mb-4">Tarifs</h4>
              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between">
                  <span>4h (demi-journée)</span>
                  <span className="text-purple-400 font-semibold">50 000 FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span>8h (journée complète)</span>
                  <span className="text-cyan-400 font-semibold">80 000 FCFA</span>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  * Tarifs incluant l'accompagnement du producteur
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Informations de réservation</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
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
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
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
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
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
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Parlez-nous de votre projet musical..."
                />
              </div>

              {/* Booking Summary */}
              {selectedDate && selectedSlot && (
                <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-lg p-4 border border-purple-500/30">
                  <h4 className="font-semibold text-white mb-2">Récapitulatif</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>Date: {new Date(selectedDate).toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</div>
                    <div>Créneau: {timeSlots.find(slot => slot.id === selectedSlot)?.time}</div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedDate || !selectedSlot}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
              >
                Confirmer la Réservation
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calendar;