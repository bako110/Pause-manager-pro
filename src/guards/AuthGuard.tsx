// src/guards/AuthGuard.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  
  // Si pas de token, rediriger vers login avec retour
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};