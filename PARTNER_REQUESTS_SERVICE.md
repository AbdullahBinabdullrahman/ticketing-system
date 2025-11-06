# 📋 Partner Requests Service Documentation

## Overview

Complete service for managing partner requests with SWR hooks, automatic data fetching, caching, and real-time updates.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Partner UI Layer                         │
│  /pages/partner/requests.tsx                                │
│  /pages/partner/requests/[id].tsx                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─ uses
                 ↓
┌─────────────────────────────────────────────────────────────┐
│                  Custom SWR Hooks                            │
│  /hooks/usePartnerRequests.ts                               │
│  - usePartnerRequests(filters)                              │
│  - usePartnerRequest(id)                                    │
│  - useAcceptRequest()                                       │
│  - useRejectRequest()                                       │
│  - useUpdateRequestStatus()                                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─ uses
                 ↓
┌─────────────────────────────────────────────────────────────┐
│              Partner HTTP Client                             │
│  /lib/utils/partnerHttp.ts                                  │
│  - Base URL: /api/partner                                   │
│  - Token: partnerToken from localStorage                    │
│  - Auto-redirect on 401                                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─ calls
                 ↓
┌─────────────────────────────────────────────────────────────┐
│                   API Endpoints                              │
│  /pages/api/partner/requests.ts                             │
│  /pages/api/partner/requests/[id].ts                        │
│  /pages/api/partner/requests/[id]/accept.ts                 │
│  /pages/api/partner/requests/[id]/reject.ts                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├─ uses
                 ↓
┌─────────────────────────────────────────────────────────────┐
│               Request Service Layer                          │
│  /lib/services/requestService.ts                            │
│  - getRequests(filters, userId, "partner")                  │
│  - Filters by partner ID automatically                      │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Available Hooks

### 1. `usePartnerRequests(filters)`

Fetches paginated list of partner requests with auto-refresh.

**Usage:**
```tsx
import { usePartnerRequests } from '@/hooks/usePartnerRequests';

function RequestsList() {
  const { requests, pagination, isLoading, isError, mutate } = usePartnerRequests({
    page: 1,
    limit: 20,
    status: 'assigned',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  return (
    <div>
      {requests.map(request => (
        <RequestCard key={request.id} request={request} />
      ))}
    </div>
  );
}
```

**Features:**
- ✅ Auto-refresh every 30 seconds
- ✅ Revalidate on focus
- ✅ Revalidate on reconnect
- ✅ Deduplication (5 seconds)
- ✅ Automatic caching

**Returns:**
```typescript
{
  requests: PartnerRequestResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoading: boolean;
  isError: any;
  mutate: () => Promise<void>;
}
```

---

### 2. `usePartnerRequest(id)`

Fetches single request details with timeline and SLA timer.

**Usage:**
```tsx
import { usePartnerRequest } from '@/hooks/usePartnerRequests';

function RequestDetail() {
  const { request, timeline, timeRemainingMinutes, isLoading, mutate } = 
    usePartnerRequest(requestId);

  return (
    <div>
      <h1>{request?.requestNumber}</h1>
      {timeRemainingMinutes !== null && (
        <p>Time remaining: {timeRemainingMinutes} minutes</p>
      )}
      <Timeline events={timeline} />
    </div>
  );
}
```

**Features:**
- ✅ Auto-refresh every 60 seconds (for timer updates)
- ✅ Includes request timeline
- ✅ Calculates SLA time remaining
- ✅ Revalidate on focus

**Returns:**
```typescript
{
  request: PartnerRequestResponse | undefined;
  timeline: Array<{
    id: number;
    action: string;
    notes: string | null;
    performedByName: string | null;
    createdAt: string;
  }>;
  timeRemainingMinutes: number | null;
  isLoading: boolean;
  isError: any;
  mutate: () => Promise<void>;
}
```

---

### 3. `useAcceptRequest()`

Accepts an assigned request.

**Usage:**
```tsx
import { useAcceptRequest } from '@/hooks/usePartnerRequests';

function AcceptButton({ requestId }) {
  const acceptRequest = useAcceptRequest();
  const { mutate } = usePartnerRequests(); // To refresh list

  const handleAccept = async () => {
    try {
      await acceptRequest(requestId);
      toast.success('Request accepted!');
      await mutate(); // Refresh requests list
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  return <button onClick={handleAccept}>Accept</button>;
}
```

