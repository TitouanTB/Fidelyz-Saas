# Configuration des Cron Jobs (Cron-job.org)

En raison de la limitation du plan Vercel Hobby (1 cron par jour), nous utilisons [cron-job.org](https://cron-job.org) pour exécuter nos tâches planifiées.

## Configuration

### 1. Prérequis

Avant de configurer les crons, assurez-vous d'avoir défini la variable d'environnement `CRON_SECRET` :
```bash
# Dans Vercel ou votre fichier .env
CRON_SECRET=votre-secret-aleatoire-tres-long
```

### 2. Création des Jobs

Créez un compte sur [cron-job.org](https://cron-job.org) et configurez les jobs suivants :

#### Job 1: Rappels de récompenses (reward-reminders)
- **URL**: `https://votre-domaine.vercel.app/api/cron/reward-reminders`
- **Headers**: `Authorization: Bearer {CRON_SECRET}`
- **Schedule**: `0 9 * * *` (Tous les jours à 9h00)
- **Description**: Envoi de rappels pour les récompenses qui expirent

#### Job 2: Réactivation des clients inactifs (reactivate-inactive)
- **URL**: `https://votre-domaine.vercel.app/api/cron/reactivate-inactive`
- **Headers**: `Authorization: Bearer {CRON_SECRET}`
- **Schedule**: `0 10 * * 1` (Tous les lundis à 10h00)
- **Description**: Envoi de messages de réactivation aux clients inactifs

#### Job 3: Suggestions IA (ai-suggestions)
- **URL**: `https://votre-domaine.vercel.app/api/cron/ai-suggestions`
- **Headers**: `Authorization: Bearer {CRON_SECRET}`
- **Schedule**: `0 8 * * 1` (Tous les lundis à 8h00)
- **Description**: Génération de suggestions de campagnes et récompenses par IA

#### Job 4: Reset des quotas (reset-quotas)
- **URL**: `https://votre-domaine.vercel.app/api/cron/reset-quotas`
- **Headers**: `Authorization: Bearer {CRON_SECRET}`
- **Schedule**: `0 0 1 * *` (Le 1er de chaque mois à minuit)
- **Description**: Reset mensuel des quotas et nettoyage des données

#### Job 5: Envoi des campagnes (send-campaigns)
- **URL**: `https://votre-domaine.vercel.app/api/cron/send-campaigns`
- **Headers**: `Authorization: Bearer {CRON_SECRET}`
- **Schedule**: `0 * * * *` (Toutes les heures)
- **Description**: Envoi des campagnes planifiées

### 3. Configuration des Headers dans cron-job.org

Pour chaque job, vous devez configurer un header d'authentification :

1. Créez un nouveau job
2. Dans la section "Request headers", ajoutez :
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer {votre-CRON_SECRET}`

Remplacez `{votre-CRON_SECRET}` par la valeur réelle de votre variable d'environnement.

### 4. Tests manuels

Vous pouvez tester chaque endpoint manuellement avec `curl` :

```bash
# Rappels de récompenses
curl -H "Authorization: Bearer {CRON_SECRET}" \
  https://votre-domaine.vercel.app/api/cron/reward-reminders

# Réactivation des clients inactifs
curl -H "Authorization: Bearer {CRON_SECRET}" \
  https://votre-domaine.vercel.app/api/cron/reactivate-inactive

# Suggestions IA
curl -H "Authorization: Bearer {CRON_SECRET}" \
  https://votre-domaine.vercel.app/api/cron/ai-suggestions

# Reset des quotas
curl -H "Authorization: Bearer {CRON_SECRET}" \
  https://votre-domaine.vercel.app/api/cron/reset-quotas

# Envoi des campagnes
curl -H "Authorization: Bearer {CRON_SECRET}" \
  https://votre-domaine.vercel.app/api/cron/send-campaigns
```

### 5. Réponses attendues

Les endpoints retournent différents types de réponses :

```json
// Succès normal
{
  "success": true,
  "processed": 5,
  "results": [...]
}

// Job skippé (service non configuré)
{
  "success": true,
  "skipped": true,
  "message": "No messaging services enabled"
}

// Erreur d'authentification
{
  "error": "Unauthorized"
}
```

### 6. Surveillance et Alertes

Configurez les alertes dans cron-job.org pour être notifié en cas d'échec :

- **Email Alert**: Recevez un email si un job échoue 3 fois consécutivement
- **Telegram Alert**: Configurez une alerte Telegram pour les notifications en temps réel

### 7. Sécurité

⚠️ **Important** :
- Ne partagez jamais votre `CRON_SECRET`
- Utilisez un secret long et aléatoire (au moins 32 caractères)
- Changez le secret régulièrement
- Les endpoints sont protégés par vérification du header `Authorization`

### 8. Alternative: Vercel Cron Jobs (Pro Plan)

Si vous upgraderez vers le plan Vercel Pro, vous pourrez utiliser les cron jobs natifs de Vercel en ajoutant la configuration dans `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/cron/reward-reminders",
      "schedule": "0 9 * * *"
    },
    ...
  ]
}
```

Pour l'instant, avec le plan Hobby, nous utilisons cron-job.org qui offre une solution gratuite et fiable.

### 9. Maintenance

Vérifiez régulièrement les logs dans le dashboard de cron-job.org pour vous assurer que tous les jobs s'exécutent correctement.

En cas de problème :
1. Vérifiez que l'URL est correcte
2. Vérifiez que le header Authorization est correctement configuré
3. Vérifiez les logs de l'application dans Vercel
4. Testez manuellement avec curl
