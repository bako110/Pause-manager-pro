
import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Calendar, Users, ArrowRight } from 'lucide-react';

const LandingHero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current) return;
      
      spotlightRef.current.style.left = `${e.clientX}px`;
      spotlightRef.current.style.top = `${e.clientY}px`;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="relative overflow-hidden flex flex-col items-center justify-center min-h-screen px-4 sm:px-6">
      <div ref={spotlightRef} className="spotlight opacity-0 animate-spotlight"></div>
      
      <div className="absolute inset-0 -z-10 dot-pattern opacity-50"></div>
      
      <div className="container mx-auto max-w-7xl z-10">
        <div className="text-center space-y-8 py-12">
          <div 
            className={`transition-all duration-1000 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 text-white">
              Simplifiez la gestion de vos
              <span className="text-kimi-orange px-2">
                services
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto">
              Une solution intuitive pour la gestion des pauses café, 
              déjeuners et locations de salle pour les professionnels.
            </p>
          </div>
          
          <div 
            className={`transition-all duration-1000 delay-200 transform ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
          >
            <div className="flex flex-wrap justify-center gap-4 py-8">
              <Link 
                to="/Register" 
                className="group relative px-6 py-3 text-lg font-medium rounded-lg bg-kimi-orange text-white hover:bg-kimi-orange-hover transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Démarrer maintenant
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              
              <Link 
                to="/login" 
                className="px-6 py-3 text-lg font-medium rounded-lg border border-white/30 text-white hover:border-kimi-orange/60 hover:text-kimi-orange/90 transition-colors duration-300"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
        
        <div 
          className={`grid grid-cols-1 md:grid-cols-3 gap-8 py-12 transition-all duration-1000 delay-400 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}
        >
          <FeatureCard 
            icon={<Coffee className="w-10 h-10 text-kimi-orange" />}
            title="Gestion des pauses"
            description="Planifiez et suivez toutes vos pauses café et déjeuners avec un calendrier intuitif."
          />
          
          <FeatureCard 
            icon={<Calendar className="w-10 h-10 text-kimi-orange" />}
            title="Réservation de salles"
            description="Gérez la disponibilité et les réservations de vos espaces en quelques clics."
            className="md:translate-y-8 animate-float"
          />
          
          <FeatureCard 
            icon={<Users className="w-10 h-10 text-kimi-orange" />}
            title="Suivi des contrats"
            description="Suivez les contrats et prestations pour chaque client de manière centralisée."
          />
        </div>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, className = "" }) => {
  return (
    <div className={`glass p-8 rounded-xl transition-all duration-500 hover:shadow-xl bg-kimi-green/40 backdrop-blur-md border border-white/10 ${className}`}>
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-white/80">{description}</p>
    </div>
  );
};

export default LandingHero;
