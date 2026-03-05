# Fidelyz - Version History

## 1.0.0 (2024-XX-XX)

### Features

- **Parcours Client Visuel** - Nouveau dashboard `/dashboard/parcours` avec :
  - 8 blocs visuels (Scan QR → Activation → Welcome → Rappel J+3 → Visite suivante → Relance J+21 → Récompense → Expiration)
  - Couleurs et icônes distinctives pour chaque étape
  - Statistiques en temps réel
  - Panel de détail en slide-over
  - Preview mockup téléphone
  - API routes pour CRUD, stats, simulation

- **Optimisation Déploiement** :
  - Système de feature flags (services optionnels)
  - Health check endpoint (`/api/health`)
  - Composant ServicesAlert dans le dashboard
  - Dégradation gracieuse dans tous les services :
    - `stripe.ts` - gestion Stripe avec feature flag
    - `twilio.ts` - SMS/WhatsApp avec graceful degradation
    - `resend.ts` - Email avec fallback
    - `ai.ts` - Google Gemini avec graceful degradation
    - `wallet/google.ts` - Google Wallet avec feature flags
  - `.env.example` complet avec tous les feature flags
  - Script `setup.js` pour l'initialisation
  - Amélioration middleware avec security headers
  - `vercel.json` optimisé
  - README mis à jour

### Tech Stack

- Next.js 16 (App Router)
- TypeScript 5 (strict mode)
- Tailwind CSS 4
- shadcn/ui (Radix UI)
- Prisma 7
- Supabase Auth
- Stripe, Resend, Twilio, Google AI
- Zustand, TanStack Query
