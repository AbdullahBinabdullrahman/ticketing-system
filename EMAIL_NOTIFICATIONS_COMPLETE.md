# Complete Email Notifications System

## Overview
This document provides a comprehensive guide to all email notifications in the ticketing system, covering the entire request lifecycle from creation to closure.

## Email Notification Flow

### 📊 Complete Request Lifecycle with Emails

```
┌─────────────────────────────────────────────────────────────┐
│                  REQUEST LIFECYCLE                          │
└─────────────────────────────────────────────────────────────┘

1. NEW REQUEST SUBMITTED (Customer)
   ↓
   📧 Admin/Operational Team receives: "New Request Submitted"
   
2. ADMIN ASSIGNS TO PARTNER
   ↓
   📧 Partner & Branch Users receive: "New Request Assigned"
   📧 Customer receives in-app notification
   
3. PARTNER ACCEPTS REQUEST ✅
   ↓
   📧 Admin/Operational Team receives: "Request Accepted"
   📧 Customer receives: "Your Request is Confirmed"
   
   OR
   
3. PARTNER REJECTS REQUEST ❌
   ↓
   📧 Admin/Operational Team receives: "Request Rejected - Needs Reassignment"
   (Includes rejection reason)
   → Status returns to "unassigned"
   → Admin must reassign to another partner
   
4. PARTNER STARTS WORK (In Progress)
   ↓
   📧 Customer receives: "Service In Progress"
   
5. PARTNER COMPLETES WORK
   ↓
   📧 Customer receives: "Service Completed"
   📧 Admin/Operational Team receives: "Request Completed - Verify"
   
6. ADMIN CLOSES REQUEST
   ↓
   📧 In-app notifications only (no emails)
```

## Email Notification Details

### 1️⃣ New Request Submitted

**Trigger:** Customer submits a new service request  
**Recipients:** Admin/Operational Team  
**Language:** English  
**Purpose:** Notify admin team that a request needs assignment

**Email Content:**
- Request number
- Customer name and contact info
- Service and category
- Pickup option
- Customer location
- Call-to-action to assign partner

**Code Location:**
- `requestService.ts` → `createRequest()` → `sendNewRequestEmail()`

---

### 2️⃣ Request Assigned to Partner

**Trigger:** Admin assigns request to a partner/branch  
**Recipients:** 
- Partner contact email
- All branch users assigned to the specific branch

**Language:** User's preferred language (English/Arabic)  
**Purpose:** Notify partner that they have a new request to accept/reject

**Email Content:**
- Request number
- Branch name and location
- Service and category
- Customer name
- ⏰ **SLA Warning**: Must respond within 15 minutes
- Call-to-action to log in to partner dashboard

**Code Location:**
- `requestService.ts` → `assignRequest()` → `sendAssignmentEmail()`

**Key Features:**
- Sends to both partner email AND all branch users
- Detects each user's language preference
- Includes SLA deadline warning

---

### 3️⃣ Request Accepted by Partner

**Trigger:** Partner accepts/confirms the assigned request  
**Recipients:**
- Admin/Operational Team (English)
- Customer (their preferred language)

**Purpose:** Notify admin and customer that partner has accepted

**Email Content:**

**To Admin:**
- Partner name who accepted
- Request number
- Customer name
- Service details

**To Customer:**
- Confirmation message
- Partner/branch details
- Service information
- Next steps message

**Code Location:**
- `requestService.ts` → `updateRequestStatus()` → `sendRequestAcceptedEmail()`
- Uses: `notificationService.sendRequestAcceptedEmail()`

---

### 4️⃣ Request Rejected by Partner

**Trigger:** Partner rejects the assigned request  
**Recipients:** Admin/Operational Team  
**Language:** English  
**Purpose:** Notify admin that request was rejected and needs reassignment

**Email Content:**
- Partner name who rejected
- Request number
- Customer details
- **Rejection reason** (very important!)
- Call-to-action to reassign to another partner

