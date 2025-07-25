import React, { useState } from 'react';
import { Play, Pause, Volume2, ExternalLink, Download } from 'lucide-react';

const AudioSection: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const tracks = [
    {
      title: 'Afrobeat Fusion',
      genre: 'Afrobeat / Trap',
      duration: '3:42',
      bpm: '120',
      key: 'Am',
      image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2'
    },
    {
      title: 'Dakar Nights',
      genre: 'Trap / Hip-Hop',
      duration: '4:15',
      bpm: '140',
      key: 'Gm',
      image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2'
    },
    {
      title: 'Teranga Vibes',
      genre: 'Afro-R&B',
      duration: '3:28',
      bpm: '95',
      key: 'C',
      image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2'
    },
    {
      title: 'Urban Wolof',
      genre: 'Dancehall / Afro',
      duration: '3:55',
      bpm: '100',
      key: 'Em',
      image: 'https://images.pexels.com/photos/1644775/pexels-photo-1644775.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Écoutez Mes Productions
            </span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Découvrez une sélection de mes dernières créations, mélangeant sonorités africaines 
            et genres urbains contemporains.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Player Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 border border-purple-500/20">
              {/* Current Track Display */}
              <div className="flex items-center space-x-6 mb-8">
                <div className="relative">
                  <img 
                    src={tracks[currentTrack].image}
                    alt={tracks[currentTrack].title}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-xl"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">{tracks[currentTrack].title}</h3>
                  <p className="text-gray-300 mb-2">{tracks[currentTrack].genre}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{tracks[currentTrack].bpm} BPM</span>
                    <span>•</span>
                    <span>Clé: {tracks[currentTrack].key}</span>
                    <span>•</span>
                    <span>{tracks[currentTrack].duration}</span>
                  </div>
                </div>
              </div>

              {/* Player Controls */}
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-6">
                  <button className="p-3 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition-colors">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                  >
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                  </button>
                  
                  <button className="p-3 rounded-full bg-gray-700/50 hover:bg-gray-600/50 transition-colors">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                    </svg>
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>1:23</span>
                    <span>{tracks[currentTrack].duration}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: '35%' }}
                    ></div>
                  </div>
                </div>

                {/* Volume & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Volume2 className="w-5 h-5 text-gray-400" />
                    <div className="w-24 bg-gray-700 rounded-full h-1">
                      <div className="bg-purple-500 h-1 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors">
                      <Download className="w-4 h-4 text-gray-300" />
                    </button>
                    <button className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors">
                      <ExternalLink className="w-4 h-4 text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Playlist */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-6">Playlist</h3>
            <div className="space-y-3">
              {tracks.map((track, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTrack(index)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                    currentTrack === index
                      ? 'bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border border-purple-500/50'
                      : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <img 
                      src={track.image}
                      alt={track.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">{track.title}</h4>
                      <p className="text-sm text-gray-400 truncate">{track.genre}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">{track.duration}</div>
                      <div className="text-xs text-gray-500">{track.bpm} BPM</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* SoundCloud Link */}
            <div className="mt-8 p-6 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl border border-orange-500/30">
              <h4 className="font-semibold text-white mb-3">Plus de productions</h4>
              <p className="text-gray-300 text-sm mb-4">
                Retrouvez l'intégralité de mes créations sur SoundCloud
              </p>
              <button className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                <ExternalLink className="w-4 h-4" />
                <span>Visiter SoundCloud</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AudioSection;