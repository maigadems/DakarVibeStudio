import React from 'react';
import { Award, Music2, Users, Zap } from 'lucide-react';

const About: React.FC = () => {
  const features = [
    {
      icon: Music2,
      title: 'Équipement Professionnel',
      description: 'Studio équipé avec du matériel de pointe pour une qualité sonore exceptionnelle'
    },
    {
      icon: Award,
      title: 'Expertise Reconnue',
      description: '5 ans d\'expérience dans la production musicale avec des artistes renommés'
    },
    {
      icon: Users,
      title: 'Accompagnement Personnalisé',
      description: 'Suivi individuel pour chaque projet, de la création à la finalisation'
    },
    {
      icon: Zap,
      title: 'Sessions Flexibles',
      description: 'Créneaux adaptés à vos besoins, 7j/7 pour votre créativité'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              À Propos du Studio
            </span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Studio Dakar Vibes est un espace créatif dédié à la production musicale professionnelle, 
            situé au cœur de Dakar. Nous accompagnons les artistes dans la réalisation de leurs projets musicaux.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Studio Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl border border-purple-500/20">
              <img 
                src="/2.PNG"
                alt="Studio Dakar Vibes - Vue intérieure"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-bold text-white mb-2">Studio Principal</h3>
                <p className="text-gray-200 text-sm">Espace d'enregistrement acoustiquement traité</p>
              </div>
            </div>
            
            {/* Floating card */}
            <div className="absolute -right-4 -bottom-4 bg-gray-800/90 backdrop-blur-md rounded-xl p-4 border border-cyan-500/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">24/7</div>
                <div className="text-xs text-gray-300">Disponible</div>
              </div>
            </div>
          </div>

          {/* Producer Info */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-white">Producteur & Beatmaker</h3>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong className="text-purple-400">Mamadou Diallo</strong>, beatmaker professionnel basé à Dakar, 
                spécialisé dans la fusion des sonorités africaines avec les genres urbains contemporains.
              </p>
              <p>
                Avec plus de 5 années d'expérience, j'ai collaboré avec de nombreux artistes locaux et 
                internationaux pour créer des productions uniques qui reflètent l'âme de la musique sénégalaise.
              </p>
              <p>
                Mon approche combine techniques modernes et instruments traditionnels pour offrir 
                un son authentique et innovant.
              </p>
            </div>

            {/* Skills */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4 text-white">Spécialités</h4>
              <div className="flex flex-wrap gap-2">
                {['Afrobeat', 'Trap', 'Hip-Hop', 'R&B', 'Afro-Trap', 'Dancehall'].map((skill) => (
                  <span 
                    key={skill}
                    className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-full text-sm border border-purple-500/20 text-purple-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default About;