**Code Location:**
- `requestService.ts` → `updateRequestStatus()` → `sendRequestRejectedEmail()`
- Uses: `notificationService.sendRequestRejectedEmail()`

**Important Notes:**
- Request status automatically changes to "unassigned"
- Must be reassigned by admin
- Rejection reason is mandatory and included in email

---

### 5️⃣ Service In Progress

**Trigger:** Partner starts working on the request  
**Recipients:** Customer  
**Language:** Customer's preferred language  
**Purpose:** Keep customer informed of progress

**Email Content:**
- Status update
- Request number
- Partner/branch details
- Optional notes from partner

**Code Location:**
- `requestService.ts` → `updateRequestStatus()` → `sendStatusChangeEmail()`

---

### 6️⃣ Service Completed

**Trigger:** Partner marks the service as completed  
**Recipients:**
- Customer (their preferred language)
- Admin/Operational Team (English)

**Purpose:** Notify completion and prompt customer verification

**Email Content:**

**To Customer:**
- Completion confirmation
- Request to rate the service
- Thank you message

**To Admin:**
- Request completed notification
- Verification reminder
- Customer feedback prompt

**Code Location:**
- `requestService.ts` → `updateRequestStatus()` → `sendStatusChangeEmail()`

---

### 7️⃣ SLA Timeout / Auto-Unassignment

**Trigger:** Partner doesn't respond within SLA deadline (default: 15 minutes)  
**Recipients:** Admin/Operational Team  
**Language:** Bilingual (English + Arabic)  
**Purpose:** Alert admin that request was auto-unassigned

**Email Content:**
- Timeout alert
- Partner name who didn't respond
- Request details
- Action required: Reassign to another partner

**Code Location:**
- `notificationService.ts` → `sendSlaTimeoutEmail()`
- Triggered by cron job (not directly in request service)

---

## Configuration

### Required Environment Variables

```bash
# Email Service Configuration
NEXT_PUBLIC_EMAIL=platform@mesdrive.com
NEXT_PUBLIC_EMAIL_PASSWORD=your_secure_password

# SMTP Settings (configured in emailService.ts)
# Host: mail.privateemail.com
# Port: 465
# Secure: true (TLS/SSL)
```

### Admin/Operational Team Email List

Managed in the `configurations` table:

```sql
-- Example configuration
INSERT INTO configurations (key, value, scope) VALUES 
('sla_notification_recipients', 'admin@example.com,ops@example.com', 'global');
```

**Get Recipients:**
```typescript
const adminEmails = await configurationService.getSlaNotificationRecipients();
```

---

## Email Template System

All emails use the `notificationService` which wraps `emailService`:

### Available Methods

```typescript
// 1. Request assigned to partner
notificationService.sendRequestAssignedEmail(data, language)

// 2. Partner accepts request
notificationService.sendRequestAcceptedEmail(data, adminEmail, language)

// 3. Partner rejects request
notificationService.sendRequestRejectedEmail(data, adminEmail, language)

// 4. Status update (in_progress, completed, etc.)
notificationService.sendRequestStatusUpdateEmail(data, newStatus, language)

// 5. SLA timeout
notificationService.sendSlaTimeoutEmail(data)

// 6. Generic notification
notificationService.sendNotificationEmail(to, subject, message, language)
```

---

## Language Support

### Supported Languages
- **English (`en`)**: Default
- **Arabic (`ar`)**: Full RTL support

### How Language is Determined

1. **For Customers**: From `users.languagePreference` field
2. **For Partners**: From `users.languagePreference` of branch users
3. **For Admins**: Defaults to English

### Example Email Content

**English:**
```
Subject: New Request Assigned - REQ-20250108-0001

A new service request has been assigned to you.

Request Number: REQ-20250108-0001
Branch: Downtown Branch
Service: Car Maintenance

⏰ Important: Please accept or reject this request within 15 minutes.
```

