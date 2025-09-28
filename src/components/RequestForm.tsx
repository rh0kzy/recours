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
        alert('Erreur lors de la recherche de l\'étudiant.');
      }
    } catch (error) {
      console.error('Error looking up student:', error);
      alert('Erreur lors de la recherche de l\'étudiant.');
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
        alert('Erreur lors de la soumission.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Erreur lors de la soumission.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Demande de Changement de Spécialité</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="matricule" className="block text-sm font-medium text-gray-700">Matricule</label>
          <div className="flex gap-2">
            <input
              type="text"
              id="matricule"
              name="matricule"
              value={formData.matricule}
              onChange={handleChange}
              readOnly={isStudentLoaded}
              required
              className={`mt-1 block flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${isStudentLoaded ? 'bg-gray-100' : ''}`}
              placeholder="Entrez votre matricule"
            />
            <button
              type="button"
              onClick={handleLookup}
              disabled={isStudentLoaded}
              className="mt-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
            >
              Rechercher
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">Prénom</label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">Téléphone</label>
          <input
            type="tel"
            id="telephone"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="specialiteActuelle" className="block text-sm font-medium text-gray-700">Spécialité Actuelle</label>
          <input
            type="text"
            id="specialiteActuelle"
            name="specialiteActuelle"
            value={formData.specialiteActuelle}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="specialiteSouhaitee" className="block text-sm font-medium text-gray-700">Spécialité Souhaitée</label>
          <select
            id="specialiteSouhaitee"
            name="specialiteSouhaitee"
            value={formData.specialiteSouhaitee}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Sélectionnez une spécialité</option>
            <option value="GL">GL - Génie Logiciel (Software Engineering)</option>
            <option value="SECU">SECU - Sécurité (Security)</option>
            <option value="IA">IA - Intelligence Artificielle (AI)</option>
          </select>
        </div>
        <div>
          <label htmlFor="raison" className="block text-sm font-medium text-gray-700">Raison du Changement</label>
          <textarea
            id="raison"
            name="raison"
            value={formData.raison}
            onChange={handleChange}
            required
            rows={4}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Soumettre la Demande
          </button>
        </div>
      </form>
    </div>
  );
}