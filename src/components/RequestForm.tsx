'use client';

import { useState } from 'react';

interface FormData {
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  specialiteActuelle: string;
  specialiteSouhaitee: string;
  raison: string;
}

export default function RequestForm() {
  const [formData, setFormData] = useState<FormData>({
    matricule: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    specialiteActuelle: '',
    specialiteSouhaitee: '',
    raison: '',
  });

  const [isStudentLoaded, setIsStudentLoaded] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLookup = async () => {
    if (!formData.matricule.trim()) {
      alert('Veuillez entrer un matricule.');
      return;
    }

    try {
      const response = await fetch(`/api/student?matricule=${encodeURIComponent(formData.matricule)}`);
      
      if (response.ok) {
        const studentData = await response.json();
        setFormData(prev => ({ ...prev, ...studentData }));
        setIsStudentLoaded(true);
      } else if (response.status === 404) {
        alert('Étudiant non trouvé avec ce matricule.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Erreur lors de la recherche de l\'étudiant.';
        alert(`Erreur: ${errorMessage}`);
        console.error('Student lookup error:', errorData);
      }
    } catch (error) {
      console.error('Error looking up student:', error);
      alert('Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/submit-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Demande soumise avec succès!');
        setFormData({
          matricule: '',
          nom: '',
          prenom: '',
          email: '',
          telephone: '',
          specialiteActuelle: '',
          specialiteSouhaitee: '',
          raison: '',
        });
        setIsStudentLoaded(false);
      } else {
        // Show specific error message from server
        const errorMessage = data.error || 'Erreur lors de la soumission.';
        alert(`Erreur: ${errorMessage}`);
        console.error('Submission error:', data);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <img
            src="/logo-usthb.png"
            alt="Université des Sciences et de Technologie Houari Boumediene"
            className="h-20 w-auto object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
          Demande de Changement de Spécialité
        </h1>
        <p className="text-gray-400 text-sm">
          Remplissez ce formulaire pour demander un changement de spécialité
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="matricule" className="block text-sm font-semibold text-gray-300 mb-2">
            Matricule
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              id="matricule"
              name="matricule"
              value={formData.matricule}
              onChange={handleChange}
              readOnly={isStudentLoaded}
              required
              className={`flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${isStudentLoaded ? 'bg-gray-800/50 cursor-not-allowed' : 'hover:bg-gray-700/70'}`}
              placeholder="Entrez votre matricule"
            />
            <button
              type="button"
              onClick={handleLookup}
              disabled={isStudentLoaded}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              Rechercher
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="nom" className="block text-sm font-semibold text-gray-300 mb-2">Nom</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              readOnly
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-gray-300 cursor-not-allowed focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="prenom" className="block text-sm font-semibold text-gray-300 mb-2">Prénom</label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              required
              readOnly
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-gray-300 cursor-not-allowed focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-700/70"
          />
        </div>
        <div>
          <label htmlFor="telephone" className="block text-sm font-semibold text-gray-300 mb-2">Téléphone</label>
          <input
            type="tel"
            id="telephone"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-700/70"
          />
        </div>
        <div>
          <label htmlFor="specialiteActuelle" className="block text-sm font-semibold text-gray-300 mb-2">Spécialité Actuelle</label>
          <input
            type="text"
            id="specialiteActuelle"
            name="specialiteActuelle"
            value={formData.specialiteActuelle}
            onChange={handleChange}
            required
            readOnly
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-gray-300 cursor-not-allowed focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="specialiteSouhaitee" className="block text-sm font-semibold text-gray-300 mb-2">Spécialité Souhaitée</label>
          <select
            id="specialiteSouhaitee"
            name="specialiteSouhaitee"
            value={formData.specialiteSouhaitee}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-700/70"
          >
            <option value="" className="bg-gray-800">Sélectionnez une spécialité</option>
            {formData.specialiteActuelle !== "GL" && (
              <option value="GL" className="bg-gray-800">GL - Génie Logiciel (Software Engineering)</option>
            )}
            {formData.specialiteActuelle !== "SECU" && (
              <option value="SECU" className="bg-gray-800">SECU - Sécurité (Security)</option>
            )}
            {formData.specialiteActuelle !== "IA" && (
              <option value="IA" className="bg-gray-800">IA - Intelligence Artificielle (AI)</option>
            )}
          </select>
        </div>
        <div>
          <label htmlFor="raison" className="block text-sm font-semibold text-gray-300 mb-2">Raison du Changement</label>
          <textarea
            id="raison"
            name="raison"
            value={formData.raison}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-700/70 resize-none"
            placeholder="Expliquez les raisons de votre demande de changement..."
          />
        </div>
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold text-lg rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Soumettre la Demande
          </button>
        </div>
      </form>
    </div>
  );
}