**Arabic:**
```
الموضوع: طلب جديد تم تعيينه - REQ-20250108-0001

تم تعيين طلب خدمة جديد لك.

رقم الطلب: REQ-20250108-0001
الفرع: فرع وسط البلد
الخدمة: صيانة السيارات

⏰ مهم: يرجى قبول أو رفض الطلب خلال 15 دقيقة.
```

---

## Testing Email Notifications

### Test Scenarios

#### ✅ Test 1: New Request Submission
1. Log in as customer
2. Submit a new service request
3. **Expected**: Admin team receives "New Request Submitted" email

#### ✅ Test 2: Assignment Notification
1. Log in as admin
2. Assign a request to partner/branch
3. **Expected**: 
   - Partner contact email receives notification
   - All branch users receive notification
   - Each in their preferred language

#### ✅ Test 3: Partner Accepts Request
1. Log in as partner
2. Accept an assigned request
3. **Expected**:
   - Admin team receives "Request Accepted" email
   - Customer receives "Request Confirmed" email

#### ✅ Test 4: Partner Rejects Request
1. Log in as partner
2. Reject an assigned request with reason
3. **Expected**:
   - Admin team receives "Request Rejected" email
   - Email includes rejection reason
   - Request status changes to "unassigned"

#### ✅ Test 5: Status Updates
1. Log in as partner
2. Change request status to "in_progress"
3. **Expected**: Customer receives "Service In Progress" email
4. Change status to "completed"
5. **Expected**: Customer AND admin team receive "Completed" emails

---

## Monitoring & Logging

### Success Logs

```typescript
// Assignment email sent
logger.info("Assignment emails sent to partner", {
  requestId,
  partnerId,
  branchId,
  recipients: emailRecipients.length
});

// Acceptance email sent
logger.info("Request acceptance emails sent", {
  requestId,
  recipients: adminEmails.length
});

// Rejection email sent
logger.info("Request rejection emails sent to admin team", {
  requestId,
  recipients: adminEmails.length,
  rejectionReason
});
```

### Error Logs

```typescript
logger.error("Failed to send assignment email to recipient", {
  error: result.error,
  recipient: email,
  requestId
});
```

### Check Logs in Production

```bash
# Search for email-related logs
grep "email" logs/application.log

# Search for specific request
grep "requestId: 123" logs/application.log

# Check for failures
grep "Failed to send" logs/application.log
```

---

## Error Handling

### Graceful Degradation
- **Email failures DO NOT break** the request flow
- All errors are logged but not thrown
- Request status changes proceed even if emails fail

### Common Issues & Solutions

#### Issue 1: No Emails Being Sent

**Check:**
1. Environment variables are set correctly
2. SMTP credentials are valid
3. Admin email list is configured in database

```sql
SELECT * FROM configurations 
WHERE key = 'sla_notification_recipients';
```

#### Issue 2: Partner Not Receiving Assignment Email

**Check:**
1. Partner has `contactEmail` set
2. Branch users have valid email addresses
3. Branch users are active (`isActive = true`)

```sql
-- Check partner email
SELECT id, name, contactEmail FROM partners WHERE id = ?;

-- Check branch users
SELECT u.email, u.languagePreference, bu.isActive
FROM branch_users bu
JOIN users u ON bu.userId = u.id
WHERE bu.branchId = ?;
```

#### Issue 3: Wrong Language in Emails

**Check:**
```sql
-- Update user language preference
UPDATE users 
SET languagePreference = 'ar' 
WHERE id = ?;
```

---

## Email Deliverability

### Best Practices

1. **SPF Records**: Ensure domain has proper SPF records
2. **DKIM**: Configure DKIM signing for authentication
3. **Rate Limiting**: Avoid sending too many emails too quickly
4. **Bounce Handling**: Monitor bounced emails

### Email Provider: PrivateEmail

```javascript
{
  host: "mail.privateemail.com",
  port: 465,
  secure: true, // TLS/SSL
  auth: {
    user: "platform@mesdrive.com",
    pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD
  }
}
```

---

## Future Enhancements

