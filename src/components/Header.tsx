import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  currentSection: string;
  setCurrentSection: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentSection, setCurrentSection }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (section: string) => {
    setCurrentSection(section);
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-orange-500/20">
      <div className="container mx-auto px-4 py-1">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => handleNavigation('accueil')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-300"
          >
            <img 
              src="/logo.jpg" 
              alt="Westaf Records Logo" 
              className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-orange-500 flex-shrink-0"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Westaf Records
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavigation('accueil')}
              className={`transition-colors ${
                currentSection === 'accueil' ? 'text-orange-400' : 'text-white hover:text-orange-400'
              }`}
            >
              Accueil
            </button>
            <button
              onClick={() => handleNavigation('accueil')}
              className={`transition-colors ${
                currentSection === 'accueil' ? 'text-orange-400' : 'text-white hover:text-orange-400'
              }`}
            >
              À Propos
            </button>
            <button
              onClick={() => handleNavigation('accueil')}
              className={`transition-colors ${
                currentSection === 'accueil' ? 'text-orange-400' : 'text-white hover:text-orange-400'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => handleNavigation('tarifs')}
              className={`transition-colors ${
                currentSection === 'tarifs' ? 'text-orange-400' : 'text-white hover:text-orange-400'
              }`}
            >
              Tarifs
            </button>
            <button
              onClick={() => handleNavigation('reservation')}
              className={`transition-colors ${
                currentSection === 'reservation' ? 'text-orange-400' : 'text-white hover:text-orange-400'
              }`}
            >
              Réservation
            </button>
            <button
              onClick={() => handleNavigation('contact')}
              className={`transition-colors ${
                currentSection === 'contact' ? 'text-orange-400' : 'text-white hover:text-orange-400'
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-orange-400 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-orange-500/20">
            <div className="flex flex-col space-y-4 pt-4">
              <button
                onClick={() => handleNavigation('accueil')}
                className={`transition-colors text-left ${
                  currentSection === 'accueil' ? 'text-orange-400' : 'text-white hover:text-orange-400'
                }`}
              >
                Accueil
              </button>
              <button
                onClick={() => handleNavigation('accueil')}
                className={`transition-colors text-left ${
                  currentSection === 'accueil' ? 'text-orange-400' : 'text-white hover:text-orange-400'
                }`}
              >
                À Propos
              </button>
              <button
                onClick={() => handleNavigation('accueil')}
                className={`transition-colors text-left ${
                  currentSection === 'accueil' ? 'text-orange-400' : 'text-white hover:text-orange-400'
                }`}
              >
                Services
              </button>
              <button
                onClick={() => handleNavigation('tarifs')}
                className={`transition-colors text-left ${
                  currentSection === 'tarifs' ? 'text-orange-400' : 'text-white hover:text-orange-400'
                }`}
              >
                Tarifs
              </button>
              <button
                onClick={() => handleNavigation('reservation')}
                className={`transition-colors text-left ${
                  currentSection === 'reservation' ? 'text-orange-400' : 'text-white hover:text-orange-400'
                }`}
              >
                Réservation
              </button>
              <button
                onClick={() => handleNavigation('contact')}
                className={`transition-colors text-left ${
                  currentSection === 'contact' ? 'text-orange-400' : 'text-white hover:text-orange-400'
                }`}
              >
                Contact
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;