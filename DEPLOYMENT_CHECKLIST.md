# DEPLOYMENT_CHECKLIST.md

## Checklist de déploiement Fidelyz - Ordre d'exécution obligatoire

Ce fichier contient la checklist opérationnelle à suivre pour déployer l'application Fidelyz en production.

---

## 1. Variables OBLIGATOIRES (Supabase)

Ces variables sont indispensables au fonctionnement de l'application :

| Variable | Description | Où la trouver |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | Dashboard Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon publique | Dashboard Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (admin) | Dashboard Supabase → Settings → API (⚠️ ne pas exposer côté client) |
| `DATABASE_URL` | URL de connexion PostgreSQL | Dashboard Supabase → Settings → Database → Connection string |
| `DIRECT_URL` | URL directe PostgreSQL (pour Prisma) | Même que DATABASE_URL ou URL interne Supabase |

**Configuration Supabase :**
1. Créer un projet sur [supabase.com](https://supabase.com)
2. Aller dans Settings → API
3. Copy l'URL du projet et les clés
4. Dans Settings → Database, récupérer les informations de connexion

---

## 2. Variables OPTIONNELLES

### 2.1 Resend (Emails transactionnels)

| Variable | Description | Où la trouver |
|----------|-------------|---------------|
| `RESEND_API_KEY` | Clé API Resend | Dashboard Resend → API Keys |
| `EMAIL_FROM` | Email expéditeur | Format: `nom@domaine.com` |

**Configuration :**
1. Créer un compte sur [resend.com](https://resend.com)
2. Ajouter et valider un domaine expéditeur
3. Configurer SPF/DKIM pour le domaine

---

### 2.2 Twilio (SMS/WhatsApp)

| Variable | Description | Où la trouver |
|----------|-------------|---------------|
| `TWILIO_ACCOUNT_SID` | SID du compte Twilio | Console Twilio → Dashboard |
| `TWILIO_AUTH_TOKEN` | Token d'authentification | Console Twilio → Dashboard |
| `TWILIO_PHONE_NUMBER` | Numéro.twilio utilisé | Console Twilio → Phone Numbers |
| `TWILIO_WHATSAPP_NUMBER` | Numéro WhatsApp Sender | Console Twilio → WhatsApp |

**Configuration :**
1. Créer un compte sur [twilio.com](https://twilio.com)
2. Acheter un numéro de téléphone
3. Configurer le numéro expéditeur SMS et WhatsApp

---

### 2.3 Stripe (Paiements)

| Variable | Description | Où la trouver |
|----------|-------------|---------------|
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | Dashboard Stripe → Developers → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clé publique | Dashboard Stripe → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Secret pour les webhooks | Dashboard Stripe → Webhooks |
| `STRIPE_PRICE_ID_STARTER` | ID du prix Starter | Dashboard Stripe → Products |
| `STRIPE_PRICE_ID_PRO` | ID du prix Pro | Dashboard Stripe → Products |
| `STRIPE_PRICE_ID_ENTERPRISE` | ID du prix Enterprise | Dashboard Stripe → Products |

**Configuration :**
1. Créer un compte sur [stripe.com](https://stripe.com)
2. Créer 3 produits (Starter, Pro, Enterprise)
3. Récupérer les Price ID de chaque produit
4. Configurer le webhook sur `https://votre-domaine/api/billing/webhook`

---

### 2.4 Google AI (Gemini)

| Variable | Description | Où la trouver |
|----------|-------------|---------------|
| `GOOGLE_AI_API_KEY` | Clé API Google AI Studio | [aistudio.google.com](https://aistudio.google.com/app/apikey) |

---

### 2.5 Google Wallet (Cartes de fidélité numériques)

| Variable | Description |
|----------|-------------|
| `GOOGLE_WALLET_ISSUER_ID` | ID de l'émetteur (Google Pay Business) |
| `GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL` | Email du compte de service |
| `GOOGLE_WALLET_PRIVATE_KEY` | Clé privée RSA |

**Note :** Cette fonctionnalité est optionnelle et nécessite un compte Google Pay Merchant vérifié.

---

## 3. Instructions VERCEL

### 3.1 Import du projet

1. Se connecter à [vercel.com](https://vercel.com)
2. Cliquer "Add New..." → "Project"
3. Importer le dépôt GitHub `TitouanTB/Fidelyz-Saas`

### 3.2 Configuration du build

Vérifier que les paramètres suivants sont corrects :

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Build Command | `npm run build` |
| Install Command | `npm install` |
| Output Directory | `.next` (automatique) |

### 3.3 Variables d'environnement Vercel

Ajouter toutes les variables dans l'interface Vercel (Settings → Environment Variables) :

**Variables obligatoires à configurer en premier :**
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...
DIRECT_URL=...
```

**Puis les variables optionnelles selon les services activés :**
```
RESEND_API_KEY=...
EMAIL_FROM=...

TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
TWILIO_WHATSAPP_NUMBER=...

STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_ID_STARTER=...
STRIPE_PRICE_ID_PRO=...
STRIPE_PRICE_ID_ENTERPRISE=...

GOOGLE_AI_API_KEY=...

NEXT_PUBLIC_APP_URL=https://votre-projet.vercel.app
NEXTAUTH_SECRET=... (générer avec: openssl rand -base64 32)
JWT_SECRET=...
CRON_SECRET=...
```

### 3.4 Déploiement

1. Cliquer "Deploy"
2. Attendre la fin du build
3. Vérifier que le déploiement est réussi

---

## 4. CHECKLIST FINALE

Cocher chaque élément après vérification :

### 4.1 Configuration Supabase
- [ ] Projet Supabase créé
- [ ] Tables et politiques RLS configurées
- [ ] Variables d'environnement ajoutées sur Vercel

### 4.2 Variables d'environnement
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configuré
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configuré
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configuré
- [ ] `DATABASE_URL` configuré
- [ ] `DIRECT_URL` configuré

### 4.3 Services optionnels activés
- [ ] Resend : `RESEND_API_KEY` + `EMAIL_FROM` configurés (si utilisé)
- [ ] Twilio : `TWILIO_*` configurés (si SMS/WhatsApp utilisé)
- [ ] Stripe : `STRIPE_*` configurés (si paiements utilisé)
- [ ] Google AI : `GOOGLE_AI_API_KEY` configuré (si suggestions IA utilisé)
- [ ] Google Wallet : variables configurées (si Wallet utilisé)

### 4.4 Déploiement Vercel
- [ ] Projet importé sur Vercel
- [ ] Build réussi
- [ ] Application accessible via l'URL Vercel

### 4.5 Configuration des Cron Jobs (⚠️ Important)

> **Note** : Le plan Vercel Hobby est limité à **1 seul cron par jour**. Nous utilisons [cron-job.org](https://cron-job.org) comme alternative gratuite.

- [ ] Variable `CRON_SECRET` configurée
- [ ] Compte créé sur [cron-job.org](https://cron-job.org)
- [ ] 5 jobs cron configurés (voir [CRON_SETUP.md](./CRON_SETUP.md) pour les détails)
  - [ ] `/api/cron/send-campaigns` (toutes les heures)
  - [ ] `/api/cron/reward-reminders` (tous les jours à 9h)
  - [ ] `/api/cron/reactivate-inactive` (tous les lundis à 10h)
  - [ ] `/api/cron/ai-suggestions` (tous les lundis à 8h)
  - [ ] `/api/cron/reset-quotas` (1er du mois)
- [ ] Header `Authorization: Bearer <CRON_SECRET>` configuré pour chaque job

### 4.6 Vérifications post-déploiement
- [ ] Page d'accueil charge correctement
- [ ] Inscription/connexion utilisateur fonctionne
- [ ] Authentification Supabase fonctionnelle
- [ ] Création d'organisation et client fonctionnelle
- [ ] Webhooks Stripe respondsant (si configuré)
- [ ] Envoi d'emails fonctionne (si Resend configuré)
- [ ] Envoi de SMS fonctionne (si Twilio configuré)
- [ ] Cron jobs testés avec `curl` (voir [CRON_SETUP.md](./CRON_SETUP.md))

### 4.7 Sécurité
- [ ] `NEXTAUTH_SECRET` généré et configuré
- [ ] `JWT_SECRET` généré et configuré
- [ ] `CRON_SECRET` configuré (pour les routes cron)
- [ ] Clés API pas exposées côté client (utiliser NEXT_PUBLIC_ uniquement pour les clés publiques)

---

## Commandes utiles

```bash
# Générer un secret aléatoire
openssl rand -base64 32

# Tester la connexion à la base de données
npx prisma db execute --sql "SELECT 1"

# Vérifier les variables d'environnement manquantes
cat .env.example
```

---

Dernière mise à jour : Mars 2025
