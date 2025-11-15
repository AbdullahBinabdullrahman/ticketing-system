# Admin Request Creation Setup Guide

This guide explains how to set up the system for admin-created requests on behalf of customers.

## Overview

The admin request creation feature allows admin users to create service requests for customers who call in or contact via other channels. These requests use a special "external customer" account.

## Issue: 500 Error on Admin Request Creation

If you're getting a 500 error when trying to create a request at `/admin/requests/new`, it's likely because the `EXTERNAL_CUSTOMER_ID` environment variable is not set.

## Solution

### Step 1: Run the Database Seed Script

The seed script now automatically creates an external customer account:

```bash
npm run seed
# or
npx tsx lib/db/seed.ts
```

After running the seed script, you'll see output like:

```
🔧 External Customer:
  - Customer ID: 1
  - Email: external@system.internal

📋 IMPORTANT: Add this to your .env file:
============================================================
EXTERNAL_CUSTOMER_ID=1
============================================================
```

### Step 2: Add Environment Variable

Add the `EXTERNAL_CUSTOMER_ID` to your `.env` file:

```env
EXTERNAL_CUSTOMER_ID=1
```

**Note:** The actual customer ID may be different depending on your database. Use the ID shown in the seed script output.

### Step 3: Restart the Development Server

After adding the environment variable, restart your Next.js server:

```bash
npm run dev
```

### Alternative: Run Setup Script Manually

If you've already run the seed script and just need to create the external customer:

```bash
npx tsx scripts/setup-external-customer.ts
```

This script will:
1. Check if an external customer exists
2. Create one if it doesn't exist
3. Display the customer ID to add to your `.env` file

## Verification

After setup, you can verify the configuration:

1. **Check the environment variable:**
   ```bash
   echo $EXTERNAL_CUSTOMER_ID
   ```

2. **Test the API endpoint:**
   ```bash
   curl http://localhost:3000/api/admin/requests/customer \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "customerName": "Test Customer",
       "customerPhone": "+966501234567",
       "customerAddress": "Test Address",
       "customerLat": 24.7136,
       "customerLng": 46.6753,
       "categoryId": 1,
       "pickupOptionId": 1
     }'
   ```

3. **Test the UI:**
   - Log in as an admin user
   - Navigate to `/admin/requests/new`
   - Fill out the form and submit
   - You should see a success message with the request number

## How It Works

1. Admin users access the request creation form at `/admin/requests/new`
2. They fill in customer details (name, phone, address, location)
3. They select service category and pickup option
4. The system creates a request associated with the external customer ID
5. The request appears in the admin dashboard for assignment to partners

## External Customer Details

- **Purpose:** Represents customers without accounts in the system
- **Email:** `external@system.internal` (system internal, not a real email)
- **Phone:** `+966000000000` (placeholder)
- **Type:** Customer user type
- **Status:** Active but cannot log in

## API Endpoint

**POST** `/api/admin/requests/customer`

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Body:**
```json
{
  "customerName": "John Doe",
  "customerPhone": "+966501234567",
  "customerAddress": "123 Main St, Riyadh",
  "customerLat": 24.7136,
  "customerLng": 46.6753,
  "categoryId": 1,
  "serviceId": 1,  // Optional, depends on pickup option
  "pickupOptionId": 1
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "request": {
      "id": 1,
      "requestNumber": "REQ-20231108-0001",
      "customerId": 1,
      "customerName": "John Doe",
      "status": "submitted",
      ...
    }
  }
}
```

**Response (Error - Missing EXTERNAL_CUSTOMER_ID):**
```json
{
  "success": false,
  "error": "Cannot read properties of undefined (reading 'id')",
  "code": "INTERNAL_ERROR"
}
```

## Troubleshooting

### Error: "Cannot read properties of undefined"

**Cause:** `EXTERNAL_CUSTOMER_ID` environment variable is not set or the customer doesn't exist.

**Solution:**
1. Run the seed script: `npm run seed`
2. Add `EXTERNAL_CUSTOMER_ID` to `.env`
3. Restart the server

### Error: "Customer not found"

**Cause:** The `EXTERNAL_CUSTOMER_ID` points to a non-existent customer.

**Solution:**
1. Run: `npx tsx scripts/setup-external-customer.ts`
2. Update `EXTERNAL_CUSTOMER_ID` in `.env` with the correct ID
3. Restart the server

### Requests are not showing up

**Cause:** Requests are created but may need to be assigned to partners.

**Solution:**
1. Go to `/admin/requests` to view all requests
2. Filter by "Submitted" status to see unassigned requests
3. Assign requests to partners from the admin dashboard

## Environment Variables Reference

Add these to your `.env` file:

```env
# External Customer Configuration
# Customer ID for admin-created requests (external customer)
EXTERNAL_CUSTOMER_ID=1

# System User Configuration (for automated processes)
SYSTEM_USER_ID=1

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/ticketing_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Service (Brevo/Sendinblue)
BREVO_API_KEY=your-brevo-api-key-here
SENDER_EMAIL=noreply@yourdomain.com
SENDER_NAME=Ticketing System

# SLA Configuration
DEFAULT_SLA_TIMEOUT_MINUTES=15

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token-here

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

## Related Files

- API Endpoint: `/pages/api/admin/requests/customer.ts`
- Frontend Page: `/pages/admin/requests/new.tsx`
- Request Service: `/lib/services/requestService.ts`
- Schema Validation: `/schemas/requests.ts`
- Setup Script: `/scripts/setup-external-customer.ts`
- Seed Script: `/lib/db/seed.ts`

## Additional Notes

- The external customer account is shared across all admin-created requests
- Individual customer details (name, phone, address) are stored on each request
- Requests created this way follow the same workflow as customer-created requests
- Email notifications for these requests may need special handling since the external customer email is not real

