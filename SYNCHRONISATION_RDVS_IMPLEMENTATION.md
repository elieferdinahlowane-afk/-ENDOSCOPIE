# Synchronisation Automatique: Planification des Examens ↔ Rendez-vous

## 📋 Résumé de l'implémentation

Cette documentation décrit la synchronisation automatique entre l'interface **Planification des examens** et l'interface **Rendez-vous**.

---

## ✅ Comportement implémenté

### 1. **Confirmation du Rendez-vous**
- ✅ Lorsqu'un utilisateur clique sur **"Confirmer le RDV"** dans l'interface de planification des examens, le rendez-vous est immédiatement enregistré dans la base de données
- ✅ Un feedback visuel confirme l'enregistrement réussi
- ✅ L'utilisateur est redirigé vers l'interface "Rendez-vous" après 1 seconde

### 2. **Affichage automatique du Rendez-vous**
- ✅ Une fois enregistré, le rendez-vous apparaît **immédiatement** dans l'interface "Rendez-vous"
- ✅ L'interface utilise un **hook React personnalisé** qui charge automatiquement les rendez-vous du jour
- ✅ Un auto-refresh s'effectue toutes les 30 secondes pour récupérer les mises à jour en temps réel

### 3. **Chargement automatique du jour**
- ✅ Lorsque l'utilisateur accède à l'interface "Rendez-vous", tous les rendez-vous prévus pour **la date du jour** sont affichés automatiquement
- ✅ Les informations affichées sont toujours à jour et reflètent exactement les rendez-vous confirmés

### 4. **Transfert des données**
Les données suivantes sont correctement transférées:
- ✅ Nom et informations du patient (Prénom + Nom)
- ✅ Date du rendez-vous (format ISO)
- ✅ Heure du rendez-vous (début et fin)
- ✅ Médecin concerné (avec civilité)
- ✅ Salle d'examen (nom et numéro)
- ✅ Type d'examen
- ✅ Statut du rendez-vous (Confirmé, Urgent, Prévu, etc.)

---

## 🔧 Changements techniques apportés

### Backend (NestJS)

#### 1. **Nouveau endpoint de filtrage par date**
**Fichier:** `endoscopie-back/src/app.controller.ts` et `endoscopie-back/src/app.service.ts`

```typescript
// GET /api/rendezvous/jour/:date
// Récupère les rendez-vous pour une date spécifique (format YYYY-MM-DD)

@Get('api/rendezvous/jour/:date')
async getRendezVousJour(
  @Param('date') date: string,
  @Query('serviceId') serviceId?: string,
)
```

**Avantages:**
- Charge uniquement les rendez-vous du jour
- Réduit la bande passante
- Améliore les performances

#### 2. **Amélioration de la logique de création**
**Fichier:** `endoscopie-back/src/app.service.ts` (méthode `createRendezVous`)

**Changements:**
- ✅ UPSERT basé sur `prescriptionId` (évite les doublons si prescriptionId existe)
- ✅ Vérification des conflits d'horaire et de salle
- ✅ Prévention des doublons même sans prescriptionId
- ✅ Meilleure gestion des erreurs avec messages explicites
- ✅ Retour des relations complètes (patient, médecin, salle, prescription)

**Logique:**
```
Si prescriptionId fourni:
  → UPSERT (mise à jour si existe, création sinon)
  → Met à jour le statut de la prescription à "Planifié"

Si pas de prescriptionId:
  → Vérifier conflits de salle/horaire
  → Vérifier doublons pour le même patient
  → Créer le rendez-vous
```

### Frontend (Next.js/React)

#### 1. **Hook React personnalisé: `useRendezVousSync`**
**Fichier:** `endoscopie-front/lib/hooks/useRendezVousSync.ts`

**Fonctionnalités:**
- Charge automatiquement les rendez-vous du jour au montage
- Auto-refresh configurable (défaut: 30 secondes)
- Détection automatique des nouveaux rendez-vous créés
- Notifications de succès/erreur
- Gestion optimisée de l'état

**Utilisation:**
```typescript
const { 
  rendezVous,      // Tableau des RDV du jour
  loading,         // État de chargement
  error,           // Erreur éventuelle
  lastRefresh,     // Dernier rafraîchissement
  refresh          // Fonction pour forcer un refresh
} = useRendezVousSync({
  date: '2024-06-16',        // Optionnel (défaut: aujourd'hui)
  refreshInterval: 30000,    // 30 secondes
  onRendezVousCreated: (rdv) => console.log('Nouveau RDV!'),
  onError: (error) => console.error(error),
  serviceId: 'xxx'           // Optionnel
});
```

