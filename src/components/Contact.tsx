import React, { useState } from 'react';
import { Phone, Mail, MapPin, Instagram, Clock, Ghost } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Créer le message WhatsApp
    const whatsappMessage = `Nouveau message depuis le site Westaf Studio:

Nom: ${formData.name}
Email: ${formData.email}
Sujet: ${formData.subject}

Message:
${formData.message}`;

    const whatsappUrl = `https://wa.me/221710162323?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Ouvrir WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Réinitialiser le formulaire après un délai
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setIsSubmitting(false);
      alert('Message envoyé ! Vous allez être redirigé vers WhatsApp.');
    }, 1000);
  };

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Contactez-Nous
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Prêt à créer votre prochain hit ? Contactez-nous dès maintenant pour discuter de votre projet.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Téléphone</h3>
                <div className="text-gray-300 space-y-1">
                  <p>+221 71 016 23 23</p>
                  <p>+221 33 825 79 51</p>
                </div>
                <p className="text-sm text-gray-400">Disponible 24h/24, 7j/7</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Email</h3>
                <p className="text-gray-300">booking.westafrecords@gmail.com</p>
                <p className="text-sm text-gray-400">Réponse sous 24h</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Adresse</h3>
                <p className="text-gray-300">Dakar, Sénégal</p>
                <p className="text-sm text-gray-400">Studio accessible en transport</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Instagram</h3>
                <a 
                  href="https://www.instagram.com/westafrecords?igsh=MTFuNWEyNG5mYWpxeQ%3D%3D&utm_source=qr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:text-orange-300 transition-colors"
                >
                  @westafrecords
                </a>
                <p className="text-sm text-gray-400">Suivez nos dernières créations</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Ghost className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Snapchat</h3>
                <a 
                  href="https://t.snapchat.com/Y4O4g5fy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  Westaf Records
                </a>
                <p className="text-sm text-gray-400">Découvrez nos coulisses</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Horaires</h3>
                <div className="text-gray-300 space-y-1">
                  <p>Lundi - Samedi: 9h - 22h</p>
                  <p>Dimanche: Fermé</p>
                </div>
                <p className="text-sm text-gray-400">Sessions sur rendez-vous</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gradient-to-b from-orange-500/10 to-red-500/10 p-8 rounded-2xl border border-orange-500/20">
            <h3 className="text-2xl font-bold text-white mb-6">Envoyez-nous un message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                  Sujet
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  placeholder="Sujet de votre message"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-black/50 border border-orange-500/30 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
                  placeholder="Décrivez votre projet..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-6 py-3 font-semibold rounded-lg transition-all duration-300 shadow-lg ${
                  isSubmitting
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transform hover:scale-105 shadow-orange-500/25'
                }`}
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer le Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;