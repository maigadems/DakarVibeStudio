import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, Twitter, Send } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    sujet: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Message envoyé ! Nous vous répondrons dans les plus brefs délais.');
    setFormData({ nom: '', email: '', sujet: '', message: '' });
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Téléphone',
      details: ['+221 77 123 45 67', '+221 70 987 65 43'],
      color: 'text-green-400'
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['contact@studiodakarvibes.com', 'booking@studiodakarvibes.com'],
      color: 'text-blue-400'
    },
    {
      icon: MapPin,
      title: 'Adresse',
      details: ['Almadies, Dakar', 'Sénégal'],
      color: 'text-red-400'
    },
    {
      icon: Clock,
      title: 'Horaires',
      details: ['Lun - Dim: 9h00 - 23h00', 'Sur rendez-vous'],
      color: 'text-purple-400'
    }
  ];

  const socialLinks = [
    { icon: Instagram, name: 'Instagram', url: '#', color: 'hover:text-pink-400' },
    { icon: Facebook, name: 'Facebook', url: '#', color: 'hover:text-blue-400' },
    { icon: Twitter, name: 'Twitter', url: '#', color: 'hover:text-cyan-400' }
  ];

  return (
    <section className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Contactez-Nous
            </span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Une question sur nos services ? Un projet musical en tête ? 
            N'hésitez pas à nous contacter, nous serions ravis d'échanger avec vous.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-8">Envoyez-nous un message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sujet *
                </label>
                <select
                  required
                  value={formData.sujet}
                  onChange={(e) => setFormData({ ...formData, sujet: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="reservation">Réservation de studio</option>
                  <option value="collaboration">Collaboration artistique</option>
                  <option value="production">Production musicale</option>
                  <option value="tarifs">Informations sur les tarifs</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  rows={6}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Décrivez votre projet ou votre demande..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Envoyer le Message</span>
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-8">Informations de contact</h3>
              <div className="grid gap-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <div key={index} className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600/20 to-cyan-600/20 flex items-center justify-center border border-purple-500/30`}>
                          <Icon className={`w-6 h-6 ${info.color}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-2">{info.title}</h4>
                          {info.details.map((detail, i) => (
                            <p key={i} className="text-gray-300 text-sm">{detail}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Suivez-nous</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.url}
                      className={`w-12 h-12 bg-gray-800/50 rounded-lg flex items-center justify-center border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 text-gray-400 ${social.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
              <h4 className="font-semibold text-white mb-4">Localisation</h4>
              <div className="aspect-video bg-gray-700/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Carte interactive</p>
                  <p className="text-gray-500 text-xs">Almadies, Dakar</p>
                </div>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-xl p-6 border border-purple-500/30">
              <h4 className="font-semibold text-white mb-3">Contact Rapide</h4>
              <p className="text-gray-300 text-sm mb-4">
                Pour une réponse immédiate, appelez-nous directement ou envoyez un WhatsApp.
              </p>
              <div className="flex space-x-3">
                <button className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors">
                  WhatsApp
                </button>
                <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors">
                  Appeler
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;