#### 2. **Amélioration: Planification des examens**
**Fichier:** `endoscopie-front/app/planification-examens/page.tsx`

Le composant existant a été conservé tel quel car il fonctionne correctement:
- ✅ Envoi du rendez-vous via `POST /api/rendezvous`
- ✅ Sauvegarde en localStorage pour compatibilité héritée
- ✅ Redirection automatique vers l'agenda après 1 seconde
- ✅ Feedback visuel (bouton animé, confirmation)

#### 3. **Amélioration: Interface Rendez-vous**
**Fichier:** `endoscopie-front/app/agenda-rendez-vous/page.tsx`

**Changements majeurs:**
- ✅ Utilise maintenant le hook `useRendezVousSync` pour charger les rendez-vous
- ✅ Auto-refresh toutes les 30 secondes pour détection des nouveaux RDV
- ✅ Affichage dynamique des notifications quand un RDV est créé
- ✅ Meilleure gestion des états (loading, error, empty)
- ✅ Bouton refresh manuel pour forcer une synchronisation immédiate
- ✅ Affichage amélioré du dernier rafraîchissement

---

## 🚀 Flux de travail complet

```
┌─────────────────────────────────────────────────────────────┐
│ UTILISATEUR                                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Planification des examens  │
        │ - Remplir formulaire       │
        │ - Sélectionner date/heure  │
        │ - Cliquer: "Confirmer RDV" │
        └────────────┬───────────────┘
                     │
                     ▼ POST /api/rendezvous
        ┌────────────────────────────┐
        │ BACKEND (NestJS)           │
        │ - Valider données          │
        │ - Vérifier conflits        │
        │ - UPSERT en BDD            │
        │ - Mettre à jour Prescrip.  │
        └────────────┬───────────────┘
                     │
                     ▼ Réponse 200 OK
        ┌────────────────────────────┐
        │ Frontend (React)            │
        │ - Afficher "Confirmé!"      │
        │ - Sauvegarder localStorage  │
        │ - Redirection après 1s      │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │ Interface Rendez-vous              │
        │ - Hook useRendezVousSync se décl.  │
        │ - GET /api/rendezvous/jour/{date}  │
        │ - Affichage immédiat du nouveau RDV│
        │ - Auto-refresh 30s                 │
        └────────────────────────────────────┘
```

---

## 📊 Données transférées

| Donnée | Source | Destination | Format |
|--------|--------|-------------|---------|
| **Nom Patient** | Planification → Prescription | Rendez-vous | `patient.prenom + patient.nom` |
| **Date Début** | Formulaire date/heure | BDD | `dateHeureDebut` (ISO) |
| **Date Fin** | Formulaire date/heure | BDD | `dateHeureFin` (ISO) |
| **Médecin** | Formulaire select | Rendez-vous | `medecin.nom` |
| **Salle** | Formulaire select | Rendez-vous | `salle.nom + salle.numero` |
| **Type Examen** | Prescription | Rendez-vous | `prescription.typeExamen` |
| **Statut** | Logique priorité | Rendez-vous | `Confirmé` ou `Urgent` |

---

## 🛡️ Prévention des doublons

### Mécanisme 1: UPSERT par prescriptionId
```
Si prescriptionId est fourni:
  → Cherche si un RDV existe déjà pour cette prescription
  → Si oui: Met à jour (évite les doublons)
  → Si non: Crée un nouveau RDV
```

### Mécanisme 2: Vérification des conflits
```
Si pas de prescriptionId:
  → Vérifier si la salle est occupée au même horaire
  → Vérifier si le même patient a déjà un RDV à cette heure
  → Rejeter avec message explicite en cas de conflit
```

### Résultat
✅ **Impossible de créer deux RDV pour:**
- La même prescription
- La même salle au même horaire
- Le même patient à la même heure (fenêtre ±1h)

---

## ⚙️ Synchronisation en temps réel

### Auto-refresh (30 secondes)
```typescript
// Le hook recharge automatiquement les données
setInterval(() => loadRendezVous(), 30000)
```

### Détection des nouveaux RDV
```typescript
// Comparaison du nombre avant/après
if (newCount > previousCount) {
  onRendezVousCreated(newRdv)  // Notification
}
```

### Notification utilisateur
```
✓ "Nouveau rendez-vous créé pour Jean DUPONT"
(visible 3 secondes en haut à droite)
```

---

## 🧪 Comment tester

### Test 1: Création simple
```
1. Aller à /planification-examens
2. Remplir le formulaire (patient, date, heure)
3. Cliquer "Confirmer le RDV"
4. Vérifier que le bouton affiche "Confirmé!"
5. Attendre la redirection vers /agenda-rendez-vous
6. Vérifier que le RDV apparaît dans la liste
```

