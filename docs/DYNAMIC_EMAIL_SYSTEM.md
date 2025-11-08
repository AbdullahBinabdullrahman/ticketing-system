# Dynamic Email System Documentation

## Overview

The ticketing system now features a **dynamic email notification system** that automatically handles email templates for any request status change. This system is designed to be easily extensible without requiring code changes when new statuses are added.

## How It Works

### Architecture

The email system is built around a single, flexible method: `sendStatusChangeEmail()`

```typescript
async sendStatusChangeEmail(
  data: RequestNotificationData,
  status: string,
  adminEmail: string,
  language: Language = "en"
): Promise<{ success: boolean; error?: string }>
```

### Key Features

1. **Status-Specific Templates**: Each status has its own customized email template for both customers and admins
2. **Bilingual Support**: All emails support both English and Arabic
3. **Automatic Fallback**: If a status doesn't have a specific template, a generic template is used automatically
4. **Customer + Admin Notifications**: Sends emails to both customers and administrators
5. **System Email Filtering**: Automatically skips sending to system/internal emails

## Current Supported Statuses

### 1. **in_progress**
- **Customer**: Notified that partner has started working
- **Admin**: Informed that work has begun
- **Use Case**: When partner changes status from "confirmed" to "in_progress"

### 2. **completed**
- **Customer**: Notified request is completed + asked for rating
- **Admin**: Informed completion needs verification
- **Use Case**: When partner marks request as completed

### 3. **confirmed**
- **Customer**: Notified partner has accepted the request
- **Admin**: Informed partner has confirmed
- **Use Case**: When partner accepts a request

### 4. **closed**
- **Customer**: Notified request is closed + thank you message
- **Admin**: Informed request is closed
- **Use Case**: When admin closes a request

### 5. **Generic Fallback**
- **Any Other Status**: Uses generic "status update" template
- **Automatically Works**: No code changes needed for new statuses

## Adding New Status Email Templates

To add a custom email template for a new status:

### Step 1: Open the Template File

```bash
File: /lib/services/notificationService.ts
Method: getStatusEmailContent()
```

### Step 2: Add Your Status Template

```typescript
private getStatusEmailContent(status: string, data: RequestNotificationData) {
  const statusTemplates: Record<string, {...}> = {
    // ... existing templates ...
    
    // Add your new status here:
    your_new_status: {
      ar: {
        customerSubject: `عنوان الرسالة للعميل - ${data.requestNumber}`,
        customerMessage: `محتوى الرسالة للعميل...`,
        adminSubject: `عنوان الرسالة للمسؤول - ${data.requestNumber}`,
        adminMessage: `محتوى الرسالة للمسؤول...`,
      },
      en: {
        customerSubject: `Customer Email Subject - ${data.requestNumber}`,
        customerMessage: `Customer email content...`,
        adminSubject: `Admin Email Subject - ${data.requestNumber}`,
        adminMessage: `Admin email content...`,
      },
    },
  };
  
  // ... rest of the method
}
```

### Step 3: Available Data Fields

You can use these fields in your email templates:

```typescript
{
  requestNumber: string;      // e.g., "REQ-20251108-0001"
  requestId: number;
  customerName: string;        // Customer's full name
  customerEmail: string;       // Customer's email
  partnerName: string;         // Partner company name
  partnerEmail: string;        // Partner email
  branchName: string;          // Branch name
  branchAddress: string;       // Branch address
  serviceName: string;         // Service name (e.g., "Oil Change")
  categoryName: string;        // Category name (e.g., "Maintenance")
  status: string;              // Current status
  notes?: string;              // Optional notes from partner
}
```

## Email Sending Logic

### When are emails sent?

1. **Status Change by Partner**:
   - Customer receives email for any status change
   - Admin receives email for `in_progress` and `completed` statuses

2. **Status Change by Admin**:
   - Customer receives email
   - Admin team receives copy for important statuses

### Email Recipients