**Function Signature:**
```typescript
(requestId: string | number) => Promise<any>
```

---

### 4. `useRejectRequest()`

Rejects an assigned request with a reason.

**Usage:**
```tsx
import { useRejectRequest } from '@/hooks/usePartnerRequests';

function RejectButton({ requestId }) {
  const rejectRequest = useRejectRequest();
  const [reason, setReason] = useState('');

  const handleReject = async () => {
    try {
      await rejectRequest(requestId, reason);
      toast.success('Request rejected');
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  return (
    <div>
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} />
      <button onClick={handleReject}>Reject</button>
    </div>
  );
}
```

**Function Signature:**
```typescript
(requestId: string | number, reason: string) => Promise<any>
```

**Validation:**
- Reason must be at least 10 characters

---

### 5. `useUpdateRequestStatus()`

Updates request status (in_progress, completed).

**Usage:**
```tsx
import { useUpdateRequestStatus } from '@/hooks/usePartnerRequests';

function StatusButton({ requestId, currentStatus }) {
  const updateStatus = useUpdateRequestStatus();
  const { mutate } = usePartnerRequest(requestId);

  const handleStart = async () => {
    try {
      await updateStatus(requestId, 'in_progress', 'Starting work now');
      await mutate(); // Refresh request details
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return <button onClick={handleStart}>Start Work</button>;
}
```

**Function Signature:**
```typescript
(
  requestId: string | number,
  status: 'in_progress' | 'completed',
  notes?: string
) => Promise<any>
```

---

### 6. `usePartnerRequestsCounts()`

Gets quick counts of requests by status.

**Usage:**
```tsx
import { usePartnerRequestsCounts } from '@/hooks/usePartnerRequests';

function StatsWidget() {
  const { counts, isLoading } = usePartnerRequestsCounts();

  return (
    <div>
      <StatCard label="Assigned" value={counts.assigned} />
      <StatCard label="Confirmed" value={counts.confirmed} />
      <StatCard label="In Progress" value={counts.inProgress} />
      <StatCard label="Completed" value={counts.completed} />
    </div>
  );
}
```

**Returns:**
```typescript
{
  counts: {
    assigned: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    rejected: number;
    total: number;
  };
  isLoading: boolean;
}
```

## 🎯 Request Types

### PartnerRequestResponse
```typescript
interface PartnerRequestResponse {
  // Request info
  id: number;
  requestNumber: string;
  status: string;
  priority: string;
  pickupOption: string;
  notes: string | null;
  rejectionReason: string | null;
  rating: number | null;
  createdAt: string;
  assignedAt: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  slaDeadline?: string;
  
  // Customer info
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerLat: string;
  customerLng: string;
  customerAddress: string;
  
  // Service info
  serviceId: number | null;
  serviceName: string | null;
  serviceNameAr: string | null;
  categoryId: number;
  categoryName: string;
  categoryNameAr: string;
  
  // Branch info
  branchId: number;
  branchName: string;
  branchNameAr: string | null;
  branchAddress: string;
  branchLat: string;
  branchLng: string;
  branchPhone: string | null;
  
  // Partner info
  partnerName: string;
  partnerLogoUrl: string | null;
}
```

## 🔄 Request Status Flow

```
assigned → confirmed → in_progress → completed
   ↓
rejected
```

**Status Actions:**
- `assigned` → Accept (→ `confirmed`) or Reject (→ `rejected`)
- `confirmed` → Start Work (→ `in_progress`)
- `in_progress` → Mark Complete (→ `completed`)

## ⏱️ SLA Timer

**Automatic Calculation:**
- Partners have 15 minutes to accept/reject after assignment
- `timeRemainingMinutes` automatically calculated by API
- Client-side countdown updates every minute
- Color-coded warnings:
  - 🔴 Red: Expired (< 0 minutes)
  - 🟠 Orange: Critical (≤ 5 minutes)
  - 🟡 Yellow: Warning (≤ 10 minutes)
  - 🟢 Green: Safe (> 10 minutes)

