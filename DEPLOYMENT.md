# Guide de déploiement Fidelyz

Ce guide décrit la configuration complète pour un déploiement en production de Fidelyz (Vercel ou hébergement Node). Pour la checklist opérationnelle, voir [CHECKLIST.md](./CHECKLIST.md).

## 1. Pré-requis

- Node.js 18+
- PostgreSQL (Supabase recommandé)
- Comptes : Supabase, Stripe, Twilio, Resend, Google AI
- Domaine public et certificat TLS (si auto-hébergement)

## 2. Configuration des services externes

### Supabase

1. Créez un projet Supabase.
2. Récupérez :
   - URL du projet
   - `anon` key
   - `service_role` key
3. Utilisez les URL de connexion PostgreSQL pour `DATABASE_URL` et `DIRECT_URL`.

### Stripe

1. Créez les produits et tarifs (Starter, Pro, Enterprise).
2. Récupérez :
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_ID_*`
3. Configurez le webhook :
   - URL : `https://<votre-domaine>/api/billing/webhook`
   - Événements : `checkout.session.completed`, `customer.subscription.*`, `invoice.*`

### Twilio (SMS/WhatsApp)

1. Créez un compte et un numéro expéditeur.
2. Renseignez `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` et `TWILIO_WHATSAPP_NUMBER`.
3. Configurez le webhook de statut :
   - URL : `https://<votre-domaine>/api/messaging/webhooks?provider=twilio`
   - Méthode : `POST`

### Resend (Email)

1. Créez un domaine expéditeur et validez le SPF/DKIM.
2. Renseignez `RESEND_API_KEY` et `EMAIL_FROM`.
3. Configurez le webhook d'événements :
   - URL : `https://<votre-domaine>/api/messaging/webhooks?provider=resend`
   - Événements : delivered, opened, clicked, bounced, complained.

### Google Gemini

- Renseignez `GOOGLE_AI_API_KEY`.

### Apple Wallet (optionnel)

- Fournissez les certificats et identifiants requis :
  - `APPLE_WALLET_CERTIFICATE_PATH`
  - `APPLE_WALLET_CERTIFICATE_PASSWORD`
  - `APPLE_WALLET_PASS_TYPE_ID`
  - `APPLE_WALLET_TEAM_ID`
  - `APPLE_WALLET_KEY_ID`
  - `APPLE_WALLET_PRIVATE_KEY_PATH`

## 3. Variables d'environnement

Créez un fichier `.env` à partir de `.env.example`. Les variables critiques sont listées ci-dessous.

### Obligatoires (production)

- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_STARTER`
- `STRIPE_PRICE_ID_PRO`
- `STRIPE_PRICE_ID_ENTERPRISE`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `GOOGLE_AI_API_KEY`
- `NEXTAUTH_SECRET`
- `JWT_SECRET`
- `CRON_SECRET`

### Optionnelles

- `REDIS_URL`
- `NEXT_PUBLIC_GA_ID`
- `TWILIO_WHATSAPP_NUMBER`
- `APPLE_WALLET_*`
- `ENABLE_SMS`, `ENABLE_WHATSAPP`, `ENABLE_WALLET`, `ENABLE_AI_SUGGESTIONS`

> Génération de secrets : `openssl rand -base64 32`

## 4. Base de données et migrations

En production, utilisez des migrations déployées :

```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

En local (développement rapide) :

```bash
npm run db:generate
npm run db:push
```

## 5. Déploiement sur Vercel (recommandé)

1. Importez le dépôt dans Vercel.
2. Vérifiez que les commandes sont bien :
   - Install : `npm install`
   - Build : `npm run build`
   - Output : Next.js (automatique)
3. Ajoutez toutes les variables d'environnement dans le tableau Vercel.
4. Renseignez `NEXT_PUBLIC_APP_URL` avec l'URL publique de l'application.
5. Déployez.

> **Note sur les cron jobs** : Le plan Vercel Hobby est limité à 1 cron par jour. Nous utilisons [cron-job.org](https://cron-job.org) comme alternative gratuite pour exécuter les tâches planifiées. Voir la section [Cron jobs](#7-cron-jobs) ci-dessous.

## 6. Déploiement auto-hébergé (Node)

### Build et démarrage

```bash
npm install
npm run build
npm run start
```

### Process manager (exemple PM2)

```bash
pm2 start npm --name fidelyz -- start
pm2 save
```

### Reverse proxy (Nginx)

- Terminez TLS via Nginx/Caddy/Traefik.
- Transmettez les en-têtes `X-Forwarded-*`.
- Configurez le domaine public dans `NEXT_PUBLIC_APP_URL`.

## 7. Cron jobs

> ⚠️ **Important** : Le plan Vercel Hobby est limité à **1 seul cron par jour**. Pour contourner cette limitation, nous utilisons [cron-job.org](https://cron-job.org) comme alternative gratuite et fiable.

### Configuration via cron-job.org

1. Créez un compte sur [cron-job.org](https://cron-job.org)
2. Configurez les 5 jobs suivants avec l'en-tête `Authorization: Bearer <CRON_SECRET>` :

| Job | URL | Schedule | Description |
|-----|-----|----------|-------------|
| Envoi des campagnes | `/api/cron/send-campaigns` | `0 * * * *` | Toutes les heures |
| Rappels de récompenses | `/api/cron/reward-reminders` | `0 9 * * *` | Tous les jours à 9h00 |
| Réactivation clients inactifs | `/api/cron/reactivate-inactive` | `0 10 * * 1` | Tous les lundis à 10h00 |
| Suggestions IA | `/api/cron/ai-suggestions` | `0 8 * * 1` | Tous les lundis à 8h00 |
| Reset des quotas | `/api/cron/reset-quotas` | `0 0 1 * *` | Le 1er de chaque mois |

3. Pour chaque job, configurez le header : `Authorization: Bearer <CRON_SECRET>`

Pour les instructions détaillées, consultez [CRON_SETUP.md](./CRON_SETUP.md).

## 8. Vérifications post-déploiement

- Authentification Supabase.
- Création d'une organisation et d'un client.
- Paiement Stripe (checkout + webhook).
- Envoi email/SMS + réception des webhooks.
- Exécution d'un cron job.
- Vérification des logs et des métriques.
