# MemorialCare - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
pnpm install
```

### Step 2: Configure Database
Update `.env.local` with your Neon PostgreSQL connection:
```env
DATABASE_URL="postgresql://user:password@host/database"
```

### Step 3: Set Up Database
```bash
# Create tables and schema
pnpm exec prisma db push

# Seed sample data
pnpm exec prisma db seed
```

### Step 4: Start Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Test the Application

### Sample Credentials

**Customer Account:**
- Email: `customer@example.com`
- Password: `customer123`

**Admin Account:**
- Email: `admin@peacefulrest.com`
- Password: `admin123`

### Test Flows

1. **Customer Flow**
   - Visit home page
   - Browse cemeteries at `/cemeteries`
   - Register or login at `/register` or `/login`
   - Create a booking
   - View dashboard at `/dashboard`

2. **Admin Flow**
   - Login with admin credentials
   - Access admin dashboard at `/admin/dashboard`
   - Manage plots and bookings
   - View analytics

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database design |
| `app/api/` | Backend API endpoints |
| `app/page.tsx` | Home page |
| `app/cemeteries/` | Cemetery browsing |
| `app/dashboard/` | Customer dashboard |
| `app/admin/dashboard/` | Admin interface |
| `lib/email-service.ts` | Email notifications |
| `components/header.tsx` | Navigation |

---

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL=

# Stripe (optional - for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=

# Google Maps (optional - for location features)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key
```

---

## 🌐 API Endpoints

| Method | Endpoint | Auth Required |
|--------|----------|----------------|
| POST | `/api/auth/register` | No |
| POST | `/api/auth/login` | No |
| POST | `/api/auth/logout` | Yes |
| GET | `/api/auth/me` | Yes |
| GET | `/api/cemeteries` | No |
| GET | `/api/cemeteries/:id` | No |
| POST | `/api/bookings` | Yes |
| GET | `/api/admin/bookings` | Admin |
| GET | `/api/admin/plots` | Admin |
| GET | `/api/notifications` | Yes |

---

## 🎨 Customization

### Update Brand Colors
Edit `app/globals.css` CSS variables:
```css
:root {
  --primary: oklch(0.55 0.15 142); /* Primary green */
  --accent: oklch(0.65 0.12 155);  /* Accent teal */
}
```

### Change Cemetery Data
Modify `prisma/seed.ts` and re-run:
```bash
pnpm exec prisma db seed
```

---

## 🧭 Project Structure

```
MemorialCare/
├── app/
│   ├── api/              # API routes
│   ├── page.tsx          # Home page
│   ├── cemeteries/       # Cemetery pages
│   ├── dashboard/        # Customer dashboard
│   ├── admin/            # Admin pages
│   ├── login/            # Auth pages
│   ├── register/
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/           # React components
├── lib/                  # Utilities & services
├── prisma/              # Database schema
├── scripts/             # Setup scripts
└── DEVELOPMENT.md       # Full documentation
```

---

## 🚢 Deploy to Vercel

1. Push code to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

```bash
# Or deploy directly
vercel deploy --prod
```

---

## 📚 Learn More

- Read `DEVELOPMENT.md` for comprehensive documentation
- Check `COMPLETION_SUMMARY.md` for what's included
- Review `prisma/schema.prisma` for database structure
- Explore API files in `app/api/` for endpoint details

---

## 🆘 Troubleshooting

### Database Connection Error
```bash
# Verify .env.local has correct DATABASE_URL
# Test connection:
pnpm exec prisma db pull
```

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Port Already in Use
```bash
# Use different port
pnpm dev -- -p 3001
```

---

## 📞 Support

For issues or questions:
1. Check DEVELOPMENT.md for detailed docs
2. Review API endpoint implementations in `app/api/`
3. Check console logs for error messages
4. Verify environment variables are set correctly

---

## 🎉 You're Ready!

Start exploring MemorialCare. Happy building!

```bash
# One final command to confirm everything works:
pnpm dev
```

Visit http://localhost:3000 and start booking!
