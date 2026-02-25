# Checklist de mise en production Fidelyz

## ✅ Préparation

- [ ] La branche à déployer est à jour et validée.
- [ ] Les variables d'environnement sont complètes et vérifiées.
- [ ] Les secrets (`NEXTAUTH_SECRET`, `JWT_SECRET`, `CRON_SECRET`) sont générés et stockés en coffre.
- [ ] Les domaines publics sont définis (app + webhooks).

## ✅ Base de données

- [ ] La base PostgreSQL est provisionnée.
- [ ] `DATABASE_URL` et `DIRECT_URL` pointent vers la production.
- [ ] Les migrations Prisma sont appliquées (`npx prisma migrate deploy`).
- [ ] Les sauvegardes automatiques sont actives.

## ✅ Services externes

- [ ] Supabase : URL, anon key et service role key sont configurées.
- [ ] Stripe : produits/prix créés, clés configurées, webhook actif.
- [ ] Twilio : SID, token, numéros configurés, webhook de statut actif.
- [ ] Resend : domaine validé, API key et webhook actifs.
- [ ] Google AI : clé API configurée.
- [ ] Apple Wallet (si activé) : certificats et clés en place.

## ✅ Configuration applicative

- [ ] `NEXT_PUBLIC_APP_URL` pointe vers le domaine public.
- [ ] `NODE_ENV=production`.
- [ ] Les feature flags correspondent aux services actifs.
- [ ] Les routes cron sont autorisées via `CRON_SECRET`.

## ✅ Build & Déploiement

- [ ] `npm run build` passe en local ou en CI.
- [ ] Les variables d'environnement sont injectées dans Vercel/serveur.
- [ ] Les en-têtes de sécurité sont vérifiés (vercel.json).
- [ ] Le certificat TLS est valide.

## ✅ Tests post-déploiement

- [ ] Connexion/inscription fonctionnelle.
- [ ] Création d'une organisation et d'un client.
- [ ] Envoi d'une campagne email/SMS de test.
- [ ] Webhooks Stripe et messaging reçus correctement.
- [ ] Exécution d'un cron job réussie.
- [ ] Logs d'erreurs et métriques monitorés.

## ✅ Plan de rollback

- [ ] Snapshot de la base disponible.
- [ ] Version précédente déployable rapidement.
- [ ] Procédure de rollback documentée.
