import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const Settings = () => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // 🔹 Récupération automatique des infos du localStorage après login
  useEffect(() => {
    setUserName(localStorage.getItem('userName') || '');
    setEmail(localStorage.getItem('userEmail') || '');
  }, []);

  const handleSave = () => {
    localStorage.setItem('userName', userName);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('theme', theme);

    Swal.fire({
      title: 'Paramètres enregistrés',
      text: 'Vos préférences ont été sauvegardées avec succès.',
      icon: 'success',
      confirmButtonColor: '#D4A373',
      background: '#3B2F2F',
      color: 'white'
    });
  };

  return (
    <div className={`min-h-screen py-10 ${theme === 'dark' ? 'bg-[#1E1E1E] text-white' : 'bg-[#F5F5F5] text-[#3B2F2F]'}`}>
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-[#3B2F2F]">⚙️ Paramètres du compte</h1>

        <div className="space-y-6">
          <div>
            <label className="block font-medium mb-2">Nom d’utilisateur</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#D4A373] outline-none"
              placeholder="Entrez votre nom"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Adresse e-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#D4A373] outline-none"
              placeholder="Entrez votre e-mail"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Thème</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#D4A373] outline-none"
            >
              <option value="light">🌞 Clair</option>
              <option value="dark">🌙 Sombre</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-[#D4A373] text-[#3B2F2F] px-6 py-3 rounded-md font-semibold hover:bg-[#c49160] transition-all"
          >
            💾 Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