### Test 2: Synchronisation temps réel
```
1. Ouvrir /agenda-rendez-vous dans l'onglet A
2. Créer un RDV via /planification-examens (onglet B)
3. Vérifier que le nouveau RDV apparaît dans l'onglet A en < 30s
4. Notification "Nouveau rendez-vous créé" devrait s'afficher
```

### Test 3: Éviter les doublons
```
1. Créer un RDV avec prescriptionId X
2. Attendre 2-3 secondes
3. Créer le même RDV avec prescriptionId X
4. Vérifier que le premier RDV a été mis à jour (pas un doublon)
5. Vérifier que la BDD n'a qu'un seul RDV pour la prescription
```

### Test 4: Filtre par date
```
1. Aller à /agenda-rendez-vous aujourd'hui
2. Vérifier que SEULS les RDV du jour s'affichent
3. Cliquer "Hier" (bouton flèche gauche)
4. Vérifier que SEULS les RDV d'hier s'affichent (ou rien si aucun)
5. Cliquer "Demain"
6. Vérifier que SEULS les RDV de demain s'affichent (ou rien si aucun)
```

### Test 5: Auto-refresh
```
1. Ouvrir /agenda-rendez-vous
2. Vérifier "Actualisé à: XX:XX:XX"
3. Attendre 35 secondes
4. Vérifier que l'heure a changé (refresh automatique)
5. Console: aucune erreur (voir Network tab)
```

---

## 🔍 Dépannage

### Problème: "Le RDV n'apparaît pas immédiatement"
**Cause possible:** 
- L'API `/api/rendezvous/jour/:date` retourne une erreur
- La date envoyée au backend est incorrecte

**Solution:**
```
1. Ouvrir la console (F12)
2. Vérifier les erreurs dans "Network"
3. Vérifier le format de date: YYYY-MM-DD
4. Cliquer le bouton "Rafraîchir" manuellement
```

### Problème: "Créer les doublons malgré la prévention"
**Cause possible:**
- `prescriptionId` n'est pas fourni
- Conflit de timing (deux créations en < 100ms)

**Solution:**
```
1. Vérifier que prescriptionId est bien envoyé:
   - Console → Network → Voir le payload POST
2. Ajouter un délai avant la seconde création
3. Forcer un refresh manuel
```

### Problème: "L'auto-refresh ne fonctionne pas"
**Cause possible:**
- Le hook n'a pas été monté (composant caché)
- `refreshInterval` est à 0 ou négatif

**Solution:**
```
1. Vérifier que le composant est visible
2. Vérifier useRendezVousSync({ refreshInterval: 30000 })
3. Cliquer le bouton refresh manuel
```

---

## 📝 Fichiers modifiés

| Fichier | Type | Changement |
|---------|------|-----------|
| `endoscopie-back/src/app.controller.ts` | Backend | Ajout endpoint `/api/rendezvous/jour/:date` |
| `endoscopie-back/src/app.service.ts` | Backend | Amélioration méthodes `getRendezVousJour` et `createRendezVous` |
| `endoscopie-front/lib/hooks/useRendezVousSync.ts` | Frontend | **NOUVEAU** Hook React personnalisé |
| `endoscopie-front/app/agenda-rendez-vous/page.tsx` | Frontend | Intégration du hook `useRendezVousSync` |
| `endoscopie-front/app/planification-examens/page.tsx` | Frontend | Aucun changement (fonctionne correctement) |

---

## ✅ Critères de validation

- [x] Rendez-vous créé dans la BDD via `/api/rendezvous`
- [x] Rendez-vous accessible via `/api/rendezvous/jour/{date}`
- [x] Affichage automatique dans l'interface Rendez-vous < 30s
- [x] Pas de doublons même avec plusieurs clics
- [x] Données correctement transférées (patient, médecin, salle, date, etc.)
- [x] Synchronisation en temps réel (auto-refresh 30s)
- [x] Notification utilisateur quand nouveau RDV créé
- [x] Redirection vers Rendez-vous après confirmation
- [x] Gestion des erreurs et feedback utilisateur

---

## 🚀 Prochaines améliorations possibles

- [ ] Ajouter WebSocket pour sync temps réel instantanée
- [ ] Notifier par email/SMS lors de création RDV
- [ ] Afficher le statut de la prescription lors de la création RDV
- [ ] Ajouter annulation/modification de RDV avec sync
- [ ] Affichage détaillé du RDV au clic
- [ ] Historique des changements de RDV
- [ ] Export calendar (iCal, Google Calendar)

---

**Dernière mise à jour:** 16 Juin 2026  
**Statut:** ✅ Implémentation complète et testée
