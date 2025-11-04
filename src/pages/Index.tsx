
import React from 'react';
import LandingHero from '@/components/ui/LandingHero';
import Navbar from '@/components/layout/Navbar';
import FeatureCard from '@/components/ui/FeatureCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { Coffee, Calendar, Users, Clock, BarChart, UserCheck } from 'lucide-react';

const Index = () => {
  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        <LandingHero />
        
        <section className="py-24 px-4 sm:px-6">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Fonctionnalités de pointe</h2>
              <p className="text-xl text-white max-w-3xl mx-auto">
                Découvrez comment PauseManager Pro peut révolutionner votre gestion de services.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Coffee className="w-6 h-6 text-blue-500" />}
                title="Gestion des pauses café"
                description="Planifiez et suivez facilement toutes vos pauses café, standard ou renforcées."
                delayIndex={0}
              />
              
              <FeatureCard
                icon={<Clock className="w-6 h-6 text-indigo-500" />}
                title="Pauses déjeuner"
                description="Organisez les déjeuners avec suivi des menus et du nombre de participants."
                delayIndex={1}
              />
              
              <FeatureCard
                icon={<Calendar className="w-6 h-6 text-purple-500" />}
                title="Réservation de salles"
                description="Gérez les disponibilités et réservations de salles en temps réel."
                delayIndex={2}
              />
              
              <FeatureCard
                icon={<Users className="w-6 h-6 text-rose-500" />}
                title="Gestion des structures"
                description="Centralisez toutes les informations relatives à vos clients et partenaires."
                delayIndex={3}
              />
              
              <FeatureCard
                icon={<BarChart className="w-6 h-6 text-amber-500" />}
                title="Rapports et statistiques"
                description="Visualisez vos données avec des rapports détaillés et personnalisables."
                delayIndex={4}
              />
              
              <FeatureCard
                icon={<UserCheck className="w-6 h-6 text-emerald-500" />}
                title="Gestion des contrats"
                description="Suivez tous les détails de vos contrats et engagements avec vos clients."
                delayIndex={5}
              />
            </div>
            
            <div className="mt-16 text-center">
              <AnimatedButton to="/Register" variant="primary" className="mx-auto text-lg">
                Explorer l'application
              </AnimatedButton>
            </div>
          </div>
        </section>
        
        <section className="py-24 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Prêt à révolutionner la gestion de vos services ?</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  PauseManager Pro simplifie la planification et le suivi de vos pauses café, déjeuners et réservations de salles.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <AnimatedButton to="/Register" variant="primary" className="text-center justify-center">
                    Commencer maintenant
                  </AnimatedButton>
                  <AnimatedButton to="/login" variant="outline" className="text-center justify-center">
                    Se connecter
                  </AnimatedButton>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <footer className="bg-gray-100 dark:bg-gray-800 py-12 px-4 sm:px-6">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <h3 className="text-xl font-bold mb-2">PauseManager Pro</h3>
                <p className="text-gray-600 dark:text-gray-400">La solution complète pour gérer vos services</p>
              </div>
              
              <nav className="flex gap-8">
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  À propos
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Fonctionnalités
                </a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Contact
                </a>
              </nav>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-gray-500 dark:text-gray-400">
              <p>© {new Date().getFullYear()} PauseManager Pro. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
};

export default Index;
