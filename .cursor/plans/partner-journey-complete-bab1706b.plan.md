<!-- bab1706b-1e92-40dc-981e-3e662f23640e 4cd39961-021f-445f-9e84-af561bbceaa7 -->
# Auto-Unassign SLA & Admin Request Creation (Standalone Cron)

## Customer ID Solution

**Decision:** Use fixed `customerId = 1` for all admin-created requests (referred to as "external" customer)

---

## Part 1: Auto-Unassign SLA Mechanism (Standalone Cron App)

### Architecture

- **Standalone Node.js app** in `/cron-jobs` directory
- Separate deployment (VPS, Heroku, DigitalOcean, Railway, etc.)
- Calls Next.js API endpoint: `POST /api/cron/sla-check` (protected by secret key)
- Runs every minute using node-cron

### Database Schema Elements

- **requests table**: `slaDeadline`, `assignedAt`, indexed WHERE status='assigned'
- **request_assignments table**: tracks history with `response='timeout'`
- **request_status_log table**: logs status changes

---

### Step 1: Create API Endpoint for Cron

**File:** `pages/api/cron/sla-check.ts`

```typescript
// POST /api/cron/sla-check
// Protected by CRON_SECRET header
// Called by external cron job every minute

import { NextApiRequest, NextApiResponse } from 'next';
import { slaMonitorService } from '@/lib/services/slaMonitorService';
import logger from '@/lib/utils/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify cron secret
  const cronSecret = req.headers['x-cron-secret'];
  if (cronSecret !== process.env.CRON_SECRET) {
    logger.warn('[CRON] Unauthorized SLA check attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const count = await slaMonitorService.checkAndUnassignExpired();
    logger.info(`[CRON] Auto-unassigned ${count} expired requests`);
    
    return res.status(200).json({
      success: true,
      unassignedCount: count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('[CRON] SLA check failed:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

---

### Step 2: Create SLA Monitor Service

**File:** `lib/services/slaMonitorService.ts`

```typescript
import { db } from '@/lib/db';
import { requests, requestAssignments, requestStatusLog } from '@/lib/db/schema';
import { and, eq, lt } from 'drizzle-orm';
import { notificationService } from './notificationService';
import logger from '@/lib/utils/logger';

const SYSTEM_USER_ID = parseInt(process.env.SYSTEM_USER_ID || '1');

export class SlaMonitorService {
  async checkAndUnassignExpired(): Promise<number> {
    const now = new Date();
    
    // Use optimized index: idx_requests_sla_deadline
    const expiredRequests = await db
      .select()
      .from(requests)
      .where(
        and(
          eq(requests.status, 'assigned'),
          lt(requests.slaDeadline, now)
        )
      );

    logger.info(`[SLA] Found ${expiredRequests.length} expired requests`);

    for (const request of expiredRequests) {
      try {
        // 1. Update request status to unassigned
        await db
          .update(requests)
          .set({
            status: 'unassigned',
            partnerId: null,
            branchId: null,
            assignedAt: null,
            slaDeadline: null,
            updatedById: SYSTEM_USER_ID,
            updatedAt: now
          })
          .where(eq(requests.id, request.id));

        // 2. Record timeout in request_assignments
        await db.insert(requestAssignments).values({
          requestId: request.id,
          partnerId: request.partnerId!,
          branchId: request.branchId!,
          assignedByUserId: request.assignedByUserId!,
          assignedAt: request.assignedAt!,
          respondedAt: now,
          response: 'timeout',
          rejectionReason: 'Auto-unassigned: No response within 15-minute SLA',
          isActive: true
        });

        // 3. Log status change
        await db.insert(requestStatusLog).values({
          requestId: request.id,
          status: 'unassigned',
          changedById: SYSTEM_USER_ID,
          notes: 'SLA timeout - no partner response within 15 minutes',
          timestamp: now
        });

        // 4. Send notification emails
        await notificationService.sendSlaTimeoutEmail({
          requestNumber: request.requestNumber,
          partnerName: 'Partner', // TODO: fetch partner name if needed
          adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com'
        });

        logger.info(`[SLA] Unassigned request ${request.requestNumber}`);
      } catch (error) {
        logger.error(`[SLA] Failed to unassign ${request.requestNumber}:`, error);
      }
    }

    return expiredRequests.length;
  }
}

export const slaMonitorService = new SlaMonitorService();
```

---

### Step 3: Create Standalone Cron Application

**Directory:** `/cron-jobs/`

**File:** `cron-jobs/package.json`

```json
{
  "name": "ticketing-cron-jobs",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "node-cron": "^3.0.3",
    "axios": "^1.6.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

**File:** `cron-jobs/.env.example`

```env
API_BASE_URL=http://localhost:3000
CRON_SECRET=your-secret-key-here
NODE_ENV=production
```

**File:** `cron-jobs/index.js`

```javascript
require('dotenv').config();
const cron = require('node-cron');
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const CRON_SECRET = process.env.CRON_SECRET;

// SLA Check Job - runs every minute
cron.schedule('* * * * *', async () => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Running SLA check...`);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/cron/sla-check`,
      {},
      {
        headers: {
          'x-cron-secret': CRON_SECRET,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    console.log(`[${timestamp}] SLA check completed:`, response.data);
  } catch (error) {
    console.error(`[${timestamp}] SLA check failed:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
});

