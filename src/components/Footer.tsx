import React from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Camera, Ghost } from 'lucide-react';

const Footer: React.FC = () => {
  const socialLinks = [
    { icon: Instagram, name: 'Instagram', url: 'https://www.instagram.com/westafrecords?igsh=MTFuNWEyNG5mYWpxeQ%3D%3D&utm_source=qr' },
    { icon: Ghost, name: 'Snapchat', url: 'https://t.snapchat.com/Y4O4g5fy' },
    { icon: Facebook, name: 'Facebook', url: '#' },
    { icon: Twitter, name: 'Twitter', url: '#' }
  ];

  const quickLinks = [
    { name: 'Accueil', section: 'accueil' },
    { name: 'Réservation', section: 'reservation' },
    { name: 'Tarifs', section: 'tarifs' },
    { name: 'Compositions', section: 'productions' },
    { name: 'Contact', section: 'contact' }
  ];

  const services = [
    'Enregistrement Studio',
    'Composition musicale',
    'Mix & Mastering',
    'Voix off',
    'Conception de jingle',
    'Coaching Vocal',
    'Direction Artistique'
  ];

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-20 h-20 rounded-lg flex items-center justify-center shadow-lg p-0.5 bg-gradient-to-r from-orange-500 to-red-500">
                <img 
                  src="/logo.jpg" 
                  alt="Westaf Records Logo" 
                  className="w-full h-full rounded-lg object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Westaf Records
                </h3>
                <p className="text-xs text-gray-400">Studio d'enregistrement professionnel à Dakar</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Votre destination pour des productions musicales de qualité professionnelle au cœur de Dakar.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.url}
                   target="_blank"
                   rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                   title={social.name}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Navigation</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('navigateFromFooter', { detail: link.section }))}
                    className="text-gray-400 hover:text-white transition-colors text-sm text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Nos Services</h4>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index} className="text-gray-400 text-sm">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-orange-400" />
                <div className="text-gray-400 text-sm space-y-1">
                  <div>+221 71 016 23 23</div>
                  <div>+221 33 825 79 51</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-red-400" />
                <div className="text-gray-400 text-sm space-y-1">
                  <div>contact@westafrecords.com</div>
                  <div className="text-orange-400">prod@westafrecords.com</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-400 text-sm">Almadies, Dakar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Westaf Studio. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Mentions Légales
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Politique de Confidentialité
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                CGV
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;