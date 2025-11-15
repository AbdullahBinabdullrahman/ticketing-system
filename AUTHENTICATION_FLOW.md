# 🔐 Authentication & Authorization Flow

## Overview

The ticketing system has a complete authentication and authorization system that automatically directs users to their appropriate portals based on their role.

## 📋 User Types

1. **Admin** - Full system access, admin portal
2. **Partner** - Service provider access, partner portal  
3. **Customer** - End user access, customer portal

## 🔑 Login Credentials

### Partner Account (Quick Fix Auto Services)
```
Email: partner1@test.com
Password: 7&i1cmByGoHL
Login URL: http://localhost:3000/login
```

### Admin Account
```
Email: admin@ticketing.com
Password: Admin123!
Login URL: http://localhost:3000/login
```

## 🚀 Authentication Flow

### 1. Login Process
```
User enters credentials at /login
    ↓
AuthContext.login() validates credentials
    ↓
API returns: { user, tokens }
    ↓
Tokens stored in localStorage:
  - auth_tokens (complete token object)
  - adminToken / partnerToken / customerToken (role-specific)
    ↓
Automatic redirect based on user.userType:
  - admin → /dashboard
  - partner → /partner/dashboard
  - customer → /customer/dashboard
```

### 2. Route Protection

#### Admin Routes (`/dashboard`, `/admin/*`)
- Protected by `AdminGuard` component
- Redirects partners → `/partner/dashboard`
- Redirects customers → `/customer/dashboard`
- Redirects unauthenticated → `/login`

#### Partner Routes (`/partner/*`)
- Protected by `PartnerGuard` component
- Redirects admins → `/dashboard`
- Redirects customers → `/customer/dashboard`
- Redirects unauthenticated → `/login`

### 3. Middleware Protection (`middleware.ts`)
- Handles initial route matching
- Public routes: `/login`, `/register`, `/api/auth/*`
- All other routes checked by AuthContext

## 🛡️ Guard Components

### AdminGuard
```tsx
import { AdminGuard } from '@/components/guards/AdminGuard';

export default function MyAdminPage() {
  return (
    <AdminGuard>
      {/* Admin-only content */}
    </AdminGuard>
  );
}
```

### PartnerGuard
```tsx
import { PartnerGuard } from '@/components/guards/PartnerGuard';

export default function MyPartnerPage() {
  return (
    <PartnerGuard>
      {/* Partner-only content */}
    </PartnerGuard>
  );
}
```

## 📦 Token Storage

### localStorage Keys
- `auth_tokens` - Complete auth object with tokens and user info
- `adminToken` - Admin access token
- `partnerToken` - Partner access token
- `customerToken` - Customer access token

### HTTP Clients
- **adminHttp** (`lib/utils/http.ts`) - Uses `adminToken`
- **partnerHttp** (`lib/utils/partnerHttp.ts`) - Uses `partnerToken`

Both clients automatically:
- Add Authorization header
- Add Accept-Language header
- Redirect to login on 401

## 🔄 Auto-Redirect Examples

### Partner tries to access admin route:
```
Partner user navigates to /admin/partners
    ↓
AdminGuard detects user.userType === "partner"
    ↓
Redirects to /partner/dashboard
```

### Admin tries to access partner route:
```
Admin user navigates to /partner/requests
    ↓
PartnerGuard detects user.userType === "admin"
    ↓
Redirects to /dashboard
```

### Unauthenticated user tries protected route:
```
Anonymous user navigates to /dashboard
    ↓
AdminGuard detects !isAuthenticated
    ↓
Redirects to /login
```

## 🎨 UI/UX Features

### Loading States
- Animated spinner during auth check
- Prevents flash of unauthorized content

### Unauthorized Page
- User-friendly error page at `/unauthorized`
- Shows current user info
- Provides "Go Home" button (role-aware redirect)
- Provides "Go Back" button

### Token Refresh
- Auto-refresh every 14 minutes
- Silent refresh in background
- Auto-logout on refresh failure

## 🧪 Testing Flow

### Test Partner Login
1. Go to `http://localhost:3000/login`
2. Enter: `partner1@test.com` / `7&i1cmByGoHL`
3. Should redirect to `/partner/dashboard`
4. Try accessing `/dashboard` → redirects back to partner portal
5. Try accessing `/admin/partners` → redirects back to partner portal

### Test Admin Login
1. Go to `http://localhost:3000/login`
2. Enter: `admin@ticketing.com` / `Admin123!`
3. Should redirect to `/dashboard`
4. Try accessing `/partner/dashboard` → redirects back to admin portal
5. Full access to all `/admin/*` routes

## 📝 Creating New Protected Pages

### Admin Page
```tsx
import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { AdminGuard } from '@/components/guards/AdminGuard';

export default function NewAdminPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        {/* Your admin content */}
      </AdminLayout>
    </AdminGuard>
  );
}
```

### Partner Page
```tsx
import React from 'react';
import PartnerLayout from '@/components/layout/PartnerLayout';
import { PartnerGuard } from '@/components/guards/PartnerGuard';

export default function NewPartnerPage() {
  return (
    <PartnerGuard>
      <PartnerLayout>
        {/* Your partner content */}
      </PartnerLayout>
    </PartnerGuard>
  );
}
```

## 🔧 API Authentication

### Admin API Calls
```typescript
import { adminHttp } from '@/lib/utils';

// Automatically includes adminToken
const response = await adminHttp.get('/admin/partners');
```

### Partner API Calls
```typescript
import { partnerHttp } from '@/lib/utils/partnerHttp';

// Automatically includes partnerToken
const response = await partnerHttp.get('/partner/requests');
```

## ✅ Security Features

- ✅ Role-based access control (RBAC)
- ✅ Automatic token refresh
- ✅ Route protection with guards
- ✅ Secure token storage
- ✅ Auto-logout on invalid token
- ✅ Redirect loops prevention
- ✅ SSR-safe (checks for window)
- ✅ Loading states prevent flashing

## 🚨 Common Issues & Solutions

### Issue: Partner can still access admin routes
**Solution:** Ensure AdminGuard is wrapping the page component

### Issue: Token not found (Bearer null)
**Solution:** Check localStorage key matches (`adminToken` or `partnerToken`)

### Issue: Infinite redirect loop
**Solution:** Check that guards don't conflict with middleware

### Issue: localStorage not defined (SSR)
**Solution:** All localStorage access wrapped in `typeof window !== 'undefined'`

## 📚 Related Files

- `/lib/contexts/AuthContext.tsx` - Main auth logic
- `/components/guards/AdminGuard.tsx` - Admin route protection
- `/components/guards/PartnerGuard.tsx` - Partner route protection
- `/lib/utils/http.ts` - Admin HTTP client
- `/lib/utils/partnerHttp.ts` - Partner HTTP client
- `/middleware.ts` - Next.js middleware
- `/pages/login.tsx` - Login page with auto-redirect
- `/pages/unauthorized.tsx` - Unauthorized access page

