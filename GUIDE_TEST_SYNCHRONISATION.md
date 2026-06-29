# 🧪 Guide de test rapide - Synchronisation RDVs

## ✨ Vue d'ensemble

Ce guide vous aide à valider la synchronisation automatique entre:
- **Planification des examens** → Crée le RDV
- **Rendez-vous** → Affiche le RDV automatiquement

---

## 🚀 Test basique (5 minutes)

### Étape 1: Ouvrir les interfaces
```
1. Navigateur 1: http://localhost:3000/planification-examens
2. Navigateur 2 ou onglet: http://localhost:3000/agenda-rendez-vous
```

### Étape 2: Créer un rendez-vous
```
Dans Planification des examens:
1. Remplir le formulaire:
   - Patient: "Jean DUPONT"
   - Date: Aujourd'hui (voir le calendrier)
   - Heure début: 14:00
   - Heure fin: 14:45
   - Salle: Salle 1
   - Médecin: Dr. Elena Rodriguez
   - Observations: (optionnel)

2. Cliquer le bouton "Confirmer le RDV"
3. Attendre que le bouton affiche "Confirmé!" ✅
```

### Étape 3: Vérifier l'affichage
```
Rendez-vous (Navigateur 2):
1. La page devrait charger les RDV du jour automatiquement
2. Chercher dans la liste:
   - Patient: Jean DUPONT
   - Heure: 14:00 → 14:45
   - Salle: Salle 1
   - Médecin: Dr. Elena Rodriguez

3. Si présent: ✅ SUCCÈS
   Si absent: ❌ Vérifier la console (F12)
```

---

## 🔄 Test de synchronisation temps réel

### Étape 1: Ouvrir deux onglets
```
Tab A: http://localhost:3000/agenda-rendez-vous
Tab B: http://localhost:3000/planification-examens
```

### Étape 2: Créer et observer
```
Tab B - Créer RDV:
- Remplir et confirmer
- Noter le timestamp

Tab A - Observer:
- Attendre max 30 secondes
- Chercher le nouveau RDV
- Vérifier la notification: "Nouveau rendez-vous créé pour..."

Résultat attendu:
- ✅ RDV apparaît dans Tab A en < 30s
- ✅ Notification s'affiche
- ✅ Dernier rafraîchissement: mis à jour
```

---

## 🛡️ Test anti-doublons

### Scénario 1: Double clique
```
1. Aller à /planification-examens
2. Remplir le formulaire complet
3. Cliquer rapidement 2 fois sur "Confirmer le RDV"
4. Attendre l'enregistrement

Résultat attendu:
- ✅ Un seul RDV créé en BDD
- ✅ Pas d'erreur 409 (Conflict)
- ✅ Console: pas d'erreur

Vérification:
- Aller à /agenda-rendez-vous
- Chercher le patient
- ✅ Le RDV n'apparaît qu'une fois (pas de doublon)
```

### Scénario 2: Même prescription
```
1. Créer RDV pour la prescription "ABC123"
2. Attendre 3 secondes
3. Modifier légèrement (ex: heure fin)
4. Créer le même RDV pour "ABC123"

Résultat attendu:
- ✅ Le premier RDV a été mis à jour (pas créé)
- ✅ Un seul RDV en BDD pour cette prescription
- ✅ Les modifications sont sauvegardées
```

---

## 📊 Test de données transférées

### Vérifier toutes les données
```
Ouvrir l'interface Rendez-vous et vérifier:

✅ Nom patient: Exact comme rempli
✅ Date: Correspond au calendrier
✅ Heure début: Correspond au formulaire
✅ Heure fin: Correspond au formulaire
✅ Médecin: Correspond à la sélection
✅ Salle: Correspond à la sélection
✅ Type examen: Présent et correct
✅ Statut: "Confirmé" ou "Urgent" selon priorité
```

### Contrôle Backend (F12 Network)
```
1. Ouvrir F12 → Onglet Network
2. Créer un RDV
3. Chercher la requête POST vers /api/rendezvous
4. Cliquer dessus → Onglet "Payload"

Vérifier le JSON:
{
  "patientId": "xxx",        ✅ Présent
  "medecinId": "xxx",        ✅ Présent  
  "salleId": "xxx",          ✅ Présent
  "dateHeureDebut": "2024-06-16T14:00:00",  ✅ Format ISO
  "dateHeureFin": "2024-06-16T14:45:00",    ✅ Format ISO
  "typeExamen": "Coloscopie",  ✅ Présent
  "statut": "Confirmé",      ✅ Présent
  "prescriptionId": "xxx"    ✅ Si applicable
}
```

