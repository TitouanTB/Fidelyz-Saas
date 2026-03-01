# WhatsApp Bot Automatique - Documentation

## Overview

Le WhatsApp Bot répond automatiquement aux clients qui scannent un QR code et envoient un message pré-rempli depuis le numéro WhatsApp du restaurant.

## Architecture

### Flow

1. **Scénario QR Code** → Client scanne le QR code du restaurant
2. **Flow Récompense** → Client complète le flow de récompense (/r/[slug])
3. **Étape Confirmation** → Client clique sur "Activer ma carte sur WhatsApp"
4. **Message WhatsApp** → Ouvre WhatsApp avec message pré-rempli: `FIDELYZ-[slug]`
5. **Envoi Message** → Client envoie le message au numéro WhatsApp du restaurant
6. **Webhook Twilio** → `/api/webhooks/twilio` reçoit le message
7. **Bot Répond** → Bot répond automatiquement avec les informations de carte de fidélité

## Configuration

### Variables d'environnement

```bash
# Activer/désactiver WhatsApp
ENABLE_WHATSAPP=true

# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Google Wallet (optionnel, pour les utilisateurs Android)
GOOGLE_WALLET_ISSUER_ID=your-issuer-id
GOOGLE_WALLET_CLASS_ID=your-class-id
GOOGLE_WALLET_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

### Base de données

Le numéro WhatsApp du restaurant doit être configuré dans la table `organizations`:

```sql
UPDATE organizations
SET whatsapp_number = '+33123456789'
WHERE slug = 'restaurant-slug';
```

## Webhook Twilio

### Endpoint

```
POST /api/webhooks/twilio
```

### Format du message entrant

Le client doit envoyer un message avec le format suivant:

```
FIDELYZ-[restaurant-slug]
```

Exemple: `FIDELYZ-bistro-paris`

### Réponse automatique

Le bot envoie une réponse contenant:

```
Bonjour [Prénom] ! 🎉

Votre carte de fidélité [Restaurant] est prête.

🏆 Visites : 1/[total] pour votre récompense
📱 Votre carte : [lien Google Wallet si Android détecté]
🔗 Votre espace : [lien /c/[token]]

Montrez ce QR code en caisse à chaque visite !

💡 Installez notre application pour accéder à toutes vos fonctionnalités : [URL]
```

## Fonctionnalités

### 1. Détection de restaurant

- Le bot extrait le code restaurant du message (format FIDELYZ-[slug])
- Retrouve l'organisation correspondante dans la base de données

### 2. Identification du client

- Le bot retrouve le client par son numéro de téléphone
- Le numéro de téléphone est celui du sender Twilio (format whatsapp:+XXX)

### 3. Message depuis le restaurant

- Le message part du **numéro WhatsApp Business du restaurant**
- Utilisation de `sendWhatsAppFromRestaurant()` dans `src/lib/twilio.ts`
- Le `from` est `whatsapp:[restaurant-whatsapp-number]`

### 4. Fenêtre de service 24h

- Le message est gratuit dans la fenêtre de service 24h
- Utilise l'API Twilio WhatsApp (supporté par Twilio Embedded Signup Meta)

### 5. Détection Android

- Si le client a un `googleWalletPassId` et est détecté comme Android
- Le lien Google Wallet est inclus dans le message
- Pour iOS: Apple Wallet n'est PAS inclus (non implémenté en bêta)

### 6. Tracking Events

- **whatsapp_inbound**: Message WhatsApp reçu
- **whatsapp_reply_sent**: Réponse WhatsApp envoyée

Les events incluent:
- Message ID Twilio
- Numéro du client
- Code restaurant
- Métadonnées (Android, Google Wallet link, etc.)

### 7. Message Logging

Tous les messages sortants sont loggés dans la table `messages`:

```typescript
{
  organizationId: string,
  customerId: string,
  channel: "WHATSAPP",
  status: "SENT" | "DELIVERED" | "FAILED",
  externalId: string, // Twilio SID
  metadata: {
    trigger: "whatsapp_bot",
    messageSid: string,
    isAndroid: boolean,
    includeGoogleWalletLink: boolean,
    googleWalletLink: string
  }
}
```

## Robustesse

### Feature Flag

Si `ENABLE_WHATSAPP=false`:
- Les boutons WhatsApp sont masqués dans l'UI
- Le webhook retourne 200 sans traitement
- Aucun message n'est envoyé

### Error Handling

- Try/catch global sur le webhook
- Si Twilio échoue: log l'erreur mais continue
- Retourne toujours 200 à Twilio pour éviter les retries

### Validation

- Vérifie que le restaurant a un numéro WhatsApp configuré
- Vérifie que le client existe
- Nettoie les numéros de téléphone pour la comparaison

## Integration avec Flow Récompense

### Lien WhatsApp dans l'étape D

```typescript
const message = encodeURIComponent(`FIDELYZ-${organization.slug}`);
const cleanWhatsAppNumber = organization.whatsappNumber.replace(/\D/g, "");
window.open(`https://wa.me/${cleanWhatsAppNumber}?text=${message}`, "_blank");
```

Ce lien ouvre WhatsApp avec le message pré-rempli que le client doit envoyer.

## Google Wallet

### Génération du lien

Le bot peut générer un lien "Add to Google Wallet" via JWT:

```typescript
const result = await generateGoogleWalletJWT(organizationId, customerId);
// Returns: { success: true, url: string, jwt: string }
```

### Intégration

- Si le client a un `googleWalletPassId`
- Et si Android est détecté (via user-agent)
- Le lien est inclus dans le message WhatsApp

## Testing

### Tester le webhook localement

Utiliser ngrok pour exposer le webhook:

```bash
ngrok http 3000
```

Configurer l'URL Twilio webhook:
```
https://[ngrok-url]/api/webhooks/twilio
```

### Tester le bot

1. Créer un restaurant avec un numéro WhatsApp
2. Créer un client avec le même numéro de téléphone
3. Envoyer `FIDELYZ-[slug]` au numéro WhatsApp du restaurant
4. Vérifier la réponse automatique

### Logs

Les logs sont disponibles dans:
- Console Node.js (`console.log`)
- Base de données (table `messages`)
- Base de données (table `events`)

## Limitations

### Bêta

- Apple Wallet non implémenté (iOS)
- Détection Android basique (via metadata, pas user-agent réel)
- Twilio Embedded Signup Meta nécessite l'approbation Tech Provider

### Future

- Améliorer la détection de device (stocker user-agent lors de la visite)
- Implémenter Apple Wallet pour iOS
- Supporter les messages avec media (QR code image)
- Ajouter des templates de message personnalisables

## Sécurité

- Le webhook ne nécessite pas d'authentification (Twilio utilise des signatures)
- Les numéros de téléphone sont normalisés avant comparaison
- Les messages sont loggés pour audit

## Dépendances

- `twilio`: Client Twilio
- `@prisma/client`: ORM pour la base de données
- `google-auth-library`: Pour signer les JWT Google Wallet
- `jsonwebtoken`: Pour générer les JWT
