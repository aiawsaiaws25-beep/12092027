# CineBook: Cinema Ticket Booking Platform

Production-ready, full-stack cinema ticket reservation web application engineered for zero double-booking tolerance, minor-unit financial accuracy, transactional seat holds, and instant digital QR ticketing.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Neon Serverless PostgreSQL**, and **Drizzle ORM**.

---

## Key Features & Multi-Agent Architecture

### Agent 1: App Agent (Frontend & Experience)
- **Cinematic Responsive UI**: Sleek dark theme with warm gold/amber accents, glowing curved screen visuals, and glassmorphic panels.
- **Interactive Auditorium Seat Maps**: Real-time visualization of seat tiers (*Standard*, *VIP*, *Recliner*, *Accessible*) with dynamic pricing calculation and color-coded seat statuses.
- **Synchronized Hold Countdown**: 10-minute visual hold countdown timer keeping user sessions synchronized with backend locks.
- **Digital QR Ticket Passes**: High-density passbook-style tickets with verified QR codes, dynamic booking references, and print/save actions.
- **Booking Management & Refunds**: Customer booking history with 1-click self-service booking cancellation and automated inventory restoration.
- **Admin Management Suite**:
  - Live analytics dashboard (*Gross Revenue*, *Tickets Issued*, *Active Screenings*, *Occupancy Rate*).
  - Movie catalog manager (add/edit feature titles with poster assets and ratings).
  - Showtime scheduling engine across multiple cinema screens.
  - Live bookings inspector and audit trail.

### Agent 2: Database Engine Agent (Data & Transactions)
- **14 Relational PostgreSQL Tables**: `users`, `movies`, `genres`, `movie_genres`, `cinemas`, `auditoriums`, `seats`, `showtimes`, `showtime_seats`, `bookings`, `booking_items`, `payments`, `tickets`, `audit_logs`.
- **Financial Precision in Minor Units**: All monetary amounts (base prices, tier premiums, booking fees, taxes, subtotals, totals) are stored as integer minor units (cents) to eliminate floating-point inaccuracies.
- **Atomic Concurrency Engine**: Mutex & `FOR UPDATE` row locking prevents concurrent double-booking race conditions.
- **Payment Idempotency**: Unique idempotency keys ensure retries and duplicate webhooks never produce duplicate bookings or double charges.
- **Expired Hold Release Cron**: Idempotent scheduled endpoint (`POST /api/cron/release-expired-holds`) protected by `CRON_SECRET`.

### Agent 3: QA Agent & Deployment
- **Comprehensive Automated Test Suite**:
  - `npm run test:concurrency` (simultaneous race condition test)
  - `npm run test:cleanup` (expired hold release verification)
  - `npm run test:idempotency` (duplicate payment retry prevention)
  - `npm run test:all` (full end-to-end integration test runner)
- **Vercel Serverless Ready**: Configured for edge-compatible pooling, serverless functions, and cron jobs.

---

## Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

```env
# Neon PostgreSQL Connection Strings
DATABASE_URL="postgres://neondb_owner:password@ep-sample-pooler.us-east-2.aws.neon.tech/cinebook?sslmode=require"
DATABASE_URL_UNPOOLED="postgres://neondb_owner:password@ep-sample.us-east-2.aws.neon.tech/cinebook?sslmode=require"

# Authentication & Cron Secrets
JWT_SECRET="cinebook_jwt_super_secret_key_change_in_production_32chars"
CRON_SECRET="cinebook_cron_secret_token_change_in_prod"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Payment Test Keys
PAYMENT_SECRET_KEY="sk_test_cinebook_demo_key"
PAYMENT_WEBHOOK_SECRET="whsec_cinebook_test_secret"
NODE_ENV="development"
```

### 3. Run Database Seed & Verification
```bash
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| **Demo Customer** | `customer@cinebook.com` | `customer123` |
| **Demo Admin** | `admin@cinebook.com` | `admin123` |

*(Quick 1-click demo login buttons are also provided in the top navbar and login page).*

---

## Running the Automated QA Test Suite

Execute the full suite to verify database integrity, concurrency locks, payment idempotency, and hold expiration:

```bash
# Run all integration checks
npm run test:all

# Run specific tests
npm run test:concurrency   # Validates zero double-booking race condition
npm run test:cleanup       # Validates expired hold releases
npm run test:idempotency   # Validates payment retry deduplication
```

---

## Vercel Deployment Instructions

### 1. Provision Neon PostgreSQL
1. On Vercel, navigate to **Storage** or **Marketplace** and select **Neon Serverless Postgres**.
2. Connect the database to your project to automatically inject `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.

### 2. Configure Environment Variables in Vercel
In **Project Settings > Environment Variables**, add:
- `JWT_SECRET`: 32+ character random string
- `CRON_SECRET`: Random secret token for cron release endpoint
- `NEXT_PUBLIC_APP_URL`: Your production URL (e.g. `https://your-app.vercel.app`)
- `PAYMENT_SECRET_KEY`: Stripe / test payment secret key
- `PAYMENT_WEBHOOK_SECRET`: Webhook signing secret

### 3. Deploy
```bash
vercel --prod
```
The included `vercel.json` will automatically configure the background cron job to release expired seat holds every 5 minutes.
