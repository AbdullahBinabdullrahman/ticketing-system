# Changes Summary

## Overview

This document summarizes the changes made to fix the 500 error on admin request creation and to ensure the `/api/admin/users` endpoint returns all users.

## Issues Fixed

### 1. ✅ 500 Error on Admin Request Creation (`/admin/requests/new`)

**Problem:**
- Admin users were getting a 500 error when trying to create requests on behalf of customers
- The error was: "Cannot read properties of undefined (reading 'id')"
- Root cause: Missing `EXTERNAL_CUSTOMER_ID` environment variable

**Solution:**
- Updated `env.example` to include `EXTERNAL_CUSTOMER_ID` and `SYSTEM_USER_ID`
- Modified seed script to automatically create an external customer account
- Created setup script (`scripts/setup-external-customer.ts`) for manual setup
- Added comprehensive documentation in `ADMIN_REQUESTS_SETUP.md`

### 2. ✅ Admin Users API Returns Only Admin Users

**Problem:**
- `/api/admin/users` endpoint was only returning admin and operational users
- Partner users and customer users were excluded
- Limited visibility into all system users

**Solution:**
- Modified `getAdminUsers()` function to return all user types
- Added partner information to the response (partnerId, partnerName)
- Updated API documentation to reflect the change
- Added `emailVerifiedAt` field to response

## Files Modified

### 1. `/env.example`
**Changes:**
- Added `EXTERNAL_CUSTOMER_ID` environment variable
- Added `SYSTEM_USER_ID` environment variable
- Added comments explaining their purpose

```env
# External Customer Configuration
# Customer ID for admin-created requests (external customer)
EXTERNAL_CUSTOMER_ID=1

# System User Configuration
# User ID for system-generated actions (e.g., auto-unassign)
SYSTEM_USER_ID=1
```

### 2. `/lib/services/adminUserService.ts`
**Changes:**
- Modified `getAdminUsers()` function (lines 184-216)
- Removed filter for `userType = 'admin'`
- Removed filter for `partnerId = null`
- Added `partnerId` field to response
- Added `partnerName` field (via LEFT JOIN with partners table)
- Added `emailVerifiedAt` field to response
- Updated function documentation

**Before:**
```typescript
// Only returned admin users with partnerId = null
.where(
  and(
    sql`${users.userType} = 'admin'::user_type_enum`,
    eq(users.isDeleted, false),
    eq(users.partnerId, null)
  )
)
```

**After:**
```typescript
// Returns all users (admin, operational, partner, customer)
.where(eq(users.isDeleted, false))
.leftJoin(partners, eq(users.partnerId, partners.id))
```

### 3. `/pages/api/admin/users.ts`
**Changes:**
- Updated API documentation comment (lines 1-5)
- Changed from "List all admin and operational users" to "List all users"

### 4. `/lib/db/seed.ts`
**Changes:**
- Added external customer creation logic (lines 782-838)
- Creates a system internal customer user with email `external@system.internal`
- Creates corresponding customer profile
- Displays the external customer ID in seed output
- Shows instructions to add `EXTERNAL_CUSTOMER_ID` to `.env`

**New Output:**
```
🔧 External Customer:
  - Customer ID: 1
  - Email: external@system.internal

📋 IMPORTANT: Add this to your .env file:
============================================================
EXTERNAL_CUSTOMER_ID=1
============================================================
```

## Files Created

### 1. `/scripts/setup-external-customer.ts`
**Purpose:**
- Standalone script to create external customer if needed
- Can be run independently of seed script
- Displays the customer ID to add to `.env`

**Usage:**
```bash
npx tsx scripts/setup-external-customer.ts
```

### 2. `/ADMIN_REQUESTS_SETUP.md`
**Purpose:**
- Comprehensive setup guide for admin request creation
- Explains the external customer concept
- Provides troubleshooting steps
- Documents the API endpoint
- Includes environment variable reference

## API Changes

### `/api/admin/users` - GET

**Before:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Admin User",
        "email": "admin@example.com",
        "userType": "admin",
        "roleId": 1,
        "roleName": "admin"
      }
      // Only admin and operational users
    ],
    "roles": [...]
  }
}
```

**After:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Admin User",
        "email": "admin@example.com",
        "userType": "admin",
        "roleId": 1,
        "roleName": "admin",
        "partnerId": null,
        "partnerName": null,
        "emailVerifiedAt": "2023-11-08T10:00:00Z"
      },
      {
        "id": 2,
        "name": "Partner User",
        "email": "partner@quickfix.com",
        "userType": "partner",
        "roleId": 3,
        "roleName": "partner",
        "partnerId": 1,
        "partnerName": "Quick Fix Auto Services",
        "emailVerifiedAt": "2023-11-08T10:00:00Z"
      }
      // Includes all user types
    ],
    "roles": [...]
  }
}
```

