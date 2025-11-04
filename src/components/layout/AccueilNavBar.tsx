import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Settings, LogOut, Users, Coffee, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';

const AccueilNavbar = () => {
  const location = useLocation();
  const userName = localStorage.getItem('userName') || 'Utilisateur';

  const handleLogout = () => {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous serez déconnecté de votre session",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D4A373',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, se déconnecter',
      cancelButtonText: 'Annuler',
      background: '#3B2F2F',
      color: 'white'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        Swal.fire({
          title: 'Déconnecté !',
          text: 'Vous avez été déconnecté avec succès',
          icon: 'success',
          confirmButtonColor: '#D4A373',
          background: '#3B2F2F',
          color: 'white'
        }).then(() => {
          window.location.href = '/';
        });
      }
    });
  };

  const linkClasses = (path: string) =>
    `px-3 py-2 rounded-md flex items-center space-x-1 transition-colors ${
      location.pathname === path
        ? 'bg-[#D4A373] text-[#3B2F2F] font-semibold'
        : 'text-white hover:bg-[#D4A373] hover:text-[#3B2F2F]'
    }`;

  return (
    <header className="bg-[#3B2F2F] py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link to="/dashboard" className="text-xl font-bold text-[#D4A373]">
          PauseManager Pro
        </Link>

        <nav className="flex items-center space-x-4">
          <Link to="/dashboard" className={linkClasses('/dashboard')}>
            <Home className="w-5 h-5" /> <span>Accueil</span>
          </Link>

          {/* Lien direct vers Événements */}
          <Link to="/events" className={linkClasses('/events')}>
            <Calendar className="w-5 h-5" /> <span>Événements</span>
          </Link>

          {/* Menu Clients */}
          <Link to="/clients" className={linkClasses('/clients')}>
            <Users className="w-5 h-5" /> <span>Clients</span>
          </Link>

          {/* Menu Services */}
          <Link to="/services" className={linkClasses('/services')}>
            <Coffee className="w-5 h-5" /> <span>Services</span>
          </Link>

          <Link to="/settings" className={linkClasses('/settings')}>
            <Settings className="w-5 h-5" /> <span>Paramètres</span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-md text-white hover:bg-red-500 hover:text-white flex items-center space-x-1"
          >
            <LogOut className="w-5 h-5" /> <span>Déconnexion</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default AccueilNavbar;