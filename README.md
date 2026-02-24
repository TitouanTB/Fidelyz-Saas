# Fidelyz - Customer Loyalty Platform

A modern SaaS platform for managing customer loyalty programs, campaigns, and analytics.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19, Tailwind CSS 4, shadcn/ui
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 7
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **Email**: Resend
- **SMS/WhatsApp**: Twilio
- **AI**: Google Gemini
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── (public)/          # Public pages
│   └── api/               # API routes
├── components/
│   ├── ui/                # Base UI components
│   ├── features/          # Feature-specific components
│   ├── layout/            # Layout components
│   └── providers/         # Context providers
├── hooks/                 # Custom React hooks
├── lib/
│   ├── db/                # Database utilities
│   ├── supabase/          # Supabase client
│   ├── utils.ts           # Utility functions
│   ├── stripe.ts          # Stripe utilities
│   ├── twilio.ts          # Twilio utilities
│   ├── resend.ts          # Email utilities
│   └── ai.ts              # AI utilities
├── store/                 # Zustand stores
└── types/                 # TypeScript types
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Supabase project
- Stripe account
- Twilio account
- Resend account
- Google AI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/fidelyz.git
cd fidelyz
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with your credentials.

5. Set up the database:
```bash
npm run db:generate
npm run db:push
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Create and run migrations |
| `npm run db:studio` | Open Prisma Studio |

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection URL |
| `DIRECT_URL` | Direct PostgreSQL connection URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Twilio phone number |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Default sender email |
| `GOOGLE_AI_API_KEY` | Google AI API key |

## 🎨 Features

### Customer Management
- Customer profiles with loyalty points
- Customer segmentation and tagging
- Visit tracking and purchase history

### Campaign Management
- Email, SMS, and WhatsApp campaigns
- Campaign scheduling and automation
- A/B testing support

### Loyalty Programs
- Points-based rewards
- Tiered membership levels
- Custom badges and achievements

### Analytics
- Real-time dashboards
- Customer insights
- Campaign performance metrics

### AI Features
- Campaign suggestions
- Customer segmentation analysis
- Content generation

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## 📦 Deployment

The project is configured for deployment on Vercel:

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy!

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private project. Please contact the team for contribution guidelines.