## 🔔 Auto-Refresh Strategy

| Hook | Interval | Reason |
|------|----------|--------|
| `usePartnerRequests` | 30 seconds | Keep list updated |
| `usePartnerRequest` | 60 seconds | Update SLA timer |
| `usePartnerRequestsCounts` | 30 seconds | Real-time stats |

## 🎨 Example: Complete Request Flow

```tsx
import { 
  usePartnerRequests,
  usePartnerRequest,
  useAcceptRequest,
  useRejectRequest,
  useUpdateRequestStatus 
} from '@/hooks/usePartnerRequests';

function RequestManagement() {
  // List view
  const { requests, mutate: refreshList } = usePartnerRequests({
    status: 'assigned'
  });

  // Detail view
  const { 
    request, 
    timeline, 
    timeRemainingMinutes,
    mutate: refreshDetail 
  } = usePartnerRequest(selectedId);

  // Actions
  const acceptRequest = useAcceptRequest();
  const rejectRequest = useRejectRequest();
  const updateStatus = useUpdateRequestStatus();

  const handleAccept = async () => {
    await acceptRequest(selectedId);
    await Promise.all([refreshList(), refreshDetail()]);
  };

  const handleReject = async (reason: string) => {
    await rejectRequest(selectedId, reason);
    await Promise.all([refreshList(), refreshDetail()]);
  };

  const handleStartWork = async () => {
    await updateStatus(selectedId, 'in_progress');
    await refreshDetail();
  };

  // UI rendering...
}
```

## 🛡️ Error Handling

All hooks automatically handle:
- ✅ Network errors
- ✅ Authentication errors (401 → redirect to login)
- ✅ Validation errors
- ✅ Server errors

**Best Practice:**
```tsx
const { requests, isError, isLoading } = usePartnerRequests();

if (isLoading) return <Spinner />;
if (isError) return <ErrorMessage error={isError} />;
return <RequestsList requests={requests} />;
```

## 📊 Performance Optimizations

1. **SWR Caching** - Requests cached globally
2. **Deduplication** - Multiple components share same request
3. **Revalidation** - Smart background updates
4. **Optimistic Updates** - Immediate UI feedback with `mutate()`
5. **Conditional Fetching** - Only fetch when needed

## 🚀 Migration Guide

### Before (Manual Fetch):
```tsx
const [requests, setRequests] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchRequests();
}, []);

const fetchRequests = async () => {
  const response = await partnerHttp.get('/requests');
  setRequests(response.data);
  setLoading(false);
};
```

### After (SWR Hook):
```tsx
const { requests, isLoading } = usePartnerRequests();
```

**Benefits:**
- 90% less code
- Automatic caching
- Auto-refresh
- Better performance
- Type-safe

## 📝 Testing

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { usePartnerRequests } from '@/hooks/usePartnerRequests';

test('fetches partner requests', async () => {
  const { result, waitForNextUpdate } = renderHook(() => 
    usePartnerRequests()
  );

  expect(result.current.isLoading).toBe(true);
  
  await waitForNextUpdate();
  
  expect(result.current.requests).toHaveLength(5);
  expect(result.current.isLoading).toBe(false);
});
```

## 🔗 Related Files

- `/hooks/usePartnerRequests.ts` - Hook definitions
- `/lib/utils/partnerHttp.ts` - HTTP client
- `/pages/api/partner/requests.ts` - List API
- `/pages/api/partner/requests/[id].ts` - Detail API
- `/pages/api/partner/requests/[id]/accept.ts` - Accept API
- `/pages/api/partner/requests/[id]/reject.ts` - Reject API
- `/pages/partner/requests.tsx` - List UI
- `/pages/partner/requests/[id].tsx` - Detail UI

## ✅ Checklist for New Features

When adding new partner request features:
- [ ] Add API endpoint in `/pages/api/partner/`
- [ ] Create hook in `/hooks/usePartnerRequests.ts`
- [ ] Use `partnerHttp` client
- [ ] Add TypeScript types
- [ ] Include error handling
- [ ] Add auto-refresh if needed
- [ ] Test with SWR devtools
- [ ] Update this documentation

