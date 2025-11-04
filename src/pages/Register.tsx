import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../public/environment';

const Register = () => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        lastname: nom,
        firstname: prenom,
        email,
        password,
        phone: telephone
      });

      Swal.fire({
        title: 'Inscription réussie !',
        text: 'Vous pouvez maintenant vous connecter.',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        navigate('/Login');
      });

      setNom('');
      setPrenom('');
      setEmail('');
      setPassword('');
      setTelephone('');

      console.log('Register success:', response.data);
    } catch (err) {
      Swal.fire({
        title: 'Erreur !',
        text: err.response?.data?.message || 'Erreur lors de l\'inscription',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">Inscription</CardTitle>
            <CardDescription className="text-center text-gray-300">
              Créez votre compte pour accéder à la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="nom" className="text-sm font-medium text-white">Nom</label>
                <Input
                  id="nom"
                  type="text"
                  placeholder="Votre nom"
                  className="!text-white !placeholder-gray-300 bg-transparent"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="prenom" className="text-sm font-medium text-white">Prénom</label>
                <Input
                  id="prenom"
                  type="text"
                  placeholder="Votre prénom"
                  className="!text-white !placeholder-gray-300 bg-transparent"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-white">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  className="!text-white !placeholder-gray-300 bg-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="telephone" className="text-sm font-medium text-white">Téléphone</label>
                <Input
                  id="telephone"
                  type="tel"
                  placeholder="Votre numéro de téléphone"
                  className="!text-white !placeholder-gray-300 bg-transparent"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-kimi-orange hover:bg-kimi-orange-hover flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Envoi en cours...
                  </>
                ) : (
                  "S'inscrire"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-center text-gray-300">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-[#D4A373] hover:underline">
                Se connecter
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Register;
