# Fidelyz - Plateforme de fidélité client

Fidelyz est une plateforme SaaS moderne pour gérer les programmes de fidélité, les campagnes marketing et la connaissance client.

## 📚 Documentation

- [Guide de déploiement](./DEPLOYMENT.md)
- [Checklist de mise en production](./CHECKLIST.md)

## 🚀 Stack technique

- **Framework** : Next.js 16 (App Router)
- **Langage** : TypeScript 5 (strict mode)
- **UI** : React 19, Tailwind CSS 4, shadcn/ui (Radix UI)
- **Base de données** : PostgreSQL (Supabase)
- **ORM** : Prisma 7
- **Auth** : Supabase Auth
- **Paiements** : Stripe
- **Email** : Resend
- **SMS/WhatsApp** : Twilio
- **IA** : Google Gemini
- **State** : Zustand
- **Data Fetching** : TanStack Query

## 📁 Structure du projet

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Pages d'authentification
│   ├── (dashboard)/       # Pages du dashboard
│   │   ├── dashboard/     # Page d'accueil
│   │   ├── parcours/      # Parcours client visuel
│   │   ├── customers/     # Gestion clients
│   │   ├── campaigns/     # Campagnes marketing
│   │   ├── messages/      # Messagerie
│   │   ├── analytics/     # Statistiques
│   │   ├── billing/       # Abonnements
│   │   └── settings/      # Configuration
│   ├── (public)/          # Pages publiques
│   │   ├── [slug]/        # Mini-site public
│   │   ├── c/[token]/     # Page client
│   │   ├── p/[slug]/      # Page fidélité
│   │   ├── m/[slug]/      # Menu digital
│   │   └── r/[slug]/      # Page récompenses
│   └── api/               # Routes API
│       ├── health/        # Health check
│       ├── parcours/      # API parcours client
│       ├── cron/          # Tâches cron
│       └── ...
├── components/
│   ├── ui/                # Composants UI shadcn/ui
│   ├── dashboard/         # Composants dashboard
│   └── features/          # Composants métier
├── hooks/                 # Hooks React personnalisés
├── lib/
│   ├── supabase/          # Client Supabase
│   ├── feature-flags.ts   # Feature flags (services optionnels)
│   ├── stripe.ts          # Utilitaires Stripe
│   ├── twilio.ts          # Utilitaires Twilio (SMS/WhatsApp)
│   ├── resend.ts          # Utilitaires email Resend
│   ├── ai.ts              # Utilitaires Google Gemini
│   └── wallet/            # Google/Apple Wallet
├── store/                 # Stores Zustand
├── types/                 # Types TypeScript
└── prisma/                # Schéma de base de données
```

## 🛠️ Démarrage rapide (local)

### Prérequis

- Node.js 18+
- PostgreSQL (Supabase recommandé)
- Comptes : Supabase, Stripe, Twilio, Resend, Google AI

### Installation automatique

```bash
# Cloner le projet
git clone https://github.com/TitouanTB/Fidelyz-Saas.git
cd Fidelyz-Saas

# Lancer le script de configuration
node scripts/setup.js
```

### Installation manuelle

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Configurer les variables d'environnement
# Voir section Configuration ci-dessous

# Générer le client Prisma
npm run db:generate

# Appliquer le schéma à la base de données
npm run db:push

# Démarrer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## ⚙️ Configuration des variables d'environnement

Copiez `.env.example` vers `.env` et configurez les valeurs suivantes :

### Variables obligatoires

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Fidelyz

# Base de données (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Sécurité
NEXTAUTH_SECRET=...
JWT_SECRET=...
CRON_SECRET=...
```

### Services optionnels

Les services suivants sont optionnels. Ils peuvent être désactivés via les **feature flags** :

