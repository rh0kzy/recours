# 🎓 USTHB Recours

<div align="center">

![USTHB Logo](public/logo-usthb.png)

**Système de Gestion des Demandes de Changement de Spécialité**  
*Université des Sciences et de Technologie Houari Boumediene - Faculté d'Informatique*

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql)](https://supabase.com/)
[![Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7?logo=netlify)](https://netlify.com/)

[🚀 Demo Live](#) • [📖 Documentation](#documentation) • [🐛 Report Bug](../../issues) • [✨ Request Feature](../../issues)

</div>

---

## � Table des Matières

- [À Propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Architecture](#-architecture)
- [Déploiement](#-déploiement)
- [Captures d'Écran](#-captures-décran)
- [Contribution](#-contribution)
- [License](#-license)

---

## 🎯 À Propos

**USTHB Recours** est une application web moderne développée pour digitaliser et automatiser le processus de demande de changement de spécialité à la Faculté d'Informatique de l'USTHB. Le système offre une interface intuitive pour les étudiants et un panneau d'administration complet pour le traitement efficace des demandes.

### 🎯 Objectifs

- **Simplifier** le processus de demande de changement de spécialité
- **Automatiser** le traitement et le transfert des étudiants
- **Centraliser** la gestion administrative des demandes
- **Améliorer** la communication avec les étudiants via notifications automatiques
- **Garantir** la traçabilité et la sécurité des données

### ✨ Points Forts

- 🚀 **Performance** - Application rapide avec Next.js 15 et Turbopack
- 📱 **Responsive** - Interface adaptée mobile, tablette et desktop
- 🎨 **UI/UX Moderne** - Design élégant avec Tailwind CSS 4
- 🔒 **Sécurisé** - Authentification JWT, hashage bcrypt, HTTPS
- ⚡ **Temps Réel** - Validation instantanée et mises à jour automatiques
- 📧 **Notifications** - Emails HTML automatiques avec templates professionnels
- 🔄 **Automatisation** - Transfert automatique et mise à jour base de données

---

## ✨ Fonctionnalités

### 👨‍🎓 Portail Étudiant

#### 📝 Soumission de Demande
- **Recherche automatique** par matricule depuis la base de données
- **Auto-complétion** des informations (nom, prénom, email, téléphone, spécialité actuelle)
- **Validation en temps réel** avec messages d'erreur contextuels
- **Upload sécurisé** de justificatifs (si nécessaire)
- **Confirmation visuelle** avec animation de succès

#### 📧 Notifications Email
- **Email de confirmation** immédiat après soumission
- **Email de décision** (approbation/rejet) avec détails
- **Email de transfert** avec nouvelle spécialité confirmée
- **Templates HTML** responsive et professionnels

### 🛡️ Panneau d'Administration

#### 🔐 Système d'Authentification
- **Login sécurisé** avec JWT et sessions
- **4 rôles d'accès** : Viewer, Reviewer, Department Admin, Super Admin
- **14 permissions granulaires** pour contrôle d'accès fin
- **Gestion des utilisateurs** (création, modification, désactivation)
- **Audit logs** pour traçabilité complète

#### 📊 Gestion des Demandes
- **Dashboard centralisé** avec statistiques en temps réel
- **Filtrage avancé** par statut, spécialité, date
- **Vue détaillée** de chaque demande avec historique
- **Actions en masse** (sélection multiple, suppression groupée)
- **Traitement rapide** (approuver/rejeter en un clic)

#### 🔄 Automatisation
- **Transfert automatique** de l'étudiant vers la nouvelle spécialité
- **Mise à jour base de données** instantanée
- **Envoi d'emails** automatique selon la décision
- **Gestion d'erreurs** robuste avec rollback

#### 👥 Gestion Utilisateurs (Super Admin)
- **CRUD complet** des comptes administrateurs
- **Attribution des rôles** et permissions
- **Activation/désactivation** des comptes
- **Sécurité renforcée** avec verrouillage après échecs de connexion
- **Génération de mots de passe** sécurisés

---

## 🛠️ Technologies

### **Frontend**
- **[Next.js 15.5.4](https://nextjs.org/)** - Framework React avec App Router et Turbopack
- **[React 19.1.0](https://react.dev/)** - Bibliothèque UI avec Server Components
- **[TypeScript 5](https://www.typescriptlang.org/)** - Typage statique pour code robuste
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Framework CSS utility-first moderne

### **Backend & Database**
- **[PostgreSQL](https://www.postgresql.org/)** - Base de données relationnelle
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service avec PostgreSQL managé
- **[Netlify Functions](https://www.netlify.com/products/functions/)** - Serverless functions pour API
- **[Nodemailer](https://nodemailer.com/)** - Service d'envoi d'emails SMTP

### **Authentification & Sécurité**
- **[JWT (jose)](https://github.com/panva/jose)** - JSON Web Tokens pour sessions
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Hashage sécurisé des mots de passe
- **Row Level Security (RLS)** - Sécurité au niveau base de données
- **HTTPS** - Communication chiffrée obligatoire

### **Outils de Développement**
- **[ESLint 9](https://eslint.org/)** - Linting et qualité du code
- **[PostCSS](https://postcss.org/)** - Transformation CSS
- **Git & GitHub** - Contrôle de version
- **VS Code** - IDE recommandé

---

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** 20.x ou supérieur ([Télécharger](https://nodejs.org/))
- **npm** 10.x ou supérieur (inclus avec Node.js)
- **Git** pour le contrôle de version ([Télécharger](https://git-scm.com/))
- **PostgreSQL** ou compte Supabase ([Créer un compte](https://supabase.com/))
- **Compte Gmail** avec App Password pour l'envoi d'emails

### Comptes Requis

1. **[Supabase](https://supabase.com/)** - Base de données PostgreSQL managée
2. **[Netlify](https://www.netlify.com/)** - Hébergement et déploiement (optionnel)
3. **[Gmail](https://mail.google.com/)** - Pour l'envoi d'emails

---

## 🚀 Installation

### 1. Cloner le Repository

```bash
git clone https://github.com/rh0kzy/recours.git
cd recours
```

### 2. Installer les Dépendances

```bash
npm install
```

### 3. Configuration de la Base de Données

#### a) Créer un Projet Supabase

1. Allez sur [supabase.com](https://supabase.com/)
2. Créez un nouveau projet
3. Notez l'URL et les clés API

#### b) Exécuter les Migrations

Connectez-vous à votre base Supabase et exécutez les scripts SQL dans l'ordre :

```bash
# 1. Créer les tables et permissions
database/admin_roles_migration.sql

# 2. Créer le compte admin par défaut
database/create_default_admin.sql
```

### 4. Configuration des Variables d'Environnement

Créez un fichier `.env.local` à la racine :

```bash
cp .env.example .env.local
```

Éditez `.env.local` avec vos valeurs :

```env
# Database - PostgreSQL Connection
DATABASE_URL=postgresql://user:password@host:5432/database

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password

# JWT Secret (générer avec: openssl rand -base64 32)
JWT_SECRET=your-secure-random-jwt-secret-here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

#### 📧 Configuration Gmail

1. Activez l'authentification à deux facteurs sur votre compte Gmail
2. Générez un mot de passe d'application : [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Utilisez ce mot de passe dans `EMAIL_APP_PASSWORD`

### 5. Lancer l'Application

#### Mode Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

#### Mode Production (Build)

```bash
npm run build
npm start
```

---

## ⚙️ Configuration

### Structure des Fichiers de Configuration

```
recours/
├── .env.local              # Variables d'environnement (ne pas commit)
├── .env.example            # Template des variables d'environnement
├── next.config.ts          # Configuration Next.js
├── tailwind.config.ts      # Configuration Tailwind CSS
├── tsconfig.json           # Configuration TypeScript
├── netlify.toml            # Configuration Netlify
└── package.json            # Dépendances et scripts
```

### Scripts NPM Disponibles

```json
{
  "dev": "next dev --turbopack",        // Développement avec Turbopack
  "build": "next build --turbopack",    // Build production
  "start": "next start",                 // Démarrer le serveur production
  "lint": "eslint",                      // Vérifier le code
  "netlify": "netlify dev"               // Développement local Netlify
}
```

---

## 💻 Utilisation

### Pour les Étudiants

1. **Accéder au formulaire** : Visitez la page d'accueil
2. **Entrer le matricule** : Le système charge automatiquement vos informations
3. **Remplir le formulaire** : 
   - Spécialité souhaitée (liste déroulante)
   - Raison du changement (texte libre)
4. **Soumettre** : Cliquez sur "Soumettre la demande"
5. **Confirmation** : Recevez un email de confirmation immédiat

### Pour les Administrateurs

#### Première Connexion

**Compte par défaut créé lors de la migration :**
- Email : `admin@usthb.dz`
- Mot de passe : `Admin123!`
- Rôle : Super Admin

⚠️ **Important** : Changez ce mot de passe dès la première connexion !

#### Accès au Panneau Admin

1. **Se connecter** : `/admin/login`
2. **Dashboard** : Vue d'ensemble des demandes
3. **Traiter une demande** :
   - Cliquer sur une demande pour voir les détails
   - Ajouter un commentaire (optionnel)
   - Cliquer sur "Approuver" ou "Refuser"
   - Le système envoie automatiquement un email à l'étudiant

#### Gestion des Utilisateurs (Super Admin)

1. Accéder à **Utilisateurs** dans la navigation
2. Créer un nouvel utilisateur avec :
   - Nom complet
   - Email
   - Mot de passe sécurisé
   - Rôle approprié
   - Département (si applicable)

### Rôles et Permissions

| Rôle | Permissions |
|------|------------|
| **Viewer** 👁️ | Voir les demandes uniquement |
| **Reviewer** ✅ | Voir + Approuver/Refuser |
| **Department Admin** 🏢 | Reviewer + Gérer son département |
| **Super Admin** 👑 | Accès complet + Gestion utilisateurs |

---

## 🏗️ Architecture

### Structure du Projet

```
recours/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Page d'accueil (formulaire étudiant)
│   │   ├── layout.tsx            # Layout principal
│   │   ├── globals.css           # Styles globaux
│   │   ├── admin/                # Section administration
│   │   │   ├── page.tsx          # Dashboard admin
│   │   │   ├── login/            # Page de connexion
│   │   │   └── users/            # Gestion utilisateurs
│   │   └── api/                  # API Routes
│   │       ├── auth/             # Authentification
│   │       ├── admin/            # APIs admin
│   │       ├── student/          # API étudiant
│   │       └── submit-request/   # Soumission demandes
│   ├── components/               # Composants React réutilisables
│   │   ├── AdminHeader.tsx       # En-tête admin
│   │   └── RequestForm.tsx       # Formulaire de demande
│   └── lib/                      # Utilitaires et helpers
│       ├── auth.ts               # Logique authentification
│       ├── email.ts              # Service email
│       ├── permissions.ts        # Système de permissions
│       └── supabase.ts           # Client Supabase
├── netlify/
│   └── functions/                # Netlify Serverless Functions
│       ├── submit-request.js     # Traiter soumissions
│       ├── admin-requests.js     # Gérer demandes admin
│       └── admin-requests-id.js  # Actions demandes individuelles
├── database/                     # Scripts SQL
│   ├── admin_roles_migration.sql # Schéma base de données
│   └── create_default_admin.sql  # Compte admin par défaut
├── public/                       # Assets statiques
│   ├── logo-usthb.png
│   └── favicon.ico
├── .env.local                    # Variables d'environnement (local)
├── .env.example                  # Template environnement
├── netlify.toml                  # Configuration Netlify
├── next.config.ts                # Configuration Next.js
├── tailwind.config.ts            # Configuration Tailwind
├── tsconfig.json                 # Configuration TypeScript
└── package.json                  # Dépendances NPM
```

### Schéma de Base de Données

#### Table: `students`
```sql
id (SERIAL PRIMARY KEY)
matricule (VARCHAR UNIQUE) - Identifiant étudiant
nom, prenom, email, telephone
specialite_actuelle - Spécialité en cours
```

#### Table: `recours_requests`
```sql
id (SERIAL PRIMARY KEY)
matricule, nom, prenom, email, telephone
specialite_actuelle, specialite_souhaitee
raison - Justification du changement
status (ENUM: pending, approved, rejected)
admin_comment - Commentaire administrateur
created_at, reviewed_at, reviewed_by
```

#### Table: `admin_users`
```sql
id (UUID PRIMARY KEY)
name, email, password_hash
role (ENUM: viewer, reviewer, super_admin, department_admin)
department, is_active
failed_login_attempts, locked_until
created_at, updated_at
```

#### Table: `admin_sessions`
```sql
id (UUID PRIMARY KEY)
admin_user_id (FK → admin_users)
token, expires_at, ip_address, user_agent
created_at
```

#### Table: `audit_logs`
```sql
id (UUID PRIMARY KEY)
admin_user_id (FK → admin_users)
action, resource_type, resource_id
details (JSONB), ip_address, user_agent
created_at
```

### Flux de Données

#### Soumission de Demande (Étudiant)
```
1. Étudiant entre matricule
   ↓
2. API vérifie en base → Retourne infos
   ↓
3. Étudiant complète et soumet
   ↓
4. API valide et enregistre
   ↓
5. Email de confirmation envoyé
   ↓
6. Demande visible dans admin
```

#### Traitement de Demande (Admin)
```
1. Admin se connecte (JWT)
   ↓
2. Liste des demandes chargée
   ↓
3. Admin clique sur demande
   ↓
4. Détails affichés
   ↓
5. Admin approuve/refuse
   ↓
6. Si approuvé:
   - Spécialité de l'étudiant mise à jour
   - Email de confirmation envoyé
   ↓
7. Si refusé:
   - Email de notification envoyé
   ↓
8. Statut demande mis à jour
   ↓
9. Action loguée dans audit_logs
```

---

## 🚢 Déploiement

### Déploiement sur Netlify

#### 1. Préparer le Projet

```bash
# S'assurer que le build fonctionne localement
npm run build

# Créer un compte Netlify si nécessaire
```

#### 2. Configuration Netlify

Le fichier `netlify.toml` est déjà configuré :

```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
```

#### 3. Variables d'Environnement Netlify

Dans Netlify Dashboard → Site Settings → Environment variables, ajoutez :

```env
DATABASE_URL=<votre-connection-string>
EMAIL_USER=<votre-email>
EMAIL_APP_PASSWORD=<app-password>
JWT_SECRET=<secret-aleatoire>
NEXT_PUBLIC_SUPABASE_URL=<url-supabase>
SUPABASE_SERVICE_ROLE_KEY=<key-service>
SUPABASE_ANON_KEY=<key-anon>
NODE_VERSION=20
```

#### 4. Déployer

**Option A: Via Git**
```bash
git push origin master
# Netlify détecte automatiquement et déploie
```

**Option B: Via Netlify CLI**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

#### 5. Vérifier le Déploiement

1. Vérifier que le build réussit
2. Tester le formulaire étudiant
3. Tester la connexion admin
4. Vérifier l'envoi d'emails

### Déploiement sur Vercel (Alternative)

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Maintenance Post-Déploiement

- 🔍 **Monitoring** : Surveiller les logs Netlify/Vercel
- 📧 **Emails** : Vérifier la délivrabilité des emails
- 💾 **Base de données** : Backups réguliers via Supabase
- 🔐 **Sécurité** : Rotations des secrets tous les 90 jours

---

## 📸 Captures d'Écran

### Interface Étudiant

<div align="center">

**Page d'Accueil - Formulaire de Demande**

*Interface moderne et intuitive pour soumettre une demande de changement de spécialité*

</div>

### Panneau d'Administration

<div align="center">

**Connexion Admin**

**Dashboard Principal**

**Gestion des Utilisateurs**

</div>

> **Note** : Les captures d'écran seront ajoutées dans le dossier `docs/screenshots/`

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Suivez ces étapes :

### 1. Fork le Projet

```bash
git clone https://github.com/rh0kzy/recours.git
```

### 2. Créer une Branche

```bash
git checkout -b feature/AmazingFeature
```

### 3. Commit les Changements

```bash
git commit -m "Add: Amazing new feature"
```

### 4. Push vers la Branche

```bash
git push origin feature/AmazingFeature
```

### 5. Ouvrir une Pull Request

Décrivez vos changements en détail dans la PR.

### Guidelines

- ✅ Suivre les conventions de code existantes
- ✅ Ajouter des tests pour les nouvelles fonctionnalités
- ✅ Mettre à jour la documentation si nécessaire
- ✅ S'assurer que `npm run lint` passe
- ✅ Tester localement avant de soumettre

---

## 📄 License

Ce projet est sous licence **MIT**. Voir le fichier `LICENSE` pour plus de détails.

```
MIT License

Copyright (c) 2025 USTHB - Faculté d'Informatique

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Auteurs

**Développement & Design**
- [@rh0kzy](https://github.com/rh0kzy)

**Organisation**
- **USTHB** - Université des Sciences et de Technologie Houari Boumediene
- **Faculté d'Informatique**

---

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) - Framework React moderne
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utility-first
- [Supabase](https://supabase.com/) - Backend-as-a-Service
- [Netlify](https://www.netlify.com/) - Plateforme de déploiement
- [Nodemailer](https://nodemailer.com/) - Service d'envoi d'emails
- Communauté open-source pour les bibliothèques utilisées

---

## 📞 Support

Pour toute question ou problème :

- 📧 **Email** : support@usthb.dz
- 🐛 **Issues** : [GitHub Issues](https://github.com/rh0kzy/recours/issues)
- 📖 **Documentation** : [Wiki](https://github.com/rh0kzy/recours/wiki)

---

## 🔄 Changelog

### Version 1.0.0 (Janvier 2025)

#### ✨ Nouvelles Fonctionnalités
- Interface étudiant complète avec formulaire intelligent
- Panneau d'administration avec dashboard responsive
- Système d'authentification multi-rôles (JWT + Sessions)
- Gestion des utilisateurs admin (CRUD complet)
- Transfert automatique des étudiants
- Service d'emails avec templates HTML
- Validation en temps réel
- Actions en masse (sélection multiple)
- Audit logs pour traçabilité

#### 🎨 Design
- UI moderne avec Tailwind CSS 4
- Responsive mobile/tablette/desktop
- Navbar admin avec glassmorphism
- Animations et transitions fluides
- Mode sombre élégant

#### 🔧 Technique
- Migration vers Next.js 15.5.4
- Utilisation de React 19.1.0
- TypeScript pour type-safety
- Turbopack pour builds rapides
- Architecture serverless avec Netlify Functions
- PostgreSQL via Supabase

#### 🔒 Sécurité
- Authentification JWT avec expiration 30 minutes
- Hachage bcrypt des mots de passe (10 rounds)
- Protection CSRF avec tokens
- Validation côté serveur stricte
- HTTP-only cookies pour sessions
- Rate limiting sur authentification
- Audit complet des actions administratives

---

## 🔌 API Reference

### Endpoints Étudiants

#### `GET /api/student`
Rechercher un étudiant par matricule

**Query Parameters:**
- `matricule` (string, required) - Matricule étudiant

**Response:**
```json
{
  "id": 1,
  "matricule": "201234567",
  "nom": "Benali",
  "prenom": "Ahmed",
  "email": "a.benali@usthb.dz",
  "telephone": "0555123456",
  "specialite_actuelle": "Informatique Générale"
}
```

#### `POST /api/submit-request`
Soumettre une nouvelle demande de changement

**Body:**
```json
{
  "matricule": "201234567",
  "nom": "Benali",
  "prenom": "Ahmed",
  "email": "a.benali@usthb.dz",
  "telephone": "0555123456",
  "specialite_actuelle": "Informatique Générale",
  "specialite_souhaitee": "Intelligence Artificielle",
  "raison": "Passion pour l'IA et le machine learning..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Demande soumise avec succès",
  "requestId": 42
}
```

### Endpoints Administration

#### `GET /api/admin/requests`
Liste des demandes (authentification requise)

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Query Parameters:**
- `status` (string, optional) - Filtrer par statut (pending, approved, rejected)

**Response:**
```json
{
  "requests": [
    {
      "id": 42,
      "matricule": "201234567",
      "nom": "Benali",
      "prenom": "Ahmed",
      "status": "pending",
      "specialite_actuelle": "Informatique Générale",
      "specialite_souhaitee": "Intelligence Artificielle",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### `PATCH /api/admin/requests/[id]`
Approuver ou refuser une demande

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Body:**
```json
{
  "status": "approved",
  "admin_comment": "Demande approuvée après étude du dossier"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Demande approuvée avec succès"
}
```

---

## 🧪 Tests

### Tests Manuels

```bash
# Tester la connexion à la base de données
curl http://localhost:3000/api/test-db

# Tester l'envoi d'email
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com"}'

# Tester la recherche d'étudiant
curl "http://localhost:3000/api/student?matricule=201234567"
```

### Validation de Sécurité

- ✅ Protection contre injections SQL (paramètres préparés)
- ✅ Validation stricte des inputs (zod/joi)
- ✅ Sanitisation des données utilisateur
- ✅ Protection CSRF
- ✅ Rate limiting sur authentification
- ✅ Logs d'audit complets

---

<div align="center">

**⭐ Si ce projet vous est utile, n'hésitez pas à lui donner une étoile sur GitHub ! ⭐**

Fait avec ❤️ par l'équipe USTHB

[🔝 Retour en haut](#-usthb-recours)

</div>