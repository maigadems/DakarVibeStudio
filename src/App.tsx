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
  // Initialiser la section basée sur l'URL ou 'accueil' par défaut
  const [currentSection, setCurrentSection] = useState(() => {
    const hash = window.location.hash.slice(1);
    return hash || 'accueil';
  });

  // Fonction pour changer de section avec scroll vers le haut
  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
    // Mettre à jour l'URL avec pushState pour créer une entrée dans l'historique
    window.history.pushState({ section }, '', `#${section}`);
    // Scroll vers le haut pour tous les changements de section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    // Gérer la navigation avec les flèches du navigateur
    const handlePopState = (event: PopStateEvent) => {
      const hash = window.location.hash.slice(1);
      const section = hash || 'accueil';
      setCurrentSection(section);
      // Scroll vers le haut quand on navigue avec les flèches
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);

    const handleNavigateToReservation = () => {
      // S'assurer qu'on ajoute la page actuelle à l'historique avant de naviguer
      if (currentSection !== 'reservation') {
        // Ajouter la page actuelle à l'historique si ce n'est pas déjà fait
        const currentHash = window.location.hash.slice(1);
        if (currentHash !== currentSection) {
          window.history.pushState({ section: currentSection }, '', `#${currentSection}`);
        }
      }
      setCurrentSection('reservation');
      window.history.pushState({ section: 'reservation' }, '', '#reservation');
      // Force scroll vers le haut avec un délai pour s'assurer que la page est chargée
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    };

    const handleNavigateFromFooter = (event: CustomEvent) => {
      const targetSection = event.detail;
      // S'assurer qu'on ajoute la page actuelle à l'historique avant de naviguer
      if (currentSection !== targetSection) {
        const currentHash = window.location.hash.slice(1);
        if (currentHash !== currentSection) {
          window.history.pushState({ section: currentSection }, '', `#${currentSection}`);
        }
      }
      
      if (targetSection === 'productions') {
        // Pour "Productions", aller à la page d'accueil et scroller vers AudioSection
        setCurrentSection('accueil');
        window.history.pushState({ section: 'accueil' }, '', '#accueil');
        setTimeout(() => {
          const audioSection = document.getElementById('audio');
          if (audioSection) {
            audioSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        setCurrentSection(targetSection);
        window.history.pushState({ section: targetSection }, '', `#${targetSection}`);
        // Force scroll vers le haut avec un délai
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    };

    const handleScrollToAbout = () => {
      // Si on n'est pas sur la page d'accueil, y aller d'abord
      if (currentSection !== 'accueil') {
        // Ajouter la page actuelle à l'historique avant de naviguer
        const currentHash = window.location.hash.slice(1);
        if (currentHash !== currentSection) {
          window.history.pushState({ section: currentSection }, '', `#${currentSection}`);
        }
        setCurrentSection('accueil');
        window.history.pushState({ section: 'accueil' }, '', '#accueil');
      }
      // Scroll vers la section About après un petit délai
      setTimeout(() => {
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
          aboutSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    };

    // Nouveau gestionnaire pour la navigation avec historique
    const handleNavigateWithHistory = (event: CustomEvent) => {
      const { fromSection, toSection } = event.detail;
      
      // S'assurer qu'on ajoute la page actuelle à l'historique avant de naviguer
      if (currentSection !== toSection) {
        const currentHash = window.location.hash.slice(1);
        if (currentHash !== currentSection) {
          window.history.pushState({ section: currentSection }, '', `#${currentSection}`);
        }
      }
      
      // Naviguer vers la nouvelle section
      setCurrentSection(toSection);
      window.history.pushState({ section: toSection }, '', `#${toSection}`);
      
      // Gestion spéciale pour la page contact (scroll vers formulaire)
      if (toSection === 'contact') {
        setTimeout(() => {
          const contactForm = document.getElementById('contact-form');
          if (contactForm) {
            contactForm.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
          }
        }, 100);
      } else {
        // Scroll vers le haut pour les autres pages
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 50);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('navigateToReservation', handleNavigateToReservation);
    window.addEventListener('navigateFromFooter', handleNavigateFromFooter as EventListener);
    window.addEventListener('scrollToAbout', handleScrollToAbout);
    window.addEventListener('navigateWithHistory', handleNavigateWithHistory as EventListener);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('navigateToReservation', handleNavigateToReservation);
      window.removeEventListener('navigateFromFooter', handleNavigateFromFooter as EventListener);
      window.removeEventListener('scrollToAbout', handleScrollToAbout);
      window.removeEventListener('navigateWithHistory', handleNavigateWithHistory as EventListener);
    };
  }, [currentSection]);

  // Mettre à jour l'URL initiale si nécessaire
  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState({ section: 'accueil' }, '', '#accueil');
    }
  }, []);
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