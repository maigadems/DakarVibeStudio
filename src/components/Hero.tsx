import React, { useEffect, useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

const Hero: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);

  const tracks = [
    'Afrobeat Fusion',
    'Trap Dakar',
    'Melodic Vibes',
    'Urban Sound'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setCurrentTrack((prev) => (prev + 1) % tracks.length);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isPlaying, tracks.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with animated overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <div className="absolute inset-0 bg-[url('/1.PNG')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Main title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
          <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
            STUDIO DAKAR
          </span>
          <span className="block text-white mt-2">VIBES</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Votre destination pour des <span className="text-purple-400 font-semibold">beats uniques</span> et des 
          <span className="text-cyan-400 font-semibold"> sessions d'enregistrement professionnelles</span> au cœur de Dakar
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-purple-400">500+</div>
            <div className="text-sm text-gray-400">Beats Créés</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-cyan-400">200+</div>
            <div className="text-sm text-gray-400">Artistes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-pink-400">5</div>
            <div className="text-sm text-gray-400">Ans d'Expérience</div>
          </div>
        </div>

        {/* Audio player simulation */}
        <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 mb-8 border border-purple-500/20 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Volume2 className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-300">En cours de lecture</span>
            </div>
            <div className="text-xs text-gray-400">2:34 / 3:42</div>
          </div>
          
          <div className="text-center mb-4">
            <div className="text-lg font-semibold text-white">{tracks[currentTrack]}</div>
            <div className="text-sm text-gray-400">Studio Dakar Vibes</div>
          </div>

          <div className="flex items-center justify-center space-x-4 mb-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: isPlaying ? '67%' : '45%' }}
            ></div>
          </div>
        </div>

        {/* CTA Button */}
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25">
          Réserver Une Session
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-purple-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-purple-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;