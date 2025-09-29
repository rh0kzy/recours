# 🎓 USTHB Recours - Système de Demande de Changement de Spécialité

<div align="center">

![USTHB Logo](public/logo-usthb.png)

**Université des Sciences et de Technologie Houari Boumediene**  
*Faculté d'Informatique - Système de Gestion des Demandes de Changement de Spécialité*

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4.svg)](https://tailwindcss.com/)
[![Netlify](https://img.shields.io/badge/Deployment-Netlify-00C7B7.svg)](https://netlify.com/)

</div>

## 📖 Aperçu

Système web moderne et responsive permettant aux étudiants de l'USTHB de soumettre des demandes de changement de spécialité en ligne, avec un panel d'administration complet pour la gestion et le suivi des demandes.

**🗓️ Statut du Projet :** Actif et en production depuis septembre 2025  
**🔧 Version Actuelle :** 0.1.0  
**📊 État :** Toutes les fonctionnalités implémentées et testées

### 🌟 Fonctionnalités Principales

#### 👨‍🎓 **Interface Étudiante**
- ✅ **Formulaire intelligent** - Recherche automatique des informations étudiantes par matricule
- ✅ **Validation temps réel** - Vérification instantanée des données
- ✅ **Confirmation par email** - Notification automatique de soumission
- ✅ **Interface responsive** - Compatible mobile, tablette et desktop
- ✅ **Notifications intégrées** - Système d'alertes élégant sans popups

#### 🛡️ **Panel d'Administration**
- ✅ **Gestion des demandes** - Vue d'ensemble avec filtres et tri
- ✅ **Approbation/Rejet** - Traitement en un clic avec commentaires
- ✅ **Transfert automatique** - Mise à jour automatique de la spécialité en base
- ✅ **Notifications emails** - Alertes automatiques aux étudiants
- ✅ **Suppression en masse** - Sélection multiple avec confirmation
- ✅ **Interface responsive** - Optimisée pour tous les appareils

#### 🔄 **Processus Automatisé**
- ✅ **Transfert étudiant** - Changement automatique de spécialité lors de l'approbation
- ✅ **Emails enrichis** - Templates HTML responsive avec confirmation de transfert
- ✅ **Traçabilité complète** - Historique des actions et timestamps
- ✅ **Gestion d'erreurs** - Robustesse et récupération automatique

## 🛠️ Stack Technique

### **Frontend**
- **Next.js 15.5.4** - Framework React full-stack avec App Router
- **React 19.1.0** - Bibliothèque UI avec hooks et composants modernes
- **TypeScript 5** - Typage statique pour la robustesse du code
- **Tailwind CSS 4** - Framework CSS utility-first pour design moderne
- **Responsive Design** - Mobile-first avec breakpoints optimisés

### **Backend**
- **Netlify Functions** - API serverless avec Node.js
- **PostgreSQL** - Base de données relationnelle avec Supabase
- **Nodemailer** - Service d'envoi d'emails avec Gmail SMTP
- **Supabase Client** - ORM et gestion base de données
- **pg** - Driver PostgreSQL natif pour les functions

### **Infrastructure**
- **Netlify** - Déploiement automatique avec CI/CD
- **Supabase** - BaaS avec PostgreSQL managé
- **GitHub** - Contrôle de version et collaboration
- **SSL/HTTPS** - Sécurisé par défaut

### **Dépendances Principales**
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.58.0",
    "dotenv": "^17.2.2", 
    "next": "15.5.4",
    "nodemailer": "^7.0.6",
    "pg": "^8.16.3",
    "react": "19.1.0",
    "react-dom": "19.1.0"
  },
  "devDependencies": {
    "@netlify/plugin-nextjs": "^5.7.2",
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4",
    "typescript": "^5",
    "eslint": "^9",
    "eslint-config-next": "15.5.4"
  }
}
```

## 🚀 Installation et Développement

### **Prérequis**
- Node.js 18+ 
- npm ou yarn
- Compte Supabase (base de données)
- Compte Gmail (envoi d'emails)

### **1. Cloner le Projet**
```bash
git clone https://github.com/rh0kzy/recours.git
cd recours
```

### **2. Installer les Dépendances**
```bash
npm install
```

### **3. Configuration Environnement**
Créer `.env.local` à la racine :
```env
# Base de données Supabase
DATABASE_URL=postgresql://user:password@host:port/database

# Configuration Email Gmail
EMAIL_USER=votre-email@gmail.com
EMAIL_APP_PASSWORD=mot-de-passe-application-gmail

# Variables optionnelles
NODE_ENV=development
```

### **4. Configuration Base de Données**
Exécuter les scripts SQL dans Supabase :

```sql
-- Table des étudiants
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  matricule TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL,
  specialite TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table des demandes
CREATE TABLE requests (
  id SERIAL PRIMARY KEY,
  matricule TEXT NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  specialite_actuelle TEXT NOT NULL,
  specialite_souhaitee TEXT NOT NULL,
  raison TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  admin_comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by TEXT,
  FOREIGN KEY (matricule) REFERENCES students(matricule)
);
```

### **5. Lancer le Développement**
```bash
npm run dev
```

Accéder à :
- **Site principal** : http://localhost:3000
- **Panel admin** : http://localhost:3000/admin

## 🌐 Déploiement Production

### **Netlify (Recommandé)**

1. **Connexion GitHub**
   ```bash
   git push origin master
   ```

2. **Configuration Netlify**
   - Build command: `npm run build`
   - Functions directory: `netlify/functions`
   - Publish directory: `.next`
   - Node version: `18`
   - Plugin: `@netlify/plugin-nextjs`

3. **Variables d'Environnement**
   ```env
   DATABASE_URL=votre_url_supabase
   EMAIL_USER=votre_email@gmail.com
   EMAIL_APP_PASSWORD=votre_mot_de_passe_app
   NODE_VERSION=18
   ```

4. **Déploiement Automatique**
   - Push → Build automatique → Déploiement

### **Configuration Gmail**
1. Activer l'authentification 2FA sur Gmail
2. Générer un mot de passe d'application : [Guide Google](https://support.google.com/accounts/answer/185833)
3. Utiliser ce mot de passe dans `EMAIL_APP_PASSWORD`

## 📂 Structure du Projet

```
recours/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📄 page.tsx              # Page d'accueil avec formulaire
│   │   ├── � layout.tsx            # Layout principal de l'app
│   │   ├── 📄 not-found.tsx         # Page 404 personnalisée
│   │   ├── 📄 globals.css           # Styles globaux Tailwind
│   │   ├── �📁 admin/
│   │   │   └── 📄 page.tsx          # Panel d'administration
│   │   └── 📁 api/
│   │       ├── 📁 admin/requests/   # APIs admin
│   │       │   ├── 📄 route.ts      # GET/POST requests admin
│   │       │   └── 📁 [id]/
│   │       │       └── 📄 route.ts  # PATCH/DELETE request spécifique
│   │       ├── 📁 student/          # API recherche étudiant
│   │       │   └── � route.ts      # GET étudiant par matricule
│   │       ├── �📁 students/         # API liste étudiants
│   │       │   └── 📄 route.ts      # GET tous les étudiants
│   │       ├── 📁 submit-request/   # API soumission
│   │       │   └── 📄 route.ts      # POST nouvelle demande
│   │       ├── 📁 test/             # API test
│   │       │   └── 📄 route.ts      # GET test connectivité
│   │       ├── 📁 test-db/          # API test DB
│   │       │   └── 📄 route.ts      # GET test base de données
│   │       ├── 📁 test-student-update/ # API test mise à jour
│   │       │   └── 📄 route.ts      # POST test transfert étudiant
│   │       └── 📁 update-requests-table/ # API mise à jour table
│   │           └── 📄 route.ts      # POST mise à jour structure DB
│   ├── 📁 components/
│   │   └── 📄 RequestForm.tsx       # Formulaire principal responsive
│   └── 📁 lib/
│       ├── 📄 supabase.ts          # Configuration Supabase
│       └── 📄 email.ts             # Utilitaires email
├── 📁 netlify/
│   └── 📁 functions/               # Functions serverless
│       ├── 📄 admin-requests.js    # GET/POST demandes admin
│       ├── 📄 admin-requests-id.js # PATCH/DELETE demande spécifique
│       ├── 📄 submit-request.js    # POST soumission avec emails
│       ├── 📄 test.js              # Test de connectivité
│       ├── 📄 test-db-connection.js # Test connexion DB
│       ├── 📄 test-email.js        # Test service email
│       ├── 📄 health.js            # Health check
│       ├── 📄 setup-database.js    # Script initialisation DB
│       └── 📄 package.json         # Dépendances functions
├── 📁 public/                      # Assets statiques
│   ├── 📄 logo-usthb.png          # Logo principal USTHB
│   ├── 📄 LogoUSTHB.png           # Logo alternatif
│   ├── 📄 favicon.ico             # Icône du site
│   ├── 📄 _redirects              # Règles redirect Netlify
│   └── 📄 *.svg                   # Icônes diverses
├── 📄 netlify.toml                # Config déploiement Netlify
├── 📄 next.config.ts              # Configuration Next.js
├── 📄 tailwind.config.ts          # Configuration Tailwind CSS
├── 📄 tsconfig.json               # Configuration TypeScript
├── 📄 eslint.config.mjs           # Configuration ESLint
├── 📄 postcss.config.mjs          # Configuration PostCSS
├── 📄 package.json                # Dépendances et scripts
├── 📄 DEPLOYMENT.md               # Guide de déploiement
├── 📄 RESPONSIVE_TEST.md          # Tests responsivité
├── 📄 DEBUG_500_ERROR.md          # Guide debug erreurs
└── 📄 README.md                   # Documentation complète
```

## 🔌 API Endpoints

### **Étudiants**
- `GET /api/student?matricule={matricule}` - Recherche étudiant par matricule
- `GET /api/students` - Liste de tous les étudiants
- `POST /api/submit-request` - Soumission nouvelle demande
- `GET /api/test` - Test de connectivité API
- `GET /api/test-db` - Test connexion base de données
- `POST /api/test-student-update` - Test transfert étudiant
- `POST /api/update-requests-table` - Mise à jour structure table

### **Administration**
- `GET /api/admin/requests` - Liste des demandes avec filtres
- `POST /api/admin/requests` - Création demande (admin)
- `PATCH /api/admin/requests/[id]` - Mise à jour statut/décision
- `DELETE /api/admin/requests/[id]` - Suppression demande

### **Netlify Functions** (Production)
- `/.netlify/functions/admin-requests` - Gestion demandes admin
- `/.netlify/functions/admin-requests-id` - Actions demande spécifique
- `/.netlify/functions/submit-request` - Soumission avec emails
- `/.netlify/functions/test` - Test connectivité
- `/.netlify/functions/test-db-connection` - Test base de données
- `/.netlify/functions/test-email` - Test service email
- `/.netlify/functions/health` - Health check système
- `/.netlify/functions/setup-database` - Initialisation DB

## 📱 Responsive Design

### **Breakpoints Tailwind**
- **Mobile** : < 640px
- **SM** : ≥ 640px (tablettes)
- **MD** : ≥ 768px (tablettes larges)
- **LG** : ≥ 1024px (laptops)
- **XL** : ≥ 1280px (desktops)

### **Compatibilité Testée**
- ✅ iOS Safari (iPhone/iPad)
- ✅ Android Chrome
- ✅ Desktop Chrome/Firefox/Safari/Edge
- ✅ Tablettes toutes orientations

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev          # Serveur de développement avec Turbopack
npm run build        # Build production avec Turbopack
npm run start        # Serveur production
npm run lint         # Vérification ESLint
npm run netlify      # Serveur Netlify dev local

# Note: Turbopack activé pour des builds plus rapides
```

## 🔒 Sécurité

- ✅ **HTTPS Obligatoire** - SSL/TLS par défaut
- ✅ **Validation Côté Serveur** - Tous les inputs validés
- ✅ **Sanitisation des Données** - Protection contre XSS
- ✅ **Variables d'Environnement** - Secrets sécurisés
- ✅ **CORS Configuré** - Accès contrôlé aux APIs

## 🧪 Tests et Validation

### **Tests Manuels Effectués**
- ✅ Soumission de demandes avec validation email
- ✅ Notifications emails responsive (étudiant + admin)
- ✅ Interface admin complète avec toutes les actions
- ✅ Responsivité multi-appareils (mobile, tablette, desktop)
- ✅ Transfert automatique des étudiants lors d'approbation
- ✅ Système de notifications intégré (remplacement des alertes)
- ✅ Gestion d'erreurs et récupération automatique
- ✅ Performance avec Turbopack en développement et production

### **Documentation Projet**
- 📄 `RESPONSIVE_TEST.md` - Rapport complet de tests responsivité
- 📄 `DEPLOYMENT.md` - Guide détaillé de déploiement
- 📄 `DEBUG_500_ERROR.md` - Guide de résolution d'erreurs
- 📄 `README.md` - Documentation complète (ce fichier)

### **Validation Responsivité**
Voir [RESPONSIVE_TEST.md](RESPONSIVE_TEST.md) pour le rapport complet.

## 🚀 Fonctionnalités Avancées

### **Notifications Intelligentes**
- Système de notifications intégré (remplace les alertes navigateur)
- Auto-suppression après 5 secondes
- Types : Succès, Erreur, Avertissement, Info
- Position adaptative mobile/desktop

### **Transfert Automatique**
- Mise à jour automatique de la spécialité en base lors de l'approbation
- Emails enrichis avec confirmation de transfert
- Gestion d'erreurs robuste avec logs

### **Interface Admin Avancée**
- Sélection multiple avec actions en masse
- Filtrage et tri intelligent
- Mode sélection avec compteurs
- Historique complet des actions

## 📞 Support et Contact

### **Développeur**
- **GitHub** : [@rh0kzy](https://github.com/rh0kzy)
- **Repository** : [recours](https://github.com/rh0kzy/recours)

### **USTHB - Faculté d'Informatique**
- **Site Web** : [usthb.dz](https://usthb.dz)
- **Email** : contact@usthb.dz

## 📄 Licence

Ce projet est propriétaire et confidentiel.  
© 2025 USTHB - Faculté d'Informatique. Tous droits réservés.

---

<div align="center">

**Développé avec ❤️ pour l'USTHB**  
*Système moderne de gestion des demandes académiques*

</div>