- **Customer**: Uses `data.customerEmail`
  - Skips if email contains `external@system.internal`
  - Skips if email is invalid
  
- **Admin**: Uses `adminEmail` parameter
  - Multiple admins can receive notifications
  - Obtained from `configurationService.getSlaNotificationRecipients()`

## Usage Examples

### Example 1: Partner Updates Status to "in_progress"

```typescript
await notificationService.sendStatusChangeEmail(
  {
    requestNumber: "REQ-20251108-0061",
    requestId: 123,
    customerName: "John Doe",
    customerEmail: "john@example.com",
    partnerName: "ABC Auto Center",
    partnerEmail: "partner@abc.com",
    branchName: "Downtown Branch",
    branchAddress: "123 Main St",
    serviceName: "Oil Change",
    categoryName: "Maintenance",
    status: "in_progress",
  },
  "in_progress",         // Status
  "admin@company.com",   // Admin email
  "en"                   // Language
);
```

**Result**:
- ✅ Customer receives: "Work Started on Your Request"
- ✅ Admin receives: "Work Started on Request"

### Example 2: New Status Without Custom Template

```typescript
await notificationService.sendStatusChangeEmail(
  {...data},
  "under_review",        // New status (no template exists)
  "admin@company.com",
  "ar"
);
```

**Result**:
- ✅ Customer receives: "تحديث حالة الطلب" (Request Status Update)
- ✅ Admin receives: "تحديث حالة الطلب" (Request Status Update)
- ✅ Generic template used automatically

## Benefits

### 🚀 Future-Proof
- Add new statuses without touching email code
- Generic fallback ensures nothing breaks

### 🌍 Bilingual by Default
- All templates support English and Arabic
- Consistent structure across languages

### 📧 Flexible Notifications
- Send to customers, admins, or both
- Skip system emails automatically

### 🔍 Detailed Logging
- Every email attempt is logged
- Success/failure tracked per recipient
- Easy debugging with request ID

### ✅ Type-Safe
- Full TypeScript support
- Auto-completion in IDE
- Compile-time error checking

## Testing

### Test Email for Specific Status

```bash
# Start the dev server
npm run dev

# Use the test script
npm run tsx scripts/create-test-request.ts

# Or test in browser:
# 1. Login as partner: http://localhost:3002/partner/login
# 2. Go to request details
# 3. Change status
# 4. Check console logs for email sending status
```

### Check Logs

```typescript
// Look for these log entries:
"Sending {status} email to customer"
"Sending {status} email to admin"
"{status} status emails sent successfully"
```

## Migration Notes

### What Changed?

**Before** (Old System):
- Separate method for each status: `sendRequestInProgressEmail()`, `sendRequestCompletedEmail()`
- Had to create new method for each new status
- Code duplication across methods

**After** (New System):
- Single method: `sendStatusChangeEmail()`
- Template-based system
- Add status in one place (template object)

### Backward Compatibility

The following methods are kept for special cases:
- `sendRequestAcceptedEmail()` - Used when partner accepts request (has specific logic)
- `sendRequestRejectedEmail()` - Used when partner rejects request (includes rejection reason)
- `sendRequestAssignedEmail()` - Used when admin assigns request to partner

All other status changes use the new dynamic system.

## Future Enhancements

### Potential Additions

1. **Database-Driven Templates**
   - Store templates in database
   - Allow admins to edit templates via UI
   - No code deployment needed for changes

2. **Rich HTML Emails**
   - Add HTML templates with branding
   - Include buttons and formatted content
   - Better visual design

3. **Multi-Channel Notifications**
   - SMS notifications
   - Push notifications
   - WhatsApp integration

4. **A/B Testing**
   - Test different email versions
   - Track open rates and engagement
   - Optimize message effectiveness

## Support

For questions or issues:
- Check logs in `/logs` directory
- Review email service configuration in `.env`
- Contact development team

---

**Last Updated**: November 8, 2025
**Version**: 2.0.0
**Author**: Development Team