---

## 🔍 Diagnostique en cas de problème

### Problème 1: "RDV n'apparaît pas"
```
Checklist:
☐ Ouvrir F12 → Console
☐ Chercher des erreurs rouges
☐ Vérifier la requête POST (Network)
  - Status: 200? (sinon noter le code)
  - Payload correct? (vérifier dates au format ISO)
☐ Vérifier la requête GET /api/rendezvous/jour/2024-06-16
  - Status: 200?
  - Données retournées? (même si vides)

Actions à prendre:
→ Cliquer le bouton "Rafraîchir" dans Rendez-vous
→ Attendre 35 secondes (auto-refresh)
→ Recharger la page (F5)
```

### Problème 2: "Erreur 500 en créant RDV"
```
Checklist:
☐ Ouvrir F12 → Console
☐ Lire le message d'erreur exact
☐ Vérifier Backend est en cours d'exécution
☐ Vérifier la BDD est accessible

Actions à prendre:
→ Vérifier que le date format est correct (YYYY-MM-DD)
→ Vérifier que salleId existe réellement
→ Vérifier que medecinId existe réellement
→ Vérifier les logs du backend: npm run dev
```

### Problème 3: "Auto-refresh ne fonctionne pas"
```
Checklist:
☐ Onglet actif? (refresh pause si onglet inactif)
☐ Console: erreurs de network?
☐ Timestamp change? (vérifier "Actualisé à")
☐ Intervalle correct? (devrait être 30s)

Actions à prendre:
→ Cliquer le bouton refresh manuel
→ Vérifier F12 Network (requête GET toutes les 30s)
```

---

## 📋 Checklist complète

### Configuration
- [ ] Backend running: `npm run dev` (dans endoscopie-back/)
- [ ] Frontend running: `npm run dev` (dans endoscopie-front/)
- [ ] Base de données accessible
- [ ] API URL correctement configurée

### Endpoints disponibles
- [ ] `GET /api/rendezvous` → Tous les RDV (✅ deprecated, mais fonctionne)
- [ ] `GET /api/rendezvous/jour/2024-06-16` → RDV du jour (✅ NOUVEAU)
- [ ] `POST /api/rendezvous` → Créer RDV (✅ amélioré)

### Frontend
- [ ] Hook `useRendezVousSync` importé correctement
- [ ] Composant `agenda-rendez-vous` utilise le hook
- [ ] Auto-refresh 30s activé
- [ ] Notification succès affichée
- [ ] Bouton refresh manuel fonctionne

### Backend
- [ ] Méthode `getRendezVousJour(date)` retourne les bonnes données
- [ ] Méthode `createRendezVous()` prévient les doublons
- [ ] Vérification des conflits de salle fonctionne
- [ ] Statut prescription mis à jour à "Planifié"

---

## 🎯 Critères de succès

Pour valider que tout fonctionne correctement:

**Test 1: Création** ✅
- Bouton affiche "Confirmé!"
- Pas d'erreur en console
- BDD reçoit les données

**Test 2: Affichage** ✅
- RDV apparaît dans Rendez-vous en < 30s
- Toutes les données correctes
- Pas de doublon

**Test 3: Synchronisation** ✅
- Auto-refresh toutes les 30s
- Timestamp mis à jour
- Notification affichée

**Test 4: Anti-doublons** ✅
- Double clique → 1 seul RDV
- Même prescription → Mise à jour (pas création)
- Gestion des conflits horaires

---

## 📞 Support

Si vous rencontrez un problème:

1. **Vérifier la console:** F12 → Console
2. **Vérifier Network:** F12 → Network (filtrer "rendezvous")
3. **Vérifier Backend logs:** Terminal npm run dev
4. **Forcer un refresh:** Ctrl+Shift+R (cache vide)

**Commandes utiles:**
```bash
# Redémarrer Backend
npm run dev  # dans endoscopie-back/

# Redémarrer Frontend
npm run dev  # dans endoscopie-front/

# Vérifier les erreurs
npm run lint

# Tester une requête API
curl http://localhost:3001/api/rendezvous/jour/2024-06-16
```

---

**Version:** 1.0  
**Date:** 16 Juin 2026  
**Statut:** ✅ Prêt pour tester
