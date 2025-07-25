import React from 'react';
import { Clock, Star, Zap, Crown } from 'lucide-react';

const Pricing: React.FC = () => {
  const pricingPlans = [
    {
      name: 'Session Express',
      duration: '2 heures',
      price: '25 000',
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      popular: false,
      features: [
        'Enregistrement professionnel',
        'Mix de base inclus',
        'Accompagnement producteur',
        '1 révision incluse',
        'Formats MP3 et WAV'
      ]
    },
    {
      name: 'Demi-Journée',
      duration: '4 heures',
      price: '50 000',
      icon: Star,
      color: 'from-purple-500 to-pink-500',
      popular: true,
      features: [
        'Tout de la Session Express',
        'Mix et mastering avancé',
        'Création de beats personnalisés',
        '3 révisions incluses',
        'Session de coaching vocal',
        'Tous formats audio'
      ]
    },
    {
      name: 'Journée Complète',
      duration: '8 heures',
      price: '80 000',
      icon: Crown,
      color: 'from-orange-500 to-red-500',
      popular: false,
      features: [
        'Tout de la Demi-Journée',
        'Production complète d\'un titre',
        'Arrangements musicaux',
        'Révisions illimitées',
        'Session de direction artistique',
        'Livraison stems séparés'
      ]
    }
  ];

  const additionalServices = [
    { service: 'Mix & Mastering uniquement', price: '15 000 FCFA' },
    { service: 'Création de beat personnalisé', price: '20 000 FCFA' },
    { service: 'Séance de coaching vocal', price: '10 000 FCFA' },
    { service: 'Arrangement musical', price: '25 000 FCFA' }
  ];

  return (
    <section className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Nos Tarifs
            </span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Des formules adaptées à tous les projets musicaux, des sessions express aux productions complètes.
            Tous nos tarifs incluent l'équipement professionnel et l'accompagnement personnalisé.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={index}
                className={`relative bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 border transition-all duration-300 hover:transform hover:scale-105 ${
                  plan.popular 
                    ? 'border-purple-500/50 shadow-2xl shadow-purple-500/20' 
                    : 'border-gray-700/50 hover:border-gray-600/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Plus Populaire
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">{plan.duration}</span>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <div className="text-4xl font-bold text-white mb-2">
                    {plan.price}
                    <span className="text-lg text-gray-400 font-normal"> FCFA</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center mt-0.5 mr-3 flex-shrink-0`}>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg'
                    : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 border border-gray-600'
                }`}>
                  Réserver Cette Session
                </button>
              </div>
            );
          })}
        </div>

        {/* Additional Services */}
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Services Additionnels</h3>
            <div className="space-y-4">
              {additionalServices.map((item, index) => (
                <div key={index} className="bg-gray-800/50 backdrop-blur-md rounded-lg p-4 border border-gray-700/50 flex justify-between items-center">
                  <span className="text-gray-300">{item.service}</span>
                  <span className="text-purple-400 font-semibold">{item.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Informations Importantes</h3>
            <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-xl p-6 border border-purple-500/30">
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm">Acompte de 50% requis pour confirmer la réservation</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm">Annulation gratuite jusqu'à 48h avant la session</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm">Remise de 10% pour les réservations de 3 sessions ou plus</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm">Possibilité de paiement échelonné sur demande</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 text-center">
              <button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">
                Demander un Devis Personnalisé
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;