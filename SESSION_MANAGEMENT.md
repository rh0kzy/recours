# 🔐 Système de Gestion de Session Automatique

## ✅ Fonctionnalités Implémentées

### 1. **Rate Limiting avec Base de Données** ✅
- **Max 5 tentatives** de connexion par email en 15 minutes
- **Verrouillage automatique** du compte après 5 échecs
- **Déblocage automatique** après 15 minutes
- **Stockage en DB** : Utilise les colonnes `failed_login_attempts` et `locked_until`
- **API Admin** : Super admins peuvent débloquer manuellement
- **Statistiques** : Endpoint pour voir les comptes verrouillés

### 2. **Session Timeout Automatique** ✅
- **Déconnexion automatique** après 30 minutes d'inactivité
- **Rafraîchissement auto** du token 5 minutes avant expiration
- **Détection d'activité** : souris, clavier, scroll, touch
- **Message d'avertissement** : "Session expirée" sur la page de login

---

## 📁 Fichiers Créés/Modifiés

### Nouveaux Fichiers

#### 1. `src/lib/rateLimitDB.ts`
**Rôle** : Gestion du rate limiting basé sur la base de données

**Fonctions principales** :
```typescript
// Vérifier si un compte est verrouillé
checkAccountLock(email: string): Promise<RateLimitResult>

// Enregistrer une tentative échouée
recordFailedLoginAttempt(email: string): Promise<void>

// Réinitialiser après connexion réussie
resetFailedAttempts(email: string): Promise<void>

// Débloquer manuellement (super admin)
unlockAccount(email: string): Promise<{success, message}>

// Obtenir les statistiques
getLockedAccountsStats()
getAccountsWithFailedAttempts()
```

#### 2. `src/hooks/useSessionTimeout.ts`
**Rôle** : Hook React pour gérer le timeout de session côté client

**Fonctionnalités** :
- Détecte l'inactivité utilisateur
- Rafraîchit automatiquement le token
- Déconnecte après 30 minutes d'inactivité
- Throttling pour éviter trop d'appels

**Utilisation** :
```typescript
const { updateActivity, refreshSession, logout } = useSessionTimeout({
  inactivityTimeout: 30 * 60 * 1000, // 30 min
  checkInterval: 60 * 1000, // Vérifier chaque minute
  refreshThreshold: 5 * 60 * 1000, // Rafraîchir 5 min avant expiration
  onBeforeLogout: () => console.log('About to logout'),
  disabled: false, // Pour désactiver (page login)
});
```

#### 3. `src/components/SessionManager.tsx`
**Rôle** : Composant wrapper pour gérer la session

**Utilisation** :
```tsx
// Dans le layout admin
<SessionManager>
  {children}
</SessionManager>

// Pour désactiver (page login)
<SessionManager disabled>
  {children}
</SessionManager>
```

#### 4. `src/app/admin/layout.tsx`
**Rôle** : Layout pour toutes les pages admin (sauf login)

```tsx
import { SessionManager } from '@/components/SessionManager';

export default function AdminLayout({ children }) {
  return <SessionManager>{children}</SessionManager>;
}
```

#### 5. `src/app/admin/login/layout.tsx`
**Rôle** : Layout pour la page de login (session manager désactivé)

```tsx
<SessionManager disabled>{children}</SessionManager>
```

#### 6. `src/app/api/auth/refresh/route.ts`
**Rôle** : API endpoint pour rafraîchir le token de session

**Endpoint** : `POST /api/auth/refresh`

**Comportement** :
1. Vérifie le token actuel
2. Génère un nouveau token JWT
3. Met à jour la session en DB
4. Retourne un nouveau cookie

#### 7. `src/app/api/admin/locked-accounts/route.ts`
**Rôle** : API pour obtenir les statistiques des comptes verrouillés

**Endpoint** : `GET /api/admin/locked-accounts`

**Permissions** : Super admin uniquement

**Retour** :
```json
{
  "success": true,
  "data": {
    "locked": {
      "lockedAccounts": [...],
      "totalLocked": 5
    },
    "failedAttempts": {
      "accounts": [...],
      "total": 12
    }
  }
}
```

