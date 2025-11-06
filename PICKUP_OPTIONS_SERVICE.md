# Pickup Options Service Implementation

## ✅ Complete Service Layer Created

I've created a complete service layer for pickup options following the same pattern as other services in your application.

---

## 📁 Files Created/Updated

### 1. **API Endpoint** 
**`pages/api/pickup-options.ts`**
- Public endpoint (no authentication required)
- Returns all active pickup options
- Used by customers and mobile app

```typescript
GET /api/pickup-options

Response:
[
  {
    "id": 1,
    "name": "Pickup Only",
    "nameAr": "استلام فقط",
    "description": "Customer brings vehicle to partner location",
    "descriptionAr": "العميل يجلب المركبة إلى موقع الشريك",
    "requiresServiceSelection": false,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  ...
]
```

### 2. **API Client**
**`lib/api/pickupOptions.ts`**
- Uses `adminHttp` from `lib/utils/http.ts` ✅
- Provides typed API functions
- Centralized error handling

```typescript
import { adminHttp } from "@/lib/utils/http";

// Get all pickup options
export async function getPickupOptions(): Promise<PickupOption[]>

// Get single pickup option by ID
export async function getPickupOptionById(id: number): Promise<PickupOption>
```

### 3. **React Hook**
**`hooks/usePickupOptions.ts`**
- SWR-based for caching and revalidation
- Two hooks: `usePickupOptions()` and `usePickupOption(id)`
- Automatic error handling and loading states

```typescript
import { usePickupOptions } from "@/hooks/usePickupOptions";

const { pickupOptions, isLoading, error, refetch } = usePickupOptions();
```

### 4. **Updated Customer Form**
**`pages/customer/requests/new.tsx`**
- Now uses the new `usePickupOptions` hook
- Properly typed with TypeScript
- Automatic data fetching

---

## 🔧 Architecture

### Service Layer Structure:
```
Customer Form (new.tsx)
    ↓
React Hook (usePickupOptions.ts)
    ↓
API Client (pickupOptions.ts) → Uses adminHttp ✅
    ↓
API Endpoint (/api/pickup-options.ts)
    ↓
Database (pickupOptionTypes table)
```

---

## ✨ Key Features

### ✅ Uses `adminHttp` from `lib/utils/http.ts`
The API client uses the centralized HTTP client:
```typescript
import { adminHttp } from "@/lib/utils/http";

export async function getPickupOptions(): Promise<PickupOption[]> {
  const response = await adminHttp.get("/pickup-options");
  return response.data;
}
```

This ensures:
- Automatic token injection
- Language preference headers
- Centralized error handling
- Consistent API calls across the app

### ✅ SWR Caching
- Data is cached and shared across components
- Automatic revalidation
- Background updates
- Optimized performance

### ✅ TypeScript Types
```typescript
export interface PickupOption {
  id: number;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  requiresServiceSelection: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### ✅ Public Endpoint
- No authentication required
- Accessible by customers and mobile app
- Only returns active pickup options

---

## 🧪 Usage Examples

### In Customer Request Form:
```typescript
import { usePickupOptions } from "@/hooks/usePickupOptions";

export default function CustomerNewRequestPage() {
  const { pickupOptions, isLoading, error } = usePickupOptions();
  
  // Use in select dropdown
  <select {...register("pickupOptionId", { valueAsNumber: true })}>
    <option value="">{t("customer.selectPickupOption")}</option>
    {pickupOptionsLoading ? (
      <option disabled>{t("common.loading")}</option>
    ) : (
      pickupOptions?.map((option) => (
        <option key={option.id} value={option.id}>
          {i18n.language === "ar" ? option.nameAr : option.name}
        </option>
      ))
    )}
  </select>
}
```

### Get Single Pickup Option:
```typescript
import { usePickupOption } from "@/hooks/usePickupOptions";

const { pickupOption, isLoading, error } = usePickupOption(1);
```

---

## 📊 Database Schema

The pickup options are stored in the `pickup_option_types` table:

```sql
CREATE TABLE pickup_option_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  name_ar VARCHAR(100),
  description TEXT,
  description_ar TEXT,
  requires_service_selection BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id INTEGER REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by_id INTEGER REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false
);
```

---

## 🔄 Consistent with Other Services

This implementation follows the exact same pattern as:
- `useCategories` → `lib/api/categories.ts`
- `useServices` → `lib/api/services.ts`
- `useBranches` → `lib/api/branches.ts`

All using the same `adminHttp` client from `lib/utils/http.ts`!

---

## ✅ What's Working Now

1. ✅ Customer form loads pickup options automatically
2. ✅ Data is cached with SWR
3. ✅ Uses centralized `adminHttp` client
4. ✅ Properly typed with TypeScript
5. ✅ Bilingual support (EN/AR)
6. ✅ Loading and error states handled
7. ✅ Public endpoint (no auth needed)
8. ✅ Only active options returned

---

## 🎯 Available Pickup Options

The system includes these default pickup options:

1. **Pickup Only** (استلام فقط)
   - Customer brings vehicle to partner

2. **Pickup and Return** (استلام وإرجاع)
   - Partner picks up and returns vehicle

3. **Emergency Pickup** (استلام طارئ)
   - Urgent pickup service

4. **Drop-off In Center** (تسليم في المركز)
   - Customer drops off at service center
   - Requires service selection

5. **Service At Location** (خدمة في الموقع)
   - Service provided at customer location
   - Requires service selection

---

## 🚀 Ready to Use!

The pickup options service is now fully integrated and ready to use throughout your application:

- ✅ Customer portal
- ✅ Admin portal  
- ✅ Partner portal
- ✅ Mobile app (via API)

All using the same centralized service layer with `adminHttp`! 🎉