console.log('🚀 Cron jobs started successfully');
console.log('📍 API Base URL:', API_BASE_URL);
console.log('⏰ SLA check runs every minute');

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down cron jobs...');
  process.exit(0);
});
```

**File:** `cron-jobs/README.md`

````markdown
# Ticketing System Cron Jobs

Standalone Node.js application for scheduled background tasks.

## Jobs

- **SLA Check**: Runs every minute, auto-unassigns requests with expired 15-minute SLA

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. Run:
   ```bash
   npm start
   ```

## Deployment

Deploy to any Node.js hosting:
- VPS (Ubuntu/Debian with PM2)
- Heroku Worker Dyno
- Railway
- DigitalOcean App Platform
- Render Background Worker

### Example PM2 setup:
```bash
pm2 start index.js --name ticketing-cron
pm2 save
pm2 startup
````
```

**File:** `cron-jobs/.gitignore`
```

node_modules/

.env

*.log

````

---

### Step 4: Add Email Notification
**File:** `lib/services/notificationService.ts`

Add method:
```typescript
async sendSlaTimeoutEmail(data: {
  requestNumber: string;
  partnerName: string;
  adminEmail: string;
}): Promise<void> {
  await emailService.sendEmail({
    to: data.adminEmail,
    subject: `⏰ SLA Timeout Alert - Request ${data.requestNumber}`,
    html: `
      <h2>SLA Timeout</h2>
      <p>Request <strong>${data.requestNumber}</strong> was auto-unassigned.</p>
      <p>Partner <strong>${data.partnerName}</strong> did not respond within 15 minutes.</p>
      <p>The request is now back in the queue for reassignment.</p>
    `
  });
}
````

---

### Step 5: Update Environment Variables

**File:** `.env.local` (Next.js app)

```env
CRON_SECRET=your-secure-random-secret-key-here
SYSTEM_USER_ID=1
ADMIN_EMAIL=admin@example.com
EXTERNAL_CUSTOMER_ID=1
```

---

## Part 2: Admin Request Creation UI

### Step 6: Create Request Form Page

**File:** `pages/admin/requests/new.tsx`

**Form Fields:**

- Customer Name (required, min 2 chars)
- Customer Phone (required, min 10 chars)
- Customer Address (textarea, required, min 5 chars)
- Customer Location (lat/lng from MapBox click)
- Category (dropdown, required, fetch via `useCategories`)
- Service (dropdown, optional, filtered by selected categoryId)
- Pickup Option (dropdown, required)

**Key Features:**

- Reuse `MapBox` component from branches page
- Form validation: `react-hook-form` + `createRequestSchema`
- Map allows clicking to set customer location
- Category change filters available services
- Submit to: `POST /api/admin/requests/customer`

**UI Design:**

- Indigo/purple theme consistent with rest of admin portal
- Mobile-first responsive layout
- Loading states during submission
- Success toast with link to view created request

### Step 7: Create Admin Request API

**File:** `pages/api/admin/requests/customer.ts`

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { createRequestSchema } from '@/schemas/requests';
import { requestService } from '@/lib/services/requestService';
import { authenticateAdmin } from '@/lib/middleware/auth';
import { AppError } from '@/lib/utils/errors';

const EXTERNAL_CUSTOMER_ID = parseInt(process.env.EXTERNAL_CUSTOMER_ID || '1');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate admin
    const adminUser = await authenticateAdmin(req);

    // Validate request body
    const validatedData = createRequestSchema.parse(req.body);

    // Create request with external customer ID
    const request = await requestService.createRequest(
      validatedData,
      EXTERNAL_CUSTOMER_ID
    );

    return res.status(201).json({
      success: true,
      request
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: error.message,
        code: error.code
      });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Step 8: Add Navigation

**File:** `components/layout/AdminLayout.tsx`

Add to sidebar navigation array:

```typescript
{
  name: t("requests.createNew"),
  href: "/admin/requests/new",
  icon: PlusCircle,
  current: router.pathname === '/admin/requests/new'
}
```

### Step 9: Add Translations

**Files:** `public/locales/en/common.json` and `public/locales/ar/common.json`

```json
{
  "requests": {
    "createNew": "Create Request",
    "createForCustomer": "Create Request for Customer",
    "customerInfo": "Customer Information",
    "customerName": "Customer Name",
    "customerPhone": "Customer Phone",
    "customerAddress": "Customer Address",
    "customerLocation": "Customer Location",
    "selectCategory": "Select Category",
    "selectService": "Select Service (Optional)",
    "selectPickupOption": "Select Pickup Option",
    "clickMapToSetLocation": "Click on map to set customer location",
    "requestCreatedSuccess": "Request created successfully",
    "viewRequest": "View Request",
    "slaTimeout": "SLA Timeout",
    "autoUnassignedReason": "No response within 15 minutes",
    "external": "External"
  }
}
```

---

## Deployment Guide

### Next.js App (Vercel)

1. Add environment variables:

   - `CRON_SECRET` (same secret as cron app)
   - `SYSTEM_USER_ID=1`
   - `EXTERNAL_CUSTOMER_ID=1`
   - `ADMIN_EMAIL=your-admin@example.com`

2. Deploy as usual

### Cron Jobs App (Separate Hosting)

1. Choose hosting: Railway, Heroku, VPS, DigitalOcean, Render
2. Set environment variables:

   - `API_BASE_URL=https://your-app.vercel.app`
   - `CRON_SECRET=same-secret-as-nextjs`
   - `NODE_ENV=production`

3. Deploy and start the app
4. Monitor logs to verify it's calling API every minute

### Testing

**Test SLA Endpoint:**

```bash
curl -X POST http://localhost:3000/api/cron/sla-check \
  -H "x-cron-secret: your-secret" \
  -H "Content-Type: application/json"
```

**Test Request Creation:**

1. Navigate to `/admin/requests/new`
2. Fill form with customer details
3. Click map to set location
4. Submit
5. Verify request appears in `/admin/requests/queue`

### To-dos

- [x] Add all partner-specific translations (EN/AR)