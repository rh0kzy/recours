# 🔍 Filtres Avancés & Tri - Documentation

## ✅ Fonctionnalités implémentées

### 1. 🔍 Filtres Avancés

#### Composant : `RequestFilters.tsx`

**Localisation :** `/admin` (page des demandes)

#### Filtres disponibles :

| Filtre | Type | Description |
|--------|------|-------------|
| **Recherche** | Texte | Recherche par nom, prénom ou matricule (en temps réel) |
| **Statut** | Sélection | Tous / En attente / Approuvé / Rejeté |
| **Date début** | Date | Filtre les demandes depuis cette date |
| **Date fin** | Date | Filtre les demandes jusqu'à cette date |
| **Spécialité actuelle** | Sélection | Liste dynamique de toutes les spécialités actuelles |
| **Spécialité souhaitée** | Sélection | Liste dynamique de toutes les spécialités souhaitées |

#### Fonctionnalités du composant :

✅ **Panneau extensible/réductible**
- Cliquez sur l'en-tête pour afficher/masquer les filtres
- État conservé pendant la session

✅ **Badge "Actifs"**
- Affiche automatiquement quand au moins un filtre est appliqué
- Indication visuelle claire

✅ **Bouton "Réinitialiser"**
- Apparaît uniquement quand des filtres sont actifs
- Un clic pour tout effacer

✅ **Listes dynamiques**
- Les spécialités sont extraites automatiquement des demandes
- Mise à jour automatique quand de nouvelles demandes arrivent
- Triées alphabétiquement

✅ **Recherche intelligente**
- Insensible à la casse (majuscules/minuscules)
- Recherche dans nom, prénom ET matricule simultanément
- Mise à jour en temps réel (pas besoin de cliquer sur "Rechercher")

✅ **Plage de dates**
- Date de début : filtre depuis cette date (incluse)
- Date de fin : filtre jusqu'à cette date à 23h59:59 (jour complet inclus)
- Peut utiliser l'une ou l'autre, ou les deux

---

### 2. 📊 Tri des Colonnes

#### Composant : `SortHeader.tsx`

**Localisation :** `/admin` (entre filtres et liste des demandes)

#### Champs de tri disponibles :

| Champ | Tri ascendant | Tri descendant |
|-------|---------------|----------------|
| **Date** | Plus ancien → Plus récent | Plus récent → Plus ancien (défaut) |
| **Nom** | A → Z (défaut) | Z → A |
| **Statut** | Pending → Approved → Rejected (défaut) | Rejected → Approved → Pending |
| **Spécialité** | A → Z (défaut) | Z → A |

#### Fonctionnalités :

✅ **Indicateurs visuels**
- Le champ actif est en **bleu** et **gras**
- Flèche ↑ pour ascendant, ↓ pour descendant
- Icône double flèche pour champs inactifs

✅ **Comportement intelligent**
- **Premier clic** : active le tri sur ce champ (ordre par défaut)
- **Deuxième clic** : inverse l'ordre
- Date : défaut descendant (plus récent en premier)
- Texte : défaut ascendant (alphabétique)

✅ **Compteur de résultats**
- Affiche le nombre de résultats après filtrage
- Format : "X résultat(s)"

---

## 🎯 Utilisation

### Scénarios d'usage

#### 1. Trouver toutes les demandes en attente
1. Cliquez sur "Filtres avancés" pour les déplier
2. Dans "Statut", sélectionnez "En attente"
3. La liste se met à jour automatiquement

#### 2. Rechercher un étudiant spécifique
1. Dans le champ "Recherche", tapez le nom, prénom ou matricule
2. Les résultats s'affichent en temps réel

#### 3. Voir les demandes de la semaine dernière
1. Cliquez sur "Filtres avancés"
2. Définissez "Date début" à il y a 7 jours
3. Définissez "Date fin" à aujourd'hui
4. Les demandes de cette période s'affichent

#### 4. Trier les demandes par nom
1. Dans la barre de tri, cliquez sur "Nom"
2. Les demandes s'affichent de A → Z
3. Cliquez à nouveau pour inverser (Z → A)

#### 5. Filtres multiples combinés
Exemple : "Demandes approuvées en Informatique ce mois"
1. Statut : "Approuvé"
2. Spécialité souhaitée : "Informatique"
3. Date début : premier jour du mois
4. Date fin : aujourd'hui

---

## 💻 Implémentation technique

### Architecture

```
src/
├── components/
│   ├── RequestFilters.tsx     # Composant de filtres
│   └── SortHeader.tsx          # Composant de tri
└── app/
    └── admin/
        └── page.tsx            # Page principale (intègre les composants)
```

### Logique de filtrage

