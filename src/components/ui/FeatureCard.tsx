import React, { useRef, useEffect, useState } from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delayIndex?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon, 
  title, 
  description, 
  delayIndex = 0 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setTimeout(() => {
            setIsVisible(true);
            setHasAnimated(true);
          }, delayIndex * 150);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delayIndex, hasAnimated]);

  return (
    <div
      ref={cardRef}
      className={`glass p-8 rounded-xl transition-all duration-700 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      <div className="mb-6 inline-flex p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-white">{description}</p>
    </div>
  );
};

export default FeatureCard;