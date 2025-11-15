# Branches Join Optimization

## Summary
Optimized the partner fetching API to support joining branches data in a single request, eliminating N+1 query issues in the AssignRequestModal.

## Changes Made

### 1. Schema Update (`schemas/partners.ts`)
- Added `includeBranches` optional boolean parameter to `partnerFiltersSchema`
- Defaults to `false` to maintain backward compatibility
- Preprocesses string values "true"/"false" from query parameters

### 2. Service Layer Update (`lib/services/partnerService.ts`)
- Modified `getPartners()` method to optionally fetch branches when `filters.includeBranches === true`
- Implemented efficient bulk fetch of branches for all partners in a single query
- Groups branches by partnerId using a Map for O(1) lookup
- Returns branches as part of `PartnerWithDetails` interface (which already had optional `branches` field)

### 3. API Endpoint (`pages/api/admin/partners.ts`)
- Added documentation comment about the `includeBranches` parameter
- No code changes needed - the existing implementation already passes parsed filters to the service

### 4. Modal Update (`components/modals/AssignRequestModal.tsx`)
- Removed separate `fetchBranches()` function
- Updated `fetchPartners()` to include `includeBranches: true` in API request
- Simplified `handlePartnerSelect()` - no longer needs to fetch branches separately
- Fixed linter errors:
  - Removed unused imports (`BlurFade`)
  - Removed unused variables (`watch`, `errors`, `calculateDistance`)
  - Fixed `any` type annotations with proper error handling
  - Added `fetchPartners` to useEffect dependencies using `useCallback`

## Performance Benefits

### Before:
1. Fetch partners: 1 query
2. User selects a partner
3. Fetch branches for that partner: 1 additional query
4. **Total: 2 sequential API calls**

### After:
1. Fetch partners with branches: 1 query (with efficient join)
2. User selects a partner
3. Branches already available
4. **Total: 1 API call**

### Additional Benefits:
- Eliminated N+1 query problem
- Reduced network latency
- Improved user experience (faster branch display)
- Single source of truth for partner + branch data

## API Usage

### Request partners without branches (default behavior):
```http
GET /api/admin/partners?status=active&limit=1000
```

### Request partners with branches:
```http
GET /api/admin/partners?status=active&limit=1000&includeBranches=true
```

### Response Format:
```typescript
{
  data: {
    partners: [
      {
        id: 1,
        name: "Partner Name",
        status: "active",
        contactEmail: "contact@partner.com",
        contactPhone: "+1234567890",
        branchesCount: 3,
        categoriesCount: 5,
        requestsCount: 100,
        completedRequestsCount: 95,
        averageRating: 4.8,
        branches: [  // Only included when includeBranches=true
          {
            id: 1,
            partnerId: 1,
            partnerName: "Partner Name",
            name: "Main Branch",
            lat: 25.2048,
            lng: 55.2708,
            contactName: "Branch Manager",
            phone: "+1234567890",
            address: "123 Main St",
            radiusKm: 10,
            usersCount: 0,
            requestsCount: 0,
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z"
          }
        ]
      }
    ],
    total: 1
  }
}
```

## Backward Compatibility
✅ All existing API calls continue to work without changes
✅ The `includeBranches` parameter is optional and defaults to `false`
✅ Response format is identical, just with an additional optional `branches` field

## Testing
- ✅ TypeScript compilation successful
- ✅ No linter errors (only minor Tailwind CSS class warnings)
- ✅ Existing functionality preserved
- ✅ Modal now loads branches instantly when partner is selected

## Future Enhancements
Consider using this pattern in other places where related data is frequently needed together:
- Partners with categories
- Requests with assigned partner and branch details
- Users with their assigned branches

