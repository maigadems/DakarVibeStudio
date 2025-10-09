import React from 'react';
import { Music, Award, Users, Zap } from 'lucide-react';

const About = () => {
  const services = [
    'Enregistrement Studio',
    'Composition musicale',
    'Mix & Mastering',
    'Voix off',
    'Conception de jingle',
    'Voix off',
    'Conception de jingle',
    'Coaching Vocal',
    'Direction Artistique'
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-black to-gray-900 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              À Propos de Westaf Studio
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Un studio d'enregistrement moderne au cœur de Dakar, équipé des dernières technologies 
            pour donner vie à vos projets musicaux.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-3xl font-bold text-white mb-6">
              Notre <span className="text-orange-400">Vision</span>
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Westaf Studio est né de la passion pour la musique et de l'envie de créer un espace 
              où les artistes peuvent exprimer leur créativité sans limites. Nous combinons 
              l'expertise technique avec une approche artistique pour offrir des productions 
              de qualité internationale.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Notre mission est de démocratiser l'accès à un enregistrement professionnel 
              tout en préservant l'authenticité et l'originalité de chaque artiste.
            </p>
          </div>
          
          <div className="relative">
            <div className="rounded-2xl overflow-hidden border border-orange-500/30 shadow-2xl">
              <img 
                src="/WestAf Record-15.jpg" 
                alt="Studio Westaf Records - Équipement professionnel" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-b from-orange-500/10 to-transparent p-8 rounded-2xl border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-6">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Équipement Pro</h3>
            <div className="text-gray-300 space-y-4">
              <div>
                <h4 className="text-orange-400 font-semibold mb-2">Microphones</h4>
                <ul className="space-y-1 text-sm">
                  <li>• TLM 103</li>
                  <li>• AKG 414</li>
                  <li>• Série de SM58</li>
                  <li>• Série de SM57</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-orange-400 font-semibold mb-2">Préamplis</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Neve 1073spx</li>
                  <li>• Universal Audio</li>
                  <li>• X8</li>
                  <li>• Apollo Twin</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-orange-400 font-semibold mb-2">Monitoring</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Monitor Adam T7v</li>
                  <li>• Monitor Avantone</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-orange-400 font-semibold mb-2">Instruments</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Guitare basse</li>
                  <li>• Guitare électrique</li>
                  <li>• Guitare nylon</li>
                  <li>• Claviers (DX7, Korg Kross)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-orange-400 font-semibold mb-2">Casques</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Focal MG Pro</li>
                  <li>• Focal Celeste</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-red-500/10 to-transparent p-8 rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Équipe Experte</h3>
            <p className="text-gray-300">
              Ingénieurs du son certifiés et producteurs expérimentés pour vous accompagner 
              dans tous vos projets musicaux.
            </p>
          </div>

          <div className="bg-gradient-to-b from-yellow-500/10 to-transparent p-8 rounded-2xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Innovation</h3>
            <p className="text-gray-300">
              Techniques d'enregistrement modernes et créatives pour créer un son unique 
              qui vous démarque de la concurrence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;