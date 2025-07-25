import React, { useState } from 'react';
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

  const renderSection = () => {
    switch (currentSection) {
      case 'accueil':
        return (
          <>
            <Hero />
            <About />
            <AudioSection />
          </>
        );
      case 'reservation':
        return <Calendar />;
      case 'tarifs':
        return <Pricing />;
      case 'contact':
        return <Contact />;
      default:
        return (
          <>
            <Hero />
            <About />
            <AudioSection />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header currentSection={currentSection} setCurrentSection={setCurrentSection} />
      <main>
        {renderSection()}
      </main>
      <Footer />
    </div>
  );
}

export default App;