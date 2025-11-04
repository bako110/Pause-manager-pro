
import React, { ReactNode } from 'react';

interface GlassMorphismProps {
  children: ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
}

const GlassMorphism: React.FC<GlassMorphismProps> = ({
  children,
  className = '',
  intensity = 'medium'
}) => {
  const intensityStyles = {
    light: 'bg-white/5 backdrop-blur-sm border-white/10 shadow-sm',
    medium: 'bg-white/10 backdrop-blur-md border-white/20 shadow-md',
    heavy: 'bg-white/20 backdrop-blur-xl border-white/30 shadow-lg'
  };

  return (
    <div
      className={`relative overflow-hidden border rounded-xl transition-all duration-300 ${intensityStyles[intensity]} ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassMorphism;