```env
# Feature Flags (définis dans .env.example)
ENABLE_SMS=true              # Désactiver: false
ENABLE_WHATSAPP=true         # Désactiver: false
ENABLE_EMAIL=true            # Désactiver: false
ENABLE_WALLET=true           # Désactiver: false
ENABLE_GOOGLE_WALLET=true    # Désactiver: false
ENABLE_AI_SUGGESTIONS=true   # Désactiver: false
ENABLE_BILLING=true          # Désactiver: false
```

#### Stripe (Paiements)

```env
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...
```

#### Resend (Email)

```env
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@votre-domaine.com
```

#### Twilio (SMS/WhatsApp)

```env
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+33...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

#### Google AI (Gemini)

```env
GOOGLE_AI_API_KEY=AIza...
```

#### Google Wallet

```env
GOOGLE_WALLET_ISSUER_ID=...
GOOGLE_WALLET_CLASS_ID=...
GOOGLE_WALLET_SERVICE_ACCOUNT_KEY='{...}'
```

### Vérification de la santé des services

Accédez à `/api/health` pour voir l'état de tous les services. Cette endpoint retourne :

- Statut global (healthy/degraded/unhealthy)
- État de la base de données
- État des services optionnels
- Feature flags actifs

## 📦 Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Démarre le serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Démarre le serveur de production |
| `npm run lint` | Linting ESLint |
| `npm test` | Tests unitaires |
| `npm run test:watch` | Tests en mode watch |
| `npm run db:generate` | Génère le client Prisma |
| `npm run db:push` | Pousse le schéma dans la base |
| `npm run db:migrate` | Crée et applique les migrations |
| `npm run db:studio` | Ouvre Prisma Studio |
| `npm run e2e` | Tests end-to-end avec Playwright |

## 🎯 Fonctionnalités principales

### Gestion des clients

- Import/export CSV
- Programme de fidélité par points/visites
- Tiers (Bronze, Silver, Gold, Platinum)
- Tags et segmentation
- Pages personnelles client

### Parcours client visuel

Dashboard `/dashboard/parcours` affichant les 8 étapes du parcours :
1. Scan QR Code
2. Activation du compte
3. Message de bienvenue
4. Rappel J+3
5. Visite suivante
6. Relance J+21
7. Récompense
8. Expiration

Chaque étape dispose de :
- Couleur/icône distinctive
- Statistiques en temps réel
- Panel de détail en slide-over
- Aperçu mobile mockup
- Fonctionnalités de simulation et test

### Campagnes marketing

- Campagnes one-time, automatisées, récurrentes
- Multi-canaux : Email, SMS, WhatsApp, Push, Wallet
- Segmentation par tags, tiers, points, visites
- Planification et automatique
- Statistiques détaillées

### Messages

- Envoi multi-canaux avec fallback automatique
- Modèles personnalisables
- Statut de livraison en temps réel
- Retry automatique sur échec

### Analytics

- Tableaux de bord statistiques
- Événements de parcours client
- Export CSV/Excel
- Métriques de conversion

### Feature Flags & Dégradation gracieuse

Le système de feature flags permet une dégradation gracieuse :

- Services optionnels désactivables sans casser l'app
- Health check endpoint pour surveiller les services
- Composant `ServicesAlert` dans le dashboard
- Toutes les libs (stripe, twilio, resend, ai, wallet) gèrent l'indisponibilité

## 🚢 Déploiement

Le projet est prêt pour Vercel et un hébergement Node classique.

### Vercel (recommandé)

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement dans Vercel
3. Le déploiement est automatique

### Vérifications avant production

1. ✅ Feature flags configurés selon vos besoins
2. ✅ Services optionnels activés/configurés
3. ✅ Health check retourne "healthy"
4. ✅ Tests unitaires passent
5. ✅ Build production réussit
6. ✅ Checklist de mise en production complétée

Consultez le [guide de déploiement](./DEPLOYMENT.md) pour les étapes détaillées et la [checklist](./CHECKLIST.md).

## 📄 Licence

Ce projet est propriétaire. Tous droits réservés.
