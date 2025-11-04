
import React, { useState, useEffect } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative overflow-hidden pb-16 pt-8 md:pt-12">
      <div className="absolute inset-0 -z-10 dot-pattern opacity-50"></div>
      <div
        className={`transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-2">{title}</h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 text-center max-w-3xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default Header;
