import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Calendar from './components/Calendar';
import Pricing from './components/Pricing';
import AudioSection from './components/AudioSection';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  const [currentSection, setCurrentSection] = useState('accueil');

  // Fonction pour changer de section avec scroll vers le haut
  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
    // Scroll vers le haut pour tous les changements de section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleNavigateToReservation = () => {
      setCurrentSection('reservation');
      // Force scroll vers le haut avec un délai pour s'assurer que la page est chargée
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    };

    const handleNavigateFromFooter = (event: CustomEvent) => {
      const targetSection = event.detail;
      if (targetSection === 'productions') {
        // Pour "Productions", aller à la page d'accueil et scroller vers AudioSection
        setCurrentSection('accueil');
        setTimeout(() => {
          const audioSection = document.getElementById('audio');
          if (audioSection) {
            audioSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        setCurrentSection(targetSection);
        // Force scroll vers le haut avec un délai
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    };

    const handleScrollToAbout = () => {
      // Si on n'est pas sur la page d'accueil, y aller d'abord
      if (currentSection !== 'accueil') {
        setCurrentSection('accueil');
      }
      // Scroll vers la section About après un petit délai
      setTimeout(() => {
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
          aboutSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    };

    window.addEventListener('navigateToReservation', handleNavigateToReservation);
    window.addEventListener('navigateFromFooter', handleNavigateFromFooter as EventListener);
    window.addEventListener('scrollToAbout', handleScrollToAbout);
    
    return () => {
      window.removeEventListener('navigateToReservation', handleNavigateToReservation);
      window.removeEventListener('navigateFromFooter', handleNavigateFromFooter as EventListener);
      window.removeEventListener('scrollToAbout', handleScrollToAbout);
    };
  }, [currentSection]);

  const renderSection = () => {
    switch (currentSection) {
      case 'accueil':
        return (
          <>
            <Hero />
            <About />
            <AudioSection setCurrentSection={setCurrentSection} />
          </>
        );
      case 'reservation':
        return <Calendar />;
      case 'tarifs':
        return <Pricing setCurrentSection={setCurrentSection} />;
      case 'contact':
        return <Contact />;
      default:
        return (
          <>
            <Hero />
            <About />
            <AudioSection setCurrentSection={setCurrentSection} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header currentSection={currentSection} setCurrentSection={handleSectionChange} />
      <main>
        {renderSection()}
      </main>
      <Footer />
    </div>
  );
}

export default App;