### Planned Features

1. **Email Templates**
   - HTML email templates with branding
   - Dynamic template selection
   - Template versioning

2. **Email Queue**
   - Background job processing (Bull/Agenda)
   - Retry mechanism with exponential backoff
   - Priority queue for urgent notifications

3. **Delivery Tracking**
   - Email open tracking
   - Click-through rate tracking
   - Bounce handling

4. **Multi-Channel Notifications**
   - SMS notifications for time-critical alerts
   - Push notifications (web/mobile)
   - WhatsApp Business API integration

5. **Email Preferences**
   - User-configurable email preferences
   - Notification frequency settings
   - Digest emails (daily/weekly summaries)

6. **Analytics Dashboard**
   - Email delivery rates
   - Open rates by notification type
   - Partner response times

---

## API Reference

### Request Service Email Methods

```typescript
// Private method: Send assignment email
private async sendAssignmentEmail(
  requestId: number,
  partner: { id: number; name: string; contactEmail?: string | null },
  branch: { id: number; name: string; address?: string | null }
): Promise<void>

// Private method: Send acceptance email
private async sendRequestAcceptedEmail(
  requestId: number
): Promise<void>

// Private method: Send rejection email
private async sendRequestRejectedEmail(
  requestId: number,
  rejectionReason?: string
): Promise<void>

// Private method: Send status change email
private async sendStatusChangeEmail(
  requestId: number,
  newStatus: string,
  notes?: string
): Promise<void>

// Private method: Send new request email
private async sendNewRequestEmail(
  requestId: number
): Promise<void>
```

### Notification Service Email Methods

```typescript
// Send request assigned email
async sendRequestAssignedEmail(
  data: RequestNotificationData,
  language: Language = "en"
): Promise<{ success: boolean; error?: string }>

// Send request accepted email
async sendRequestAcceptedEmail(
  data: RequestNotificationData,
  adminEmail: string,
  language: Language = "en"
): Promise<{ success: boolean; error?: string }>

// Send request rejected email
async sendRequestRejectedEmail(
  data: RequestNotificationData,
  adminEmail: string,
  language: Language = "en"
): Promise<{ success: boolean; error?: string }>

// Send status update email
async sendRequestStatusUpdateEmail(
  data: RequestNotificationData,
  newStatus: string,
  language: Language = "en"
): Promise<{ success: boolean; error?: string }>

// Send SLA timeout email
async sendSlaTimeoutEmail(data: {
  requestNumber: string;
  partnerName: string;
  recipients: string[];
  slaDeadline?: Date | string | null;
  assignedAt?: Date | string | null;
}): Promise<{ success: boolean; error?: string }>
```

---

## Related Files

```
/lib/services/
  ├── requestService.ts          # Main request logic + email triggers
  ├── notificationService.ts     # Email notification wrapper
  └── configurationService.ts    # Config management (admin emails)

/services/
  └── emailService.ts            # Core SMTP email service

/components/modals/
  └── AssignRequestModal.tsx     # UI for assignment

/pages/api/admin/requests/
  └── [id]/assign.ts            # Assignment API endpoint
```

---

## Summary: What's New

### ✅ Implemented Features

1. **Partner Assignment Emails** ✨ NEW
   - Sent to partner contact email
   - Sent to all branch users
   - Language-aware (en/ar)
   - Includes SLA warning

2. **Partner Acceptance Emails** ✨ NEW
   - Sent to admin team
   - Sent to customer
   - Confirms partner acceptance

3. **Partner Rejection Emails** ✨ NEW
   - Sent to admin team
   - Includes rejection reason
   - Prompts reassignment

4. **Existing Notifications**
   - New request submission (admin)
   - Status updates (customer)
   - SLA timeout (admin)

### 🔧 Complete Email Coverage

Every major event in the request lifecycle now triggers appropriate email notifications to all relevant parties.

---

**Last Updated**: 2025-11-08  
**Version**: 2.0  
**Maintainer**: Development Team



