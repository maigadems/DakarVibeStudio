import React from 'react';
import { Check, Star, Zap, Clock, Headphones, Volume2 } from 'lucide-react';

interface PricingProps {
  setCurrentSection: (section: string) => void;
}

const Pricing: React.FC<PricingProps> = ({ setCurrentSection }) => {
  const studioPackages = [
    {
      name: "1 Heure",
      price: "50,000",
      duration: "1h",
      description: "Session courte",
      features: [
        "1 heure de studio",
        "Enregistrement professionnel",
        "Support technique",
        "Fichiers de base"
      ],
      popular: false,
      color: "from-gray-600 to-gray-700",
      icon: Clock
    },
    {
      name: "4 Heures",
      price: "200,000",
      duration: "4h",
      description: "Le plus populaire",
      features: [
        "4 heures de studio",
        "Enregistrement professionnel",
        "Support prioritaire",
        "Fichiers haute qualité",
        "1 révision incluse"
      ],
      popular: true,
      color: "from-orange-500 to-red-500",
      icon: Star
    },
    {
      name: "8 Heures",
      price: "400,000",
      duration: "8h",
      description: "Session complète",
      features: [
        "8 heures de studio",
        "Enregistrement premium",
        "Support 24/7",
        "Fichiers multi-formats",
        "3 révisions incluses",
        "Consultation artistique"
      ],
      popular: false,
      color: "from-yellow-500 to-orange-500",
      icon: Zap
    }
  ];

  const additionalServices = [
    {
      name: "Mixage de Titre",
      price: "150,000",
      description: "Mixage professionnel de votre titre",
      features: [
        "Mixage professionnel",
        "Égalisation avancée",
        "Effets et traitements",
        "3 révisions incluses",
        "Paiement échelonné possible"
      ],
      color: "from-purple-500 to-pink-500",
      icon: Headphones
    },
    {
      name: "Mastering",
      price: "100,000",
      description: "Finalisation de votre titre",
      features: [
        "Mastering professionnel",
        "Optimisation pour diffusion",
        "Loudness standardisé",
        "Formats multiples",
        "Qualité radio/streaming"
      ],
      color: "from-blue-500 to-cyan-500",
      icon: Volume2
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 bg-clip-text text-transparent">
            Nos Tarifs
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
            Studio disponible 24h/24 - Réservation par heure
          </p>
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-4 max-w-md mx-auto border border-orange-500/30">
            <p className="text-orange-400 font-semibold text-lg">50,000 FCFA / Heure</p>
            <p className="text-gray-300 text-sm">Tarif unique - Studio ouvert 24h/24</p>
          </div>
        </div>

        {/* Forfaits Studio */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-8 text-orange-400">Forfaits Studio</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {studioPackages.map((plan, index) => {
              const IconComponent = plan.icon;
              return (
                <div
                  key={index}
                  className={`relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
                    plan.popular 
                      ? 'border-orange-500 shadow-2xl shadow-orange-500/20' 
                      : 'border-gray-700 hover:border-orange-500/50'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                        <Star className="w-4 h-4" />
                        <span>Plus Populaire</span>
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                    <p className="text-gray-400 mb-4">{plan.description}</p>
                    <div className="mb-4">
                      <span className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                        {plan.price}
                      </span>
                      <span className="text-gray-400 ml-2">FCFA</span>
                    </div>
                    <div className="text-orange-400 font-semibold">
                      {plan.duration} de studio
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${plan.popular ? 'from-orange-500 to-red-500' : 'from-gray-600 to-gray-700'} flex items-center justify-center flex-shrink-0`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => {
                      setCurrentSection('reservation');
                      // Force scroll vers le haut avec un délai pour mobile
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }, 50);
                    }}
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-orange-500/25'
                        : 'bg-gray-700 text-white hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Zap className="w-5 h-5" />
                      <span>Réserver Maintenant</span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Services Additionnels */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-8 text-red-400">Services Additionnels</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {additionalServices.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border-2 border-gray-700 hover:border-orange-500/50 transition-all duration-300 hover:scale-105"
                >
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${service.color} rounded-full flex items-center justify-center`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-white">{service.name}</h3>
                    <p className="text-gray-400 mb-4">{service.description}</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                        {service.price}
                      </span>
                      <span className="text-gray-400 ml-2">FCFA</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => {
                      setCurrentSection('contact');
                      // Force scroll vers le haut avec un délai pour mobile
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }, 50);
                    }}
                    className="w-full py-3 rounded-xl font-semibold bg-gray-700 text-white hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 transition-all duration-300"
                  >
                    Demander un Devis
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-6 max-w-2xl mx-auto border border-orange-500/20">
            <h4 className="text-xl font-bold text-white mb-2">Studio Ouvert 24h/24</h4>
            <p className="text-gray-300 mb-4">
              Réservez votre créneau à n'importe quelle heure du jour ou de la nuit
            </p>
            <button
              onClick={() => {
                setCurrentSection('contact');
                // Force scroll vers le haut avec un délai pour mobile
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 50);
              }}
              className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
            >
              Contactez-nous pour plus d'informations
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;