#### 8. `src/app/api/admin/unlock-account/route.ts`
**Rôle** : API pour débloquer un compte manuellement

**Endpoint** : `POST /api/admin/unlock-account`

**Permissions** : Super admin uniquement

**Body** :
```json
{
  "email": "admin@example.com"
}
```

### Fichiers Modifiés

#### 1. `src/app/api/auth/login/route.ts`
**Changements** :
- Import de `rateLimitDB` au lieu de `rateLimit` (mémoire)
- Vérification du compte verrouillé avant authentification
- Enregistrement des tentatives échouées en DB
- Réinitialisation après succès

#### 2. `src/app/admin/login/page.tsx`
**Changements** :
- Ajout de `useSearchParams` avec Suspense
- Détection du paramètre `?reason=session_expired`
- Affichage du message "Session expirée"
- Wrapper avec Suspense pour éviter l'erreur de build

---

## 🔄 Flux de Fonctionnement

### Connexion avec Rate Limiting

```
1. Utilisateur entre email/password
   ↓
2. Check si compte verrouillé (DB: locked_until)
   ↓
3. Si verrouillé → Return 429 avec temps restant
   ↓
4. Si non verrouillé → Authentifier
   ↓
5. Si échec → Incrémenter failed_login_attempts
   ↓
6. Si 5 échecs → Verrouiller (locked_until = NOW() + 15 min)
   ↓
7. Si succès → Réinitialiser compteurs + créer session
```

### Session Timeout Automatique

```
Page Admin chargée
   ↓
SessionManager activé
   ↓
useSessionTimeout hook démarre
   ↓
Écoute des événements (mouse, keyboard, scroll)
   ↓
Chaque minute : vérifie inactivité
   ↓
Si inactif > 25 min → Rafraîchir token (/api/auth/refresh)
   ↓
Si inactif > 30 min → Logout automatique
   ↓
Redirection → /admin/login?reason=session_expired
```

### Rafraîchissement de Token

```
Hook détecte : session expire bientôt
   ↓
Appel POST /api/auth/refresh
   ↓
Vérification token actuel
   ↓
Génération nouveau token JWT
   ↓
Mise à jour session en DB
   ↓
Nouveau cookie HttpOnly
   ↓
Session étendue de 30 minutes
```

---

## 🧪 Comment Tester

### Test 1 : Rate Limiting

```bash
# Tentative 1-4 : Erreur avec compteur
Email: test@test.com
Password: wrong
→ "4 tentative(s) restante(s)"

# Tentative 5 : Verrouillage
→ "Compte verrouillé. Réessayez dans 15 minutes."

# Vérifier en DB
SELECT email, failed_login_attempts, locked_until 
FROM admin_users 
WHERE email = 'test@test.com';
```

### Test 2 : Session Timeout

```bash
# 1. Se connecter
# 2. Ouvrir la console du navigateur
# 3. Observer les logs :
#    - "✅ Session refreshed successfully" (après 25 min)
#    - "⏰ Inactive for 30 minutes, logging out..." (après 30 min)
# 4. Après 30 min d'inactivité → Redirection auto vers login
# 5. Message affiché : "Votre session a expiré..."
```

### Test 3 : Rafraîchissement Manuel

```bash
# Dans la console du navigateur (page admin)
fetch('/api/auth/refresh', {
  method: 'POST',
  credentials: 'include'
}).then(res => res.json()).then(console.log);

# Devrait retourner :
# { success: true, message: 'Session refreshed', expiresAt: '...' }
```

### Test 4 : Déblocage Admin

```bash
# En tant que super admin
POST /api/admin/unlock-account
Content-Type: application/json

{
  "email": "blocked@example.com"
}

# Devrait retourner :
# { success: true, message: 'Compte débloqué avec succès' }
```

---

## 🔒 Sécurité

### Mesures Implémentées

✅ **Rate Limiting** : Max 5 tentatives par email
✅ **Verrouillage temporaire** : 15 minutes
✅ **Session Timeout** : 30 minutes d'inactivité
✅ **HttpOnly Cookies** : Protection XSS
✅ **JWT avec expiration** : 30 minutes
✅ **HTTPS only en production** : `secure: true`
✅ **SameSite** : Protection CSRF
✅ **Logs d'audit** : Toutes les actions sont loggées
✅ **IP tracking** : Enregistrement de l'IP pour chaque tentative

### Améliorations Possibles (Futur)

🔲 **CAPTCHA** : Après 3 tentatives échouées
🔲 **2FA** : Pour les super admins
🔲 **Notification email** : Lors de tentatives suspectes
🔲 **Géolocalisation IP** : Détecter connexions inhabituelles
🔲 **Device fingerprinting** : Reconnaître les appareils
🔲 **Blocage permanent** : Après X verrouillages répétés

---

## 📊 Base de Données

### Colonnes Utilisées

Table `admin_users` :
```sql
failed_login_attempts INT DEFAULT 0
locked_until TIMESTAMP
last_login TIMESTAMP
```

Table `admin_sessions` :
```sql
id UUID PRIMARY KEY
admin_user_id UUID REFERENCES admin_users(id)
token VARCHAR(500) UNIQUE
expires_at TIMESTAMP
ip_address VARCHAR(45)
user_agent TEXT
created_at TIMESTAMP
```

### Requêtes Importantes

```sql
-- Voir les comptes verrouillés
SELECT email, name, failed_login_attempts, locked_until
FROM admin_users
WHERE locked_until IS NOT NULL 
  AND locked_until > NOW();

-- Débloquer manuellement
UPDATE admin_users
SET failed_login_attempts = 0, locked_until = NULL
WHERE email = 'user@example.com';

-- Voir les sessions actives
SELECT u.email, s.expires_at, s.ip_address
FROM admin_sessions s
JOIN admin_users u ON s.admin_user_id = u.id
WHERE s.expires_at > NOW()
ORDER BY s.created_at DESC;

-- Nettoyer les sessions expirées
DELETE FROM admin_sessions WHERE expires_at < NOW();
```

---

## 🎯 Prochaines Étapes

1. ✅ Rate Limiting (Terminé)
2. ✅ Session Timeout (Terminé)
3. 🔜 **Password Reset** (#3 dans FEATURES_TODO.txt)
   - Fonctionnalité "Mot de passe oublié"
   - Envoi d'email avec lien de réinitialisation
   - Le lien "Forgot password?" existe déjà mais n'est pas fonctionnel

4. 🔜 **2FA** (#4)
   - Pour les Super Admins
   - Code par email ou authenticator app

---

## 📝 Notes Techniques

### Throttling des Événements

Le hook `useSessionTimeout` utilise un throttle de **1 seconde** pour éviter trop d'appels à `updateActivity()`. Cela signifie que même si l'utilisateur bouge la souris 100 fois par seconde, on ne met à jour le timestamp qu'une fois par seconde.

### Nettoyage Automatique

Les sessions expirées sont **automatiquement supprimées** :
- À chaque login
- À chaque rafraîchissement de token
- Peut aussi être fait via un cron job

### Fail Open vs Fail Closed

Le système utilise une stratégie **fail open** : si Redis/DB est inaccessible, on autorise quand même la connexion pour éviter un déni de service. C'est un choix de design qui privilégie la disponibilité sur la sécurité maximale.

### Pourquoi pas Redis ?

On a choisi d'utiliser la **base de données PostgreSQL** au lieu de Redis pour le rate limiting car :
1. ✅ Déjà en place avec Supabase
2. ✅ Persistance garantie
3. ✅ Pas de dépendance supplémentaire
4. ✅ Suffisant pour le volume attendu
5. ✅ Simplifie le déploiement

Pour un système à très haut volume (>1000 req/sec), Redis serait préférable.

---

## 🚀 Déploiement

Le système fonctionne directement sur **Netlify** sans configuration supplémentaire. Les variables d'environnement nécessaires sont :

```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key-min-32-characters
NODE_ENV=production
```

Pas besoin de Redis, tout est dans PostgreSQL ! 🎉
