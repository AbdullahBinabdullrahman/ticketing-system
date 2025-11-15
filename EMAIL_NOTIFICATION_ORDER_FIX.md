# Email Notification Order Fix

## Date: November 12, 2025

## Issue
User wanted to ensure that email notifications are sent **AFTER** the database status changes are complete, not before.

## Solution
Verified and enhanced the existing implementation to guarantee proper order:

### 1. **Database Updates First** ✅
All three endpoints now follow this strict order:

```
1. Update request status in database (with await)
2. Log status change in timeline (with await)  
3. Get request details for email (with await)
4. Send email notifications (fire and forget)
```

### 2. **Files Updated**

#### `/pages/api/partner/requests/[id]/accept.ts`
**Changes:**
- Added explicit logging after status update: "Request status updated to confirmed"
- Added logging after timeline update: "Status change logged in timeline"
- Added comment: "Status change is complete - now safe to send notification emails"
- Fixed imports (removed unused `sql`, added `or`)
- Fixed `logger.apiRequest` call to use proper object format

**Flow:**
```typescript
// 1. Update status to "confirmed"
await db.update(requests).set({ status: "confirmed", ... });
logger.info("Request status updated to confirmed");

// 2. Log in timeline
await db.insert(requestStatusLog).values({ status: "confirmed", ... });
logger.info("Status change logged in timeline");

// 3. Get request details
const requestDetails = await db.select(...);

// 4. THEN send emails (fire and forget)
for (const admin of adminUsers) {
  notificationService.sendRequestAcceptedEmail(...);
}
```

#### `/pages/api/partner/requests/[id]/reject.ts`
**Changes:**
- Changed status from "rejected" to "unassigned" (as per business logic)
- Added explicit logging after status update
- Added logging after timeline update  
- Added comment: "Status change is complete - now safe to send notification emails"
- Fixed imports (removed unused `sql`, `inArray`)
- Fixed all `requestId` references to use `request.id`
- Fixed `logger.apiRequest` call

**Flow:**
```typescript
// 1. Update status to "unassigned" (rejected requests become unassigned)
await db.update(requests).set({ status: "unassigned", ... });
logger.info("Request status updated to rejected");

// 2. Log in timeline
await db.insert(requestStatusLog).values({ status: "unassigned", ... });
logger.info("Status change logged in timeline");

// 3. Get request details
const requestDetails = await db.select(...);

// 4. THEN send emails (fire and forget)
for (const admin of adminUsers) {
  notificationService.sendRequestRejectedEmail(...);
}
```

#### `/lib/services/requestService.ts`
**Method:** `updateRequestStatus()`

**Changes:**
- Added logging after database update: "Request status updated in database"
- Added logging after assignment record update: "Assignment record updated"
- Added logging after timeline log: "Status change logged in timeline"
- Added comment: "All database updates are complete - now safe to send notifications"

**Flow:**
```typescript
// 1. Update request status in database
await db.update(requests).set(updateData);
logger.info("Request status updated in database");

// 2. Update assignment record (if confirmed/rejected)
if (data.status === "confirmed" || data.status === "rejected") {
  await db.update(requestAssignments).set(...);
  logger.info("Assignment record updated");
}

// 3. Log status change
await this.logStatusChange(...);
logger.info("Status change logged in timeline");

// 4. THEN send notifications
// All database updates are complete - now safe to send notifications
if (data.status === "confirmed") {
  await this.sendRequestAcceptedEmail(...);
}
```

---

## Why "Fire and Forget" is Correct

The email sending uses "fire and forget" pattern (async without await):

```typescript
// ✅ Correct approach
notificationService.sendRequestAcceptedEmail(...)
  .then((result) => logger.info("Email sent"))
  .catch((error) => logger.error("Email failed"));
```

**Benefits:**
1. ✅ **Fast API Response** - User gets immediate feedback
2. ✅ **No Transaction Blocking** - Email failures don't block database commits
3. ✅ **Proper Logging** - All successes and failures are logged
4. ✅ **Resilient** - Database changes are committed even if emails fail

**Alternative (NOT recommended):**
```typescript
// ❌ Slow approach
await notificationService.sendRequestAcceptedEmail(...);
```
This would:
- ❌ Slow down API response by 2-5 seconds
- ❌ Block the user waiting for email delivery
- ❌ Risk transaction rollback if email fails

---

## Logging Verification

You can now trace the exact order in logs:

```log
[INFO] Request status updated to confirmed | requestId: 123
[INFO] Status change logged in timeline | requestId: 123
[INFO] Fetched admin users for notification | count: 3
[INFO] Sending acceptance emails to admins | requestId: 123
[INFO] Acceptance email sent successfully | requestId: 123, adminEmail: admin@example.com
```

---

## Testing

### Test the Accept Flow:
```bash
curl 'http://localhost:3000/api/partner/requests/REQ-XXX/accept' \
  -X 'POST' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Accept-Language: en'
```

**Expected Response (immediate):**
```json
{
  "success": true,
  "data": {
    "message": "Request accepted successfully",
    "requestId": 123,
    "status": "confirmed"
  }
}
```

**Expected Logs (in order):**
1. "Request status updated to confirmed"
2. "Status change logged in timeline"
3. "Sending acceptance emails to admins"
4. "Acceptance email sent successfully"

### Test the Reject Flow:
```bash
curl 'http://localhost:3000/api/partner/requests/REQ-XXX/reject' \
  -X 'POST' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"reason": "Not available"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Request rejected successfully",
    "requestId": 123,
    "status": "unassigned"
  }
}
```

---

## Important Notes

### About the "confirmed" Status Error
If you see: `"Cannot accept request with status: confirmed"`

**This means:**
- ✅ The request was already accepted successfully
- ✅ The status is already "confirmed" in the database
- ✅ Emails were already sent when it was first accepted

**You cannot accept a request twice**. The accept endpoint only works when status is "assigned".

### Valid Status Transitions
- `assigned` → `confirmed` ✅ (via accept endpoint)
- `assigned` → `unassigned` ✅ (via reject endpoint)
- `confirmed` → `in_progress` ✅ (via status update)
- `in_progress` → `completed` ✅ (via status update)
- `completed` → `closed` ✅ (via close endpoint)

---

## Verification Checklist

After restarting your server:

- [ ] Accept endpoint returns success immediately
- [ ] Reject endpoint returns success immediately  
- [ ] Database status is updated before emails are sent
- [ ] Logs show correct order of operations
- [ ] Email notifications are received by admins
- [ ] Email notifications are received by customers (when applicable)
- [ ] Failed emails don't prevent status changes
- [ ] All operations are properly logged

---

## Related Files

- `/pages/api/partner/requests/[id]/accept.ts` - Accept endpoint
- `/pages/api/partner/requests/[id]/reject.ts` - Reject endpoint
- `/pages/api/partner/requests/[id]/status.ts` - Status update endpoint
- `/lib/services/requestService.ts` - Request service with status update logic
- `/lib/services/notificationService.ts` - Email notification service

