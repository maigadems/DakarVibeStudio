import React, { useState, useRef } from 'react';
import { Play, Pause, Music, Calendar, Volume2, Download } from 'lucide-react';

interface AudioSectionProps {
  setCurrentSection: (section: string) => void;
}

const AudioSection: React.FC<AudioSectionProps> = ({ setCurrentSection }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const tracks = [
    {
      id: 1,
      title: "Afrobeat Vibes",
      artist: "Westaf Studio",
      duration: "3:45",
      url: "#"
    },
    {
      id: 2,
      title: "Trap Senegal",
      artist: "Westaf Studio",
      duration: "4:12",
      url: "#"
    },
    {
      id: 3,
      title: "Mbalax Fusion",
      artist: "Westaf Studio",
      duration: "3:28",
      url: "#"
    }
  ];

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <section id="audio" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 bg-clip-text text-transparent">
            Nos Productions
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Découvrez quelques-unes de nos créations musicales réalisées dans notre studio
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Player Principal */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 mb-8 border border-orange-500/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-orange-400">Afrobeat Vibes</h3>
                <p className="text-gray-400">Westaf Studio Production</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </button>
                <Volume2 className="w-6 h-6 text-orange-400" />
              </div>
            </div>

            {/* Barre de progression */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            >
              <source src="#" type="audio/mpeg" />
            </audio>
          </div>

          {/* Liste des tracks */}
          <div className="grid gap-4">
            {tracks.map((track) => (
              <div key={track.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-orange-500/50 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button className="w-12 h-12 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center group-hover:from-orange-500 group-hover:to-red-500 transition-all duration-300">
                      <Play className="w-5 h-5 text-orange-400 group-hover:text-white ml-0.5" />
                    </button>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{track.title}</h4>
                      <p className="text-gray-400">{track.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400">{track.duration}</span>
                    <button className="p-2 text-gray-400 hover:text-orange-400 transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
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
    </section>
  );
};

export default AudioSection;