## Setup Instructions

### For Existing Projects

1. **Update environment variables:**
   ```bash
   # Add to your .env file
   EXTERNAL_CUSTOMER_ID=1
   SYSTEM_USER_ID=1
   ```

2. **Run the seed script to create external customer:**
   ```bash
   npm run seed
   ```
   
3. **Copy the EXTERNAL_CUSTOMER_ID from the output and update your .env**

4. **Restart your development server:**
   ```bash
   npm run dev
   ```

### For New Projects

1. **Copy `.env.example` to `.env.local` or `.env`**
   ```bash
   cp env.example .env
   ```

2. **Fill in all required values**

3. **Run database migrations:**
   ```bash
   npm run db:push
   ```

4. **Run the seed script:**
   ```bash
   npm run seed
   ```

5. **Update `.env` with the `EXTERNAL_CUSTOMER_ID` shown in seed output**

6. **Start the development server:**
   ```bash
   npm run dev
   ```

## Testing

### Test Admin Users API

```bash
# Get all users
curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected:** Should return all users including admin, operational, partner, and customer users.

### Test Admin Request Creation

1. **Via UI:**
   - Log in as admin at `http://localhost:3000/login`
   - Navigate to `http://localhost:3000/admin/requests/new`
   - Fill out the form
   - Submit
   - Should see success message with request number

2. **Via API:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/requests/customer \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "customerName": "Test Customer",
       "customerPhone": "+966501234567",
       "customerAddress": "123 Test St, Riyadh",
       "customerLat": 24.7136,
       "customerLng": 46.6753,
       "categoryId": 1,
       "pickupOptionId": 1
     }'
   ```

**Expected:** Should return 201 with request details.

## Migration Notes

### Database Changes
- No schema changes required
- Seed script will create external customer automatically
- Existing databases: Run seed script or setup script to create external customer

### Environment Variables
- **New Required:** `EXTERNAL_CUSTOMER_ID`
- **New Optional:** `SYSTEM_USER_ID` (for future cron jobs)
- Update your `.env` file based on `env.example`

### Breaking Changes
- None - these are additive changes
- Existing functionality remains unchanged

## Rollback Plan

If you need to rollback these changes:

1. **Revert code changes:**
   ```bash
   git checkout HEAD~1 -- lib/services/adminUserService.ts
   git checkout HEAD~1 -- pages/api/admin/users.ts
   git checkout HEAD~1 -- lib/db/seed.ts
   git checkout HEAD~1 -- env.example
   ```

2. **Remove external customer (optional):**
   ```sql
   DELETE FROM customers WHERE user_id = (
     SELECT id FROM users WHERE email = 'external@system.internal'
   );
   DELETE FROM users WHERE email = 'external@system.internal';
   ```

3. **Remove environment variables from `.env`:**
   - Remove `EXTERNAL_CUSTOMER_ID`
   - Remove `SYSTEM_USER_ID`

4. **Restart server**

## Future Enhancements

### Possible Improvements

1. **Multiple External Customers:**
   - Support different external customer types
   - E.g., walk-in, phone, email, etc.

2. **Customer Linking:**
   - Allow linking external requests to actual customer accounts later
   - Merge request history when customer creates account

3. **Enhanced Admin UI:**
   - Customer search/autocomplete
   - Customer history lookup
   - Quick customer profile creation

4. **Better Email Handling:**
   - Send notifications to admin instead of external customer
   - Option to send SMS to actual customer phone

## Support

For issues or questions:
1. Check `ADMIN_REQUESTS_SETUP.md` for detailed setup instructions
2. Review `ENV_VARS_DOCUMENTATION.md` for all environment variables
3. Check console logs for detailed error messages
4. Verify database seed was successful

## Related Documentation

- [Admin Request Setup](./ADMIN_REQUESTS_SETUP.md)
- [Environment Variables](./ENV_VARS_DOCUMENTATION.md)
- [Quick Start Guide](./QUICK_START.md)
- [Testing Guide](./TESTING_GUIDE.md)

