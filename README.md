# Fidelyz - Plateforme de fidélité client

Fidelyz est une plateforme SaaS moderne pour gérer les programmes de fidélité, les campagnes marketing et la connaissance client.

## 📚 Documentation

- [Guide de déploiement](./DEPLOYMENT.md)
- [Checklist de mise en production](./CHECKLIST.md)

## 🚀 Stack technique

- **Framework** : Next.js 16 (App Router)
- **Langage** : TypeScript 5
- **UI** : React 19, Tailwind CSS 4, shadcn/ui
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
│   ├── (public)/          # Pages publiques
│   └── api/               # Routes API
├── components/
│   ├── ui/                # Composants UI de base
│   ├── features/          # Composants métiers
│   ├── layout/            # Composants de layout
│   └── providers/         # Providers
├── hooks/                 # Hooks personnalisés
├── lib/
│   ├── db/                # Utilitaires base de données
│   ├── supabase/          # Client Supabase
│   ├── stripe.ts          # Utilitaires Stripe
│   ├── twilio.ts          # Utilitaires Twilio
│   ├── resend.ts          # Utilitaires email
│   └── ai.ts              # Utilitaires IA
├── store/                 # Stores Zustand
└── types/                 # Types TypeScript
```

## 🛠️ Démarrage rapide (local)

### Prérequis

- Node.js 18+
- PostgreSQL (Supabase recommandé)
- Comptes : Supabase, Stripe, Twilio, Resend, Google AI

### Installation

```bash
git clone https://github.com/your-org/fidelyz.git
cd fidelyz
npm install
cp .env.example .env
```

Renseignez le fichier `.env` puis lancez la base de données :

```bash
npm run db:generate
npm run db:push
```

Lancez le serveur de développement :

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## 🔐 Configuration des variables d'environnement

Les variables sont listées dans `.env.example`. Les valeurs obligatoires sont détaillées dans le [guide de déploiement](./DEPLOYMENT.md).

## 📜 Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Démarre le serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Démarre le serveur de production |
| `npm run lint` | Linting ESLint |
| `npm run test` | Tests unitaires |
| `npm run test:watch` | Tests en mode watch |
| `npm run db:generate` | Génère le client Prisma |
| `npm run db:push` | Pousse le schéma dans la base |
| `npm run db:migrate` | Crée et applique les migrations |
| `npm run db:studio` | Ouvre Prisma Studio |

## 📦 Déploiement

Le projet est prêt pour Vercel et un hébergement Node classique. Consultez le [guide de déploiement](./DEPLOYMENT.md) pour les étapes détaillées et la [checklist](./CHECKLIST.md) avant mise en production.

## 📄 Licence

Ce projet est propriétaire. Tous droits réservés.
