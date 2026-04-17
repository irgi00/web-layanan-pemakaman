# MemorialCare - Digital Burial Service Platform

A comprehensive digital platform for booking cemetery plots and arranging final resting places with dignity and compassion.

## 🎯 Project Overview

MemorialCare is a full-stack Next.js application that connects families with cemetery services. It provides:

- **Cemetery Discovery**: Browse and search available cemeteries with detailed information and real-time plot availability
- **Plot Booking**: Reserve burial plots with an intuitive booking interface
- **Service Management**: Select additional services (transportation, ceremonies, monuments, maintenance)
- **Payment Processing**: Secure checkout and payment handling
- **User Dashboard**: Manage bookings, deceased profiles, and payment history
- **Admin Dashboard**: Cemetery management tools for administrators

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 16 with React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui components with Radix UI
- **Backend**: Next.js API Routes with Node.js
- **Database**: PostgreSQL with Neon serverless
- **ORM**: Prisma
- **Authentication**: JWT-based with bcrypt password hashing
- **Payments**: Stripe integration (setup ready)
- **Maps**: Google Maps API (setup ready)

### Database Schema

The application uses 10 core entities:

1. **Users**: System users with roles (CUSTOMER, CEMETERY_ADMIN, SUPER_ADMIN)
2. **Cemeteries**: Cemetery locations with availability tracking
3. **Plots**: Individual burial plots within cemeteries
4. **Bookings**: User bookings linking users to plots and deceased profiles
5. **DeceasedProfiles**: Information about the deceased person
6. **Services**: Available additional services (transportation, ceremonies, etc.)
7. **ServiceBookings**: Junction table for services added to bookings
8. **Payments**: Payment records and status tracking
9. **Notifications**: User notifications for booking updates and reminders
10. **AuditLogs**: Complete audit trail of all system actions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (using pnpm as package manager)
- PostgreSQL database (Neon account recommended)
- Environment variables configured

### Installation

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment variables** in `.env.local`:
   ```
   DATABASE_URL="postgresql://user:password@host/database"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_stripe_key"
   STRIPE_SECRET_KEY="your_stripe_secret"
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_maps_api_key"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-change-in-production"
   ```

3. **Run database migrations**:
   ```bash
   pnpm exec prisma db push
   ```

4. **Seed sample data** (optional):
   ```bash
   pnpm exec prisma db seed
   ```

5. **Start development server**:
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
app/
├── api/                          # Backend API routes
│   ├── auth/                    # Authentication endpoints
│   │   ├── register/route.ts    # User registration
│   │   ├── login/route.ts       # User login
│   │   ├── logout/route.ts      # User logout
│   │   └── me/route.ts          # Get current user
│   ├── cemeteries/              # Cemetery endpoints
│   │   ├── route.ts             # List all cemeteries
│   │   └── [id]/route.ts        # Get cemetery details
│   ├── bookings/                # Booking endpoints
│   │   └── route.ts             # Create bookings
│   └── payments/                # Payment endpoints
│       ├── checkout/route.ts    # Initialize checkout
│       └── [id]/route.ts        # Payment status
├── page.tsx                      # Home page
├── cemeteries/
│   ├── page.tsx                 # Cemetery listing page
│   └── [id]/                    # Cemetery detail page (to be created)
├── dashboard/
│   └── page.tsx                 # User dashboard
├── login/
│   └── page.tsx                 # Login page
├── register/
│   └── page.tsx                 # Registration page
├── layout.tsx                    # Root layout
└── globals.css                   # Global styles

components/
├── header.tsx                    # Navigation header
├── ui/                          # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── skeleton.tsx
│   └── ...

lib/
├── prisma.ts                    # Prisma client singleton
├── auth.ts                      # Password hashing utilities
├── jwt.ts                       # JWT token management
└── utils.ts                     # Utility functions

prisma/
├── schema.prisma                # Database schema definition
└── seed.ts                      # Sample data seeding

scripts/
└── setup-db.sh                  # Database setup script
```

## 🔐 Authentication

The application uses JWT-based authentication:

- **Registration**: POST `/api/auth/register` - Create new user account
- **Login**: POST `/api/auth/login` - Authenticate and receive JWT token
- **Logout**: POST `/api/auth/logout` - Clear authentication
- **Current User**: GET `/api/auth/me` - Get authenticated user info

Tokens are stored in HTTP-only cookies for security and expire after 7 days.

## 📚 API Endpoints

### Cemeteries
- `GET /api/cemeteries` - List all cemeteries (paginated)
- `GET /api/cemeteries/:id` - Get cemetery details with plots and services

### Bookings
- `POST /api/bookings` - Create new booking (requires auth)

### Payments
- `POST /api/payments/checkout` - Initialize payment session
- `GET /api/payments/:id` - Get payment status
- `POST /api/payments/:id` - Process payment

## 🎨 Design System

The application uses a compassionate, respectful color scheme:

- **Primary Color**: Soft green (`oklch(0.55 0.15 142)`) - represents peace and nature
- **Accent Color**: Muted teal (`oklch(0.65 0.12 155)`) - complements primary
- **Backgrounds**: Warm off-whites and soft grays
- **Typography**: Geist font family for clean, readable interface

## 📱 Responsive Design

The application is fully responsive with breakpoints at:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔄 Next Steps - Features to Complete

### Phase 2 - Cemetery Detail Pages
- Individual cemetery detail page with map integration
- Plot selection interface with visual cemetery layout
- Available services display and selection

### Phase 3 - Booking Flow
- Deceased profile creation during checkout
- Service selection with pricing
- Multi-step booking confirmation

### Phase 4 - Admin Dashboard
- Cemetery management interface
- Plot inventory management
- Booking administration
- Analytics and reporting

### Phase 5 - Notifications & Integrations
- Email notification system
- Booking confirmation emails
- SMS reminders for upcoming dates
- Stripe webhook handling for payments
- Admin alerts for new bookings

### Phase 6 - Advanced Features
- Review and rating system
- Deceased memorial profile pages
- Photo gallery for monuments
- Integration with obituary services
- Accessibility audit and optimization

## 🧪 Testing

The project includes seed data for testing. Default credentials:
- **Admin**: admin@peacefulrest.com / admin123
- **Customer**: customer@example.com / customer123

## 🔒 Security Considerations

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens with 7-day expiration
- ✅ HTTP-only cookies for token storage
- ✅ SQL injection protection via Prisma
- ✅ CSRF protection with secure cookies
- ⏳ Row-level security (RLS) to implement for multi-tenancy
- ⏳ Rate limiting for API endpoints
- ⏳ Input validation and sanitization middleware

## 📊 Performance Optimization

- Server-side rendering for SEO
- Incremental Static Regeneration (ISR) for cemetery listings
- Image optimization with next/image
- CSS-in-JS with Tailwind CSS
- Component code splitting and lazy loading ready

## 🤝 Contributing

Guidelines for extending the application:

1. Follow the existing file structure and naming conventions
2. Use TypeScript for type safety
3. Keep components small and single-responsibility
4. Add tests for new API routes
5. Update documentation for new features

## 📝 License

This project is built for MemorialCare and follows appropriate licensing.

## 🆘 Support

For issues or questions:
- Check the FAQ page
- Contact support via the website
- Create an issue in the repository

---

**Note**: This is a development version. Before production deployment:
- Add environment-specific configurations
- Set up proper error logging and monitoring
- Configure Stripe production keys
- Implement comprehensive testing
- Add email service integration (SendGrid, AWS SES, etc.)
- Set up database backups and disaster recovery
- Configure CDN for static assets
- Add security headers and CSP policies