```typescript
// Filtrage et tri avec useMemo pour optimisation
const filteredAndSortedRequests = useMemo(() => {
  let filtered = [...requests];

  // Appliquer tous les filtres
  // 1. Recherche texte
  // 2. Statut
  // 3. Spécialités
  // 4. Dates

  // Appliquer le tri
  filtered.sort((a, b) => {
    // Logic de tri selon le champ et l'ordre
  });

  return filtered;
}, [requests, filters, sortField, sortOrder]);
```

### Optimisation

- **useMemo** : Évite les recalculs inutiles
- **Extraction des spécialités** : Cache avec useMemo
- **Filtrage en temps réel** : Pas de bouton "Rechercher" nécessaire

---

## 📊 Statistiques

### Avant les filtres
- Difficile de trouver une demande spécifique
- Impossible de voir des tendances
- Tout est mélangé

### Après les filtres
- ✅ Trouvez une demande en 2 secondes
- ✅ Analysez les demandes par période
- ✅ Identifiez les spécialités populaires
- ✅ Gérez les demandes en attente facilement
- ✅ Triez par nom pour l'export ou les réunions

---

## 🎨 Design

### Palette de couleurs

- **Filtres actifs** : Badge bleu (`bg-blue-100 text-blue-800`)
- **Boutons** : Bleu (`bg-blue-600 hover:bg-blue-700`)
- **Tri actif** : Bleu foncé (`text-blue-600 font-semibold`)
- **Bordures** : Gris clair (`border-gray-300`)

### Responsive

- **Mobile** : Empilage vertical des filtres
- **Tablette** : Grille 2 colonnes pour spécialités
- **Desktop** : Grille 3 colonnes pour date/statut

---

## 🔄 Combinaison avec d'autres fonctionnalités

### Avec le mode sélection
- ✅ Filtrez d'abord pour isoler des demandes
- ✅ Activez le mode sélection
- ✅ Supprimez en masse les résultats filtrés

### Avec le dashboard
- Les filtres n'affectent **pas** les statistiques globales
- Le dashboard montre **toutes** les demandes
- La page admin montre les demandes **filtrées**

### Avec l'export (futur)
- Filtrer puis exporter seulement les résultats visibles
- Export Excel des demandes filtrées

---

## 🐛 Cas limites gérés

### Aucun résultat
✅ Message clair : "Aucun résultat ne correspond aux filtres"
✅ Bouton "Réinitialiser les filtres" affiché
✅ Distinction entre "aucune demande" et "aucun résultat filtré"

### Liste vide
✅ Message : "Aucune demande trouvée"
✅ Sous-texte : "Les nouvelles demandes apparaîtront ici"

### Dates invalides
✅ Validation HTML5 (champ de type date)
✅ Date de fin inclut toute la journée (jusqu'à 23h59:59)

### Recherche vide
✅ Aucun filtre appliqué (affiche tout)
✅ Pas de message d'erreur

---

## 📝 Notes pour les développeurs

### Ajout d'un nouveau filtre

1. Ajouter dans l'état `filters` :
```typescript
const [filters, setFilters] = useState({
  // ... filtres existants
  nouveauFiltre: 'valeur_par_défaut'
});
```

2. Ajouter dans `RequestFilters.tsx` :
```tsx
<select
  value={filters.nouveauFiltre}
  onChange={(e) => handleChange('nouveauFiltre', e.target.value)}
>
  <option value="all">Tous</option>
  {/* Options */}
</select>
```

3. Ajouter la logique dans `filteredAndSortedRequests` :
```typescript
if (filters.nouveauFiltre !== 'all') {
  filtered = filtered.filter(req => req.champ === filters.nouveauFiltre);
}
```

### Ajout d'un nouveau champ de tri

1. Ajouter dans le type `SortField` :
```typescript
export type SortField = 'created_at' | 'nom' | 'status' | 'nouveau_champ';
```

2. Ajouter dans `SortHeader.tsx` :
```tsx
<SortButton
  label="Nouveau"
  field="nouveau_champ"
  currentField={sortField}
  currentOrder={sortOrder}
  onSort={onSort}
/>
```

3. Ajouter le case dans le switch :
```typescript
case 'nouveau_champ':
  comparison = a.nouveau_champ.localeCompare(b.nouveau_champ);
  break;
```

---

## ✨ Améliorations futures possibles

- [ ] Sauvegarder les filtres dans localStorage
- [ ] Présets de filtres ("Demandes urgentes", "Ce mois", etc.)
- [ ] Filtres avancés : fourchette de moyenne
- [ ] Recherche avec regex
- [ ] Export des résultats filtrés
- [ ] URL avec paramètres de filtre (partage de liens)
- [ ] Tri multi-colonnes (nom puis date)
- [ ] Historique des recherches
