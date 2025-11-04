
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface AnimatedButtonProps {
  to: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  icon?: React.ReactNode;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  to,
  children,
  variant = 'primary',
  className = '',
  icon = <ArrowRight className="w-5 h-5" />
}) => {
  const baseClasses = 'group relative inline-flex items-center justify-center px-6 py-3 font-medium rounded-lg overflow-hidden transition-all duration-300';
  
  const variantClasses = {
    primary: 'bg-kimi-orange text-white hover:bg-kimi-orange-hover',
    secondary: 'bg-kimi-green text-white hover:bg-kimi-green-light',
    outline: 'border border-white/30 text-white hover:border-kimi-orange/60 hover:text-kimi-orange/90',
  };
  
  return (
    <Link
      to={to}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
        <span className="transform group-hover:translate-x-1 transition-transform duration-300">
          {icon}
        </span>
      </span>
    </Link>
  );
};

export default AnimatedButton;
