# Back-and-Forth Status Changes for Partners

## Overview
Partners can now switch request status back and forth between states instead of only moving forward linearly.

## Changes Made

### 1. Backend Status Transitions (`/lib/services/requestService.ts`)

Updated the `getValidStatusTransitions` method to allow bidirectional transitions:

```typescript
private getValidStatusTransitions(currentStatus: string): string[] {
  const transitions: Record<string, string[]> = {
    submitted: ["assigned"],
    assigned: ["confirmed", "rejected"],
    confirmed: ["in_progress"],                       // Can start work
    in_progress: ["completed", "confirmed"],          // ✨ Can go BACK to confirmed OR forward to completed
    completed: ["in_progress", "closed"],             // ✨ Can go BACK to in_progress OR close
    rejected: ["assigned"],
    unassigned: ["assigned"],
    closed: [],                                       // Closed is final
  };
  return transitions[currentStatus] || [];
}
```

### 2. Frontend Status Dropdown (`/pages/partner/requests/[id].tsx`)

The frontend already supported back-and-forth transitions:

```typescript
const getAvailableStatuses = useCallback(() => {
  switch (request.status) {
    case "confirmed":
      statuses.push({
        value: "in_progress",
        label: t("requests.status.in_progress") || "In Progress",
      });
      break;
    case "in_progress":
      statuses.push({
        value: "completed",
        label: t("requests.status.completed") || "Completed",
      });
      statuses.push({
        value: "confirmed",                           // ✅ Can go back
        label: t("requests.status.confirmed") || "Confirmed",
      });
      break;
    case "completed":
      statuses.push({
        value: "in_progress",                         // ✅ Can go back
        label: t("requests.status.in_progress") || "In Progress",
      });
      break;
  }
  return statuses;
}, [request, t]);
```

### 3. Translation Keys

Added nested status translations for proper i18n support:

**English (`public/locales/en/common.json`):**
```json
"requests": {
  "status": {
    "label": "Status",
    "submitted": "Submitted",
    "assigned": "Assigned",
    "confirmed": "Confirmed",
    "in_progress": "In Progress",
    "completed": "Completed",
    "closed": "Closed",
    "rejected": "Rejected",
    "unassigned": "Unassigned"
  }
}
```

**Arabic (`public/locales/ar/common.json`):**
```json
"requests": {
  "status": {
    "label": "الحالة",
    "submitted": "مُرسل",
    "assigned": "مُكلف",
    "confirmed": "مؤكد",
    "in_progress": "قيد التنفيذ",
    "completed": "مكتمل",
    "closed": "مغلق",
    "rejected": "مرفوض",
    "unassigned": "غير مُكلف"
  }
}
```

## Status Flow Diagram

```
┌──────────────┐
│  submitted   │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   assigned   │ ←───┐
└──────┬───────┘     │
       │             │
       ├─→ confirmed │
       │      ↓      │
       │   ↓ ↕      │
       │ in_progress │
       │      ↓ ↕    │
       │  completed  │
       │      ↓      │
       │   closed    │
       │             │
       └─→ rejected ─┘
```

## Allowed Transitions

| Current Status | Can Change To | Direction |
|---------------|---------------|-----------|
| submitted | assigned | Forward |
| assigned | confirmed, rejected | Forward |
| **confirmed** | **in_progress** | **Forward** |
| **in_progress** | **completed, confirmed** | **Both ⭐** |
| **completed** | **in_progress, closed** | **Both ⭐** |
| rejected | assigned | Re-assign |
| closed | (none) | Final |

## Email Notifications

All status changes now trigger email notifications to admins:

| Status Change | Customer Email | Admin Email |
|--------------|----------------|-------------|
| Accept (confirmed) | ✅ Yes | ✅ Yes |
| Reject (rejected) | ✅ Yes | ✅ Yes |
| Start Work (in_progress) | ✅ Yes | ✅ Yes |
| Complete (completed) | ✅ Yes | ✅ Yes |
| **Go back to in_progress** | ✅ Yes | ✅ Yes |
| **Go back to confirmed** | ✅ Yes | ✅ Yes |

## Testing

### Test Scenario 1: Forward and Back
1. Login as partner
2. Go to request with status "confirmed"
3. Change to "In Progress" → ✅ Should work
4. Change back to "Confirmed" → ✅ Should work
5. Verify email sent each time

### Test Scenario 2: Complete and Back
1. Start with "in_progress" status
2. Change to "Completed" → ✅ Should work
3. Change back to "In Progress" → ✅ Should work
4. Change to "Completed" again → ✅ Should work
5. Verify email sent each time

### Test Scenario 3: Translations
1. Switch language to Arabic
2. Check status dropdown shows Arabic labels
3. Switch back to English
4. Verify English labels show

## Files Modified

1. `/lib/services/requestService.ts` (Line 1294-1306)
   - Updated `getValidStatusTransitions` to allow back-and-forth

2. `/public/locales/en/common.json` (Line 89-99)
   - Added nested `status` object with proper keys

3. `/public/locales/ar/common.json` (Line 89-99)
   - Added nested `status` object with Arabic translations

## Notes

- ✅ Partners can now fix mistakes by going back to previous states
- ✅ All status changes are logged in the timeline
- ✅ Email notifications sent for all transitions
- ✅ Full i18n support for all status labels
- ⚠️ "Closed" status is still final and cannot be changed
- ⚠️ Only partners (not customers) can change status back and forth

## Benefits

1. **Flexibility** - Partners can correct status if they marked it wrong
2. **Better UX** - No need to contact admin to fix status mistakes
3. **Full Audit Trail** - All status changes are logged
4. **Email Transparency** - Admins are notified of all changes
5. **i18n Support** - Works perfectly in English and Arabic

