# Environment Variables Documentation

This document lists all required environment variables for the ticketing system.

## Database

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ticketing_db
```

## Authentication

```env
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRATION=7d
```

## Email Service (Brevo/Sendinblue)

```env
BREVO_API_KEY=your-brevo-api-key-here
SENDER_EMAIL=noreply@yourdomain.com
SENDER_NAME=Ticketing System
```

## Admin Configuration

```env
ADMIN_EMAIL=admin@example.com
```

## Cron Job Configuration

```env
# Secret key for authenticating cron job API calls
# Must match the CRON_SECRET in cron-jobs/.env
CRON_SECRET=your-secure-random-secret-for-cron-jobs

# User ID for system-generated actions (e.g., auto-unassign)
SYSTEM_USER_ID=1

# Customer ID for admin-created requests (external customer)
EXTERNAL_CUSTOMER_ID=1
```

## Mapbox

```env
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token-here
```

## Application URLs

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## SLA Configuration

```env
# Default SLA timeout in minutes (for partner response)
DEFAULT_SLA_TIMEOUT_MINUTES=15
```

## Environment

```env
NODE_ENV=development
```

## Setup Instructions

### For Local Development

1. Copy `.env.example` to `.env.local`
2. Fill in all required values
3. Generate a secure `CRON_SECRET`: `openssl rand -base64 32`
4. Generate a secure `JWT_SECRET`: `openssl rand -base64 32`

### For Production (Vercel)

Add all environment variables in Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add each variable with production values
3. Make sure `NODE_ENV` is set to `production`

### For Cron Jobs App

Create `cron-jobs/.env` with:
```env
API_BASE_URL=https://your-app.vercel.app
CRON_SECRET=same-secret-as-nextjs-app
NODE_ENV=production
```




