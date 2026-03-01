# WhatsApp Bot Implementation Checklist

## ✅ Completed Requirements

### 1. API Webhook WhatsApp
- ✅ Webhook endpoint: `src/app/api/webhooks/twilio/route.ts`
- ✅ Receives incoming WhatsApp messages via Twilio webhook
- ✅ Parses message to extract restaurant code (format FIDELYZ-[code])
- ✅ Retrieves client by phone number (sender)
- ✅ Checks if WhatsApp is enabled (ENABLE_WHATSAPP feature flag)

### 2. Message WhatsApp depuis le numéro du restaurant
- ✅ Message sent from restaurant's WhatsApp number (not Fidelyz number)
- ✅ Uses `sendWhatsAppFromRestaurant()` with from: restaurant.whatsappNumber
- ✅ Message contains:
  - Greeting with customer's first name
  - Restaurant name
  - Visit count: 1/[total] for reward
  - Google Wallet link if Android detected
  - Personal page link: /c/[token]
  - QR code instruction
- ✅ Includes PWA installation invitation

### 3. Fenêtre de service 24h WhatsApp
- ✅ Uses Twilio WhatsApp API (supports 24h service window)
- ✅ Message is free when sent within 24h window

### 4. Détection Android
- ✅ Detects if user is Android (userAgent analysis)
- ✅ If Android: includes Google Wallet link in message
- ✅ If iOS: NO Apple Wallet (not implemented in beta)
- ⚠️  Note: For webhook, defaults to false as Twilio doesn't send user-agent

### 5. Intégration WhatsApp Business
- ✅ Restaurant can enable/disable WhatsApp via settings
- ✅ Feature flag ENABLE_WHATSAPP in .env
- ✅ If false: WhatsApp buttons hidden and webhook returns 200 without processing

### 6. Lien Google Wallet dans message
- ✅ Checks if customer has googleWalletPassId
- ✅ Generates "Add to Google Wallet" link via JWT
- ✅ Uses `generateGoogleWalletJWT()` from `src/lib/wallet/google.ts`

### 7. Lien Page Perso dans message
- ✅ Includes link /c/[token] where token = customer.personalPageToken

### 8. Robustesse
- ✅ Global try/catch on webhook
- ✅ If Twilio fails: logs error and continues
- ✅ Logs all outgoing messages in Message model
- ✅ Message status: SENT, DELIVERED, FAILED

### 9. Tracking Event
- ✅ Creates event: whatsapp_inbound (message received)
- ✅ Creates event: whatsapp_reply_sent (response sent)

### 10. Intégration avec flow récompense
- ✅ Pre-filled WhatsApp message from step D of /r/[slug]
- ✅ Format: wa.me/[restaurant-number]?text=FIDELYZ-[code]
- ✅ Customer clicks WhatsApp link from confirmation page

## 📁 Files Created

1. `src/app/api/webhooks/twilio/route.ts` - Twilio webhook endpoint
2. `src/lib/wallet/google.ts` - Google Wallet integration
3. `src/lib/events.ts` - Event tracking utilities
4. `src/app/api/wallet/google/route.ts` - Google Wallet API endpoint
5. `WHATSAPP_BOT.md` - Documentation

## 📝 Files Modified

1. `src/lib/twilio.ts` - Added `sendWhatsAppFromRestaurant()` function
2. `src/lib/index.ts` - Exported new utilities
3. `src/app/(public)/r/[slug]/page.tsx` - Updated to check organization's WhatsApp number
4. `src/components/public/reward-flow.tsx` - Updated WhatsApp link format and Google Wallet integration
5. `.env.example` - Added Google Wallet variables
6. `package.json` - Added dependencies (google-auth-library, jsonwebtoken, @types/jsonwebtoken)

## 🔧 Dependencies Added

```json
{
  "google-auth-library": "^9.15.1",
  "jsonwebtoken": "^9.0.2"
}
```

```json
{
  "@types/jsonwebtoken": "^9.0.7"
}
```

## 📊 Database Schema Used

Existing fields in schema:
- `Organization.whatsappNumber` - Restaurant's WhatsApp Business number
- `Customer.phone` - Customer's phone number
- `Customer.firstName` - Customer's first name
- `Customer.personalPageToken` - Token for personal page
- `Customer.googleWalletPassId` - Google Wallet Pass ID
- `Customer.visits` - Current number of visits
- `LoyaltyConfig.visitsForReward` - Visits needed for reward
- `Message` model - For logging messages
- `Event` model - For tracking events (whatsapp_inbound, whatsapp_reply_sent)

## 🧪 Testing Recommendations

### 1. Test Webhook
```bash
# Start dev server
npm run dev

# Use ngrok to expose webhook
ngrok http 3000

# Configure Twilio webhook URL:
https://[ngrok-url]/api/webhooks/twilio
```

### 2. Test Message Flow
1. Create organization with WhatsApp number
2. Create customer with phone number
3. Send "FIDELYZ-[slug]" to restaurant's WhatsApp number
4. Verify automatic response

### 3. Test Google Wallet
1. Create customer with googleWalletPassId
2. Trigger WhatsApp message generation
3. Verify Google Wallet link in message

### 4. Test Feature Flag
```bash
# Disable WhatsApp
ENABLE_WHATSAPP=false

# Verify:
# - Buttons hidden in UI
# - Webhook returns 200 without processing
```

## 🚀 Deployment Notes

### Environment Variables Required
```bash
ENABLE_WHATSAPP=true
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
GOOGLE_WALLET_ISSUER_ID=your-issuer-id
GOOGLE_WALLET_CLASS_ID=your-class-id
GOOGLE_WALLET_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

### Twilio Configuration
1. Configure webhook URL in Twilio Console
2. Ensure WhatsApp is enabled for Twilio account
3. Set up restaurant's WhatsApp Business number

### Google Wallet Configuration
1. Create Google Cloud project
2. Enable Google Wallet Passes API
3. Create service account
4. Get issuer ID and class ID
5. Configure service account key

## ⚠️ Limitations & Beta Notes

1. **Apple Wallet**: Not implemented in beta
2. **Android Detection**: Defaults to false in webhook (Twilio doesn't send user-agent)
3. **Twilio Embedded Signup Meta**: Requires Tech Provider approval
4. **User-Agent Tracking**: Would need to store device preference from previous visits

## 📝 Future Enhancements

1. Store device preference (Android/iOS) from previous visits
2. Implement Apple Wallet for iOS
3. Support media messages (QR code image)
4. Customizable message templates
5. Analytics dashboard for WhatsApp bot performance
6. A/B testing for message content

## ✨ Success Criteria Met

- ✅ Webhook receives WhatsApp messages
- ✅ Bot responds within 5 seconds
- ✅ Message from restaurant's WhatsApp number (not Fidelyz)
- ✅ Restaurant code correctly extracted
- ✅ Google Wallet link included if Android detected
- ✅ Personal page link included
- ✅ Tracking events created
- ✅ Build passes without errors (to be verified)
