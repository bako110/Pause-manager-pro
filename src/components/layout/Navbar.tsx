import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Coffee } from 'lucide-react';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#3B2F2F]/90 backdrop-blur-md shadow-md'
          : 'bg-[#4E3B31]'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <Link to="/" className="flex items-center space-x-2">
          <Coffee className="h-8 w-8 text-[#D4A373]" aria-hidden="true" />
          <span className="text-xl font-bold text-white">PauseManager Pro</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLinks isActive={isActive} />
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden focus:outline-none text-white"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden h-screen bg-[#4E3B31]">
          <nav className="container mx-auto px-4 py-6 flex flex-col space-y-4">
            <NavLinks isActive={isActive} onClick={() => setIsMenuOpen(false)} />
          </nav>
        </div>
      )}
    </header>
  );
};

interface NavLinksProps {
  isActive: (path: string) => boolean;
  onClick?: () => void;
}

const NavLinks = ({ isActive, onClick }: NavLinksProps) => {
  const links = [
    { label: 'Accueil', path: '/' },
    // { label: 'Tableau de bord', path: '/dashboard' },
    // { label: 'Services', path: '/services' },
    // { label: 'Clients', path: '/clients' },
  ];

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={`relative px-3 py-2 transition-colors duration-200 ${
            isActive(link.path)
              ? 'text-[#D4A373] font-medium bg-[#2F4F2F]/70 rounded-md' // vert sombre
              : 'text-white hover:text-[#E1B07E]'
          }`}
          onClick={onClick}
        >
          {link.label}
          {isActive(link.path) && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D4A373] transform animate-scale-in" />
          )}
        </Link>
      ))}

      {/* Lien d'inscription */}
      <Link
        to="/register"
        className={`relative px-4 py-2 rounded-md transition-colors duration-200 ${
          isActive('/register')
            ? 'text-[#D4A373] font-medium bg-[#2F4F2F]/70'
            : 'text-white hover:bg-[#D4A373]'
        }`}
        onClick={onClick}
      >
        Inscription
        {isActive('/register') && (
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D4A373] transform animate-scale-in" />
        )}
      </Link>

      {/* Lien de connexion */}
      <Link
        to="/login"
        className={`relative px-4 py-2 rounded-md transition-colors duration-200 ${
          isActive('/login')
            ? 'text-[#D4A373] font-medium bg-[#2F4F2F]/70'
            : 'text-white hover:bg-[#D4A373]'
        }`}
        onClick={onClick}
      >
        Connexion
        {isActive('/login') && (
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D4A373] transform animate-scale-in" />
        )}
      </Link>
    </>
  );
};

export default Navbar;