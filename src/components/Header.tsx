import React from 'react';
import { Music, Calendar, DollarSign, Phone } from 'lucide-react';

interface HeaderProps {
  currentSection: string;
  setCurrentSection: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentSection, setCurrentSection }) => {
  const menuItems = [
    { id: 'accueil', label: 'Accueil', icon: Music },
    { id: 'reservation', label: 'Réservation', icon: Calendar },
    { id: 'tarifs', label: 'Tarifs', icon: DollarSign },
    { id: 'contact', label: 'Contact', icon: Phone },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Studio Dakar Vibes
              </h1>
              <p className="text-xs text-gray-400">Beatmaker Professionnel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentSection(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    currentSection === item.id
                      ? 'bg-purple-600/20 text-purple-400 shadow-lg shadow-purple-500/25'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile menu */}
          <div className="md:hidden">
            <select
              value={currentSection}
              onChange={(e) => setCurrentSection(e.target.value)}
              className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-purple-500/20"
            >
              {menuItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;