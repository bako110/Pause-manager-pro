import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import axios from 'axios';
import Swal from 'sweetalert2';
import { Loader2 } from "lucide-react"; // ✅ Spinner pour le chargement
import { API_BASE_URL } from '../../public/environment';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // ✅ Suivi du chargement
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // ✅ Active le mode chargement

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);

      // ✅ Succès
      Swal.fire({
        title: 'Connexion réussie !',
        text: 'Bienvenue sur la plateforme.',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        navigate('/dashboard');
      });

    } catch (err) {
      Swal.fire({
        title: 'Erreur !',
        text: err.response?.data?.message || 'Erreur lors de la connexion',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoading(false); // ✅ Désactive le mode chargement
    }
  };

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md bg-[#3B2F2F] border border-[#D4A373]">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">Connexion</CardTitle>
            <CardDescription className="text-center text-gray-300">
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-white">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  className="!text-white !placeholder-gray-300 bg-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-white">Mot de passe</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="!text-white !placeholder-gray-300 bg-transparent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#D4A373] hover:bg-[#c49160] text-[#3B2F2F] font-semibold transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Envoi en cours...</span>
                  </div>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <div className="text-center text-gray-300">
              Pas de compte ?{' '}
              <Link to="/register" className="text-[#D4A373] hover:underline">
                S'inscrire
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Login;
