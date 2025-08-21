import React, { useState, useRef } from 'react';
import { Play, Pause, Music, Calendar, Volume2, Download, ExternalLink } from 'lucide-react';

interface AudioSectionProps {
  setCurrentSection: (section: string) => void;
}

const AudioSection: React.FC<AudioSectionProps> = ({ setCurrentSection }) => {

  const tracks = [
    {
      id: 1,
      title: "Fatou Sangaré",
      artist: "Westaf Studio Production",
      duration: "3:12",
      url: "https://music.apple.com/fr/song/fatou-sangar%C3%A9/1785404198",
      available: true
    },
    {
      id: 2,
      title: "Comme ni nga ma (feat. Astar)",
      artist: "Westaf Studio",
      duration: "3:45",
      url: "https://music.apple.com/fr/song/comme-ni-nga-ma-feat-astar/1774053167",
      available: true
    },
    {
      id: 3,
      title: "Damalay bëgg",
      artist: "Westaf Studio",
      duration: "3:20",
      url: "https://music.apple.com/fr/song/damalay-b%C3%ABgg/1813891527",
      available: true
    }
  ];

  const openAppleMusic = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <section id="audio" className="py-20 bg-gray-900 text-white relative overflow-hidden scroll-mt-20">
      {/* Bannière d'arrière-plan */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGNjUwMDtzdG9wLW9wYWNpdHk6MSIgLz4KPHN0b3Agb2Zmc2V0PSI1MCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNGRjk1MDA7c3RvcC1vcGFjaXR5OjEiIC8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGQzUwMDtzdG9wLW9wYWNpdHk6MSIgLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNncmFkaWVudCkiLz4KPGNpcmNsZSBjeD0iMjAwIiBjeT0iMjAwIiByPSIxNTAiIGZpbGw9IiMwMDAwMDAiIG9wYWNpdHk9IjAuNyIvPgo8dGV4dCB4PSIyMDAiIHk9IjIyMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQ4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RE08L3RleHQ+Cjwvc3ZnPgo=')`
        }}
      ></div>
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 bg-clip-text text-transparent">
            Nos Compositions Musicales
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Découvrez quelques-unes de nos compositions musicales réalisées dans notre studio
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Player Principal */}
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md rounded-2xl p-8 mb-8 border border-orange-500/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-orange-400">Fatou Sangaré</h3>
                <p className="text-gray-400">Westaf Studio Production</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => openAppleMusic(tracks[0].url)}
                  className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
                  title="Écouter sur Apple Music"
                >
                  <Play className="w-8 h-8 text-white ml-1" />
                </button>
                <ExternalLink className="w-6 h-6 text-orange-400" />
              </div>
            </div>

            {/* Info Apple Music */}
            <div className="text-center">
              <p className="text-gray-300 mb-2">Disponible sur Apple Music</p>
              <button
                onClick={() => openAppleMusic(tracks[0].url)}
                className="inline-flex items-center space-x-2 text-orange-400 hover:text-orange-300 transition-colors"
              >
                <span>Écouter maintenant</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Liste des tracks */}
          <div className="grid gap-4">
            {tracks.map((track) => (
              <div key={track.id} className="bg-gray-800/70 backdrop-blur-md rounded-xl p-6 border border-gray-700 hover:border-orange-500/50 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => track.available ? openAppleMusic(track.url) : null}
                      className="w-12 h-12 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center group-hover:from-orange-500 group-hover:to-red-500 transition-all duration-300"
                      title={track.available ? "Écouter sur Apple Music" : "Bientôt disponible"}
                    >
                      <Play className="w-5 h-5 text-orange-400 group-hover:text-white ml-0.5" />
                    </button>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{track.title}</h4>
                      <p className="text-gray-400">{track.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400">{track.duration}</span>
                    <a 
                      href={track.available ? track.url : "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-orange-400 transition-colors"
                      title={track.available ? "Écouter sur Apple Music" : "Bientôt disponible"}
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            {/* Section Playlist */}
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-purple-500/20">
              <h4 className="text-2xl font-bold text-white mb-4">
                🎵 Découvrez Toutes Nos Productions
              </h4>
              <p className="text-gray-300 mb-6">
                Écoutez l'intégralité de nos créations musicales dans notre playlist officielle
              </p>
              <a
                href="https://music.apple.com/fr/playlist/mbalax/pl.u-oZyllYaIRWNp6r8"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
              >
                <span>🎧</span>
                <span>Écouter la Playlist Complète</span>
                <ExternalLink className="w-5 h-5" />
              </a>
              <div className="mt-4 text-sm text-gray-400">
                Disponible sur Apple Music
              </div>
            </div>

            <button
              onClick={() => {
                setCurrentSection('reservation');
                // Force scroll vers le haut avec un délai pour mobile
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 50);
              }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-orange-500/25 transform hover:scale-105"
            >
              Réserver Une Session
            </button>
          </div>
        </div>
      </div>

      {/* Section Nouveaux Services */}
      <div className="py-16 bg-gradient-to-b from-gray-900 to-black relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Nouveaux Services
            </h3>
            <p className="text-lg text-gray-300">
              Découvrez nos dernières offres pour enrichir vos projets audio
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Voix off */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Volume2 className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">Voix off</h4>
                <span className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                  NOUVEAU
                </span>
              </div>
              <p className="text-gray-300 mb-6 text-center">
                Enregistrement professionnel de voix off pour vos publicités, documentaires, 
                présentations et contenus multimédias.
              </p>
              <ul className="space-y-2 text-sm text-gray-400 mb-6">
                <li>• Voix masculine et féminine disponibles</li>
                <li>• Enregistrement en cabine insonorisée</li>
                <li>• Traitement audio professionnel</li>
                <li>• Formats multiples (MP3, WAV)</li>
              </ul>
              <button
                onClick={() => {
                  // Aller à la page contact et scroller vers le formulaire
                  setCurrentSection('contact');
                  setTimeout(() => {
                    const contactForm = document.getElementById('contact-form');
                    if (contactForm) {
                      contactForm.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
                    }
                  }, 100);
                }}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                Demander un Devis
              </button>
            </div>

            {/* Conception de jingle */}
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-md rounded-2xl p-8 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">Conception de jingle</h4>
                <span className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                  NOUVEAU
                </span>
              </div>
              <p className="text-gray-300 mb-6 text-center">
                Création de jingles personnalisés pour radios, podcasts, chaînes YouTube 
                et événements d'entreprise.
              </p>
              <ul className="space-y-2 text-sm text-gray-400 mb-6">
                <li>• Composition originale sur mesure</li>
                <li>• Durée adaptée à vos besoins</li>
                <li>• Style musical personnalisé</li>
                <li>• Révisions incluses</li>
              </ul>
              <button
                onClick={() => {
                  // Aller à la page contact et scroller vers le formulaire
                  setCurrentSection('contact');
                  setTimeout(() => {
                    const contactForm = document.getElementById('contact-form');
                    if (contactForm) {
                      contactForm.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
                    }
                  }, 100);
                }}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
              >
                Demander un Devis
              </button>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 mb-4">
              Intéressé par nos nouveaux services ?
            </p>
            <button
              onClick={() => {
                // Aller à la page contact et scroller vers le formulaire
                setCurrentSection('contact');
                setTimeout(() => {
                  const contactForm = document.getElementById('contact-form');
                  if (contactForm) {
                    contactForm.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                  }
                }, 100);
              }}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-6 py-3 rounded-full font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-yellow-500/25"
            >
              Contactez-nous
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AudioSection;