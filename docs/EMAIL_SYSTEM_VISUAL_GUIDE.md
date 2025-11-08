# Dynamic Email System - Visual Guide

## 📧 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Request Status Change                     │
│              (Partner Portal or Admin Panel)                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              requestService.updateRequestStatus()            │
│                                                               │
│  • Validates status transition                               │
│  • Updates database                                          │
│  • Triggers email notification                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│        notificationService.sendStatusChangeEmail()           │
│                                                               │
│  Parameters:                                                 │
│    - data: RequestNotificationData                           │
│    - status: string (e.g., "in_progress")                    │
│    - adminEmail: string                                      │
│    - language: "en" | "ar"                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│            getStatusEmailContent(status, data)               │
│                                                               │
│  Looks up status in template object:                         │
│                                                               │
│  ┌───────────────────────────────────────┐                  │
│  │  statusTemplates = {                  │                  │
│  │    in_progress: { ... },              │  ← Found!        │
│  │    completed: { ... },                │                  │
│  │    confirmed: { ... },                │                  │
│  │    closed: { ... }                    │                  │
│  │  }                                    │                  │
│  └───────────────────────────────────────┘                  │
│                                                               │
│  Returns template with 4 strings:                            │
│    • customerSubject (AR + EN)                               │
│    • customerMessage (AR + EN)                               │
│    • adminSubject (AR + EN)                                  │
│    • adminMessage (AR + EN)                                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        ▼                                      ▼
┌────────────────────────────┐    ┌────────────────────────────┐
│   Send to Customer         │    │   Send to Admin            │
│                            │    │                            │
│  ✅ If email is valid      │    │  ✅ Always send            │
│  ❌ Skip if system email   │    │                            │
│                            │    │                            │
│  emailService.send(        │    │  emailService.send(        │
│    customerEmail,          │    │    adminEmail,             │
│    subject,                │    │    subject,                │
│    message,                │    │    message,                │
│    language                │    │    language                │
│  )                         │    │  )                         │
└────────────┬───────────────┘    └──────────┬─────────────────┘
             │                               │
             └───────────────┬───────────────┘
                             ▼
                    ┌─────────────────┐
                    │  ✅ Success     │
                    │  📧 Delivered   │
                    │  📝 Logged      │
                    └─────────────────┘
```

## 🎯 Template Lookup Flow

```
Status: "in_progress"
         │
         ▼
┌────────────────────────────────────────┐
│  getStatusEmailContent("in_progress")  │
│                                        │
│  1. Check statusTemplates object       │
│     ├─ in_progress? ✅ FOUND          │
│     │                                  │
│     └─ Return specific template:      │
│        {                               │
│          ar: {                         │
│            customerSubject: "العمل..."│
│            customerMessage: "بدأ..."   │
│            adminSubject: "بدأ..."     │
│            adminMessage: "بدأ..."      │
│          },                            │
│          en: {                         │
│            customerSubject: "Work..." │
│            customerMessage: "started."│
│            adminSubject: "Work..."    │
│            adminMessage: "started..."  │
│          }                             │
│        }                               │
└────────────────────────────────────────┘
```

## 🆕 New Status Without Template

```
Status: "under_review" (NEW - no template)
         │
         ▼
┌────────────────────────────────────────┐
│  getStatusEmailContent("under_review") │
│                                        │
│  1. Check statusTemplates object       │
│     ├─ under_review? ❌ NOT FOUND     │
│     │                                  │
│     └─ Return generic fallback:       │
│        {                               │
│          ar: {                         │
│            customerSubject: "تحديث..." │
│            customerMessage: "تم..."    │
│            adminSubject: "تحديث..."    │
│            adminMessage: "تم..."       │
│          },                            │
│          en: {                         │
│            customerSubject: "Update..."│
│            customerMessage: "updated." │
│            adminSubject: "Update..."   │
│            adminMessage: "updated..."  │
│          }                             │
│        }                               │
└────────────────────────────────────────┘
        │
        ▼
✅ System continues to work!
✅ No errors thrown
✅ Professional email still sent
```

## 📝 Adding New Template - Step by Step

### Step 1: Identify the Need
```
❓ Do I need a custom email for status "on_hold"?
   
   YES → Continue to Step 2
   NO  → Use generic fallback (already works!)
```

### Step 2: Open the File
```bash
File: lib/services/notificationService.ts
Method: getStatusEmailContent()
Location: Line ~314
```

### Step 3: Add Template
```typescript
const statusTemplates = {
  in_progress: { ... },
  completed: { ... },
  confirmed: { ... },
  closed: { ... },
  
  // ADD YOUR NEW STATUS HERE ↓
  on_hold: {
    ar: {
      customerSubject: `طلبك قيد الانتظار - ${data.requestNumber}`,
      customerMessage: `تم وضع طلبك قيد الانتظار مؤقتاً.

رقم الطلب: ${data.requestNumber}
السبب: ${data.notes || "سيتم إعلامك بالتحديثات قريباً"}
الشريك: ${data.partnerName}

نعتذر عن أي إزعاج.`,
      adminSubject: `طلب قيد الانتظار - ${data.requestNumber}`,
      adminMessage: `تم وضع الطلب قيد الانتظار.

رقم الطلب: ${data.requestNumber}
الشريك: ${data.partnerName}
العميل: ${data.customerName}
السبب: ${data.notes || "غير محدد"}`,
    },
    en: {
      customerSubject: `Your Request is On Hold - ${data.requestNumber}`,
      customerMessage: `Your request has been temporarily put on hold.

Request Number: ${data.requestNumber}
Reason: ${data.notes || "You will be notified of updates soon"}
Partner: ${data.partnerName}

We apologize for any inconvenience.`,
      adminSubject: `Request On Hold - ${data.requestNumber}`,
      adminMessage: `The request has been put on hold.

Request Number: ${data.requestNumber}
Partner: ${data.partnerName}
Customer: ${data.customerName}
Reason: ${data.notes || "Not specified"}`,
    },
  },
};
```

### Step 4: Test It
```bash
# 1. Change request status to "on_hold"
# 2. Check logs:
"Sending on_hold email to customer" ✅
"Sending on_hold email to admin" ✅
"on_hold status emails sent successfully" ✅

# 3. Check customer inbox → Custom "On Hold" email ✅
# 4. Check admin inbox → Custom "On Hold" email ✅
```

### Step 5: Done! 🎉
```
✅ Custom email template active
✅ Works in both English and Arabic
✅ Professional, status-specific content
✅ No other code changes needed
```

## 🔄 Email Recipients Logic

```
┌──────────────────────────────────────────────────┐
│           Should Send to Customer?                │
├──────────────────────────────────────────────────┤
│                                                   │
│  Check 1: Does customer email exist?              │
│           └─ NO  → ❌ Skip                        │
│           └─ YES → Continue                       │
│                                                   │
│  Check 2: Is email valid (has @)?                 │
│           └─ NO  → ❌ Skip                        │
│           └─ YES → Continue                       │
│                                                   │
│  Check 3: Is it a system email?                   │
│           (contains "external@system.internal")   │
│           └─ YES → ❌ Skip (log: "system email")  │
│           └─ NO  → ✅ SEND EMAIL                  │
│                                                   │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│            Should Send to Admin?                  │
├──────────────────────────────────────────────────┤
│                                                   │
│  ✅ Always send!                                  │
│                                                   │
│  Admin emails come from:                          │
│    configurationService.getSlaNotificationRecipie │
│                                                   │
│  If no admins found:                              │
│    Use fallback: "admin@system.com"               │
│                                                   │
└──────────────────────────────────────────────────┘
```

## 📊 Status Email Matrix

| Status       | Has Custom Template? | Sent To Customer? | Sent To Admin? | Special Features |
|--------------|---------------------|-------------------|----------------|------------------|
| `in_progress` | ✅ Yes             | ✅ Yes            | ✅ Yes         | Work started msg |
| `completed`   | ✅ Yes             | ✅ Yes            | ✅ Yes         | Rating request   |
| `confirmed`   | ✅ Yes             | ✅ Yes            | ✅ Yes         | Acceptance msg   |
| `closed`      | ✅ Yes             | ✅ Yes            | ✅ Yes         | Thank you msg    |
| `on_hold`     | ❌ No (fallback)   | ✅ Yes            | ✅ Yes         | Generic update   |
| `cancelled`   | ❌ No (fallback)   | ✅ Yes            | ✅ Yes         | Generic update   |
| `*any_new*`   | ❌ No (fallback)   | ✅ Yes            | ✅ Yes         | Generic update   |

## 🌍 Language Support

```
┌─────────────────────────────────────────────────┐
│          Language Parameter: "en"                │
│                                                  │
│  content[language].customerSubject               │
│          ↓                                       │
│  content["en"].customerSubject                   │
│          ↓                                       │
│  "Work Started on Your Request - REQ-..."       │
│                                                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│          Language Parameter: "ar"                │
│                                                  │
│  content[language].customerSubject               │
│          ↓                                       │
│  content["ar"].customerSubject                   │
│          ↓                                       │
│  "العمل جارٍ على طلبك - REQ-..."                │
│                                                  │
└─────────────────────────────────────────────────┘
```

## 🐛 Debugging Guide

### Problem: Email not received

```
Step 1: Check Logs
┌─────────────────────────────────────────────────┐
│  Look for:                                       │
│  • "Sending {status} email to customer"          │
│  • "{status} status emails sent successfully"    │
│                                                  │
│  Found? → Email was sent                         │
│  Not found? → Check status change was triggered  │
└─────────────────────────────────────────────────┘

Step 2: Check Email Address
┌─────────────────────────────────────────────────┐
│  Look for:                                       │
│  • "Skipping customer email (invalid...)"        │
│                                                  │
│  Found? → Email is system email or invalid       │
│  Check customer record in database               │
└─────────────────────────────────────────────────┘

Step 3: Check Email Service
┌─────────────────────────────────────────────────┐
│  Look for:                                       │
│  • "Failed to send {status} status emails"       │
│                                                  │
│  Found? → Email service issue                    │
│  Check .env configuration:                       │
│    - EMAIL_HOST                                  │
│    - EMAIL_USER                                  │
│    - EMAIL_PASS                                  │
└─────────────────────────────────────────────────┘
```

### Problem: Wrong template used

```
┌─────────────────────────────────────────────────┐
│  1. Check status name in database                │
│     SELECT status FROM requests WHERE id = ?;    │
│                                                  │
│  2. Check template key in code                   │
│     Does statusTemplates have key for status?    │
│                                                  │
│  3. Match must be exact:                         │
│     ✅ "in_progress" = "in_progress"             │
│     ❌ "in_progress" ≠ "inProgress"              │
│     ❌ "in_progress" ≠ "In Progress"             │
│                                                  │
│  Use snake_case for consistency!                 │
└─────────────────────────────────────────────────┘
```

## ✅ Testing Checklist

```
□ Test in_progress email
  □ Customer receives "Work Started" email
  □ Admin receives "Work Started" email
  □ English version correct
  □ Arabic version correct

□ Test completed email
  □ Customer receives "Completed" + rating request
  □ Admin receives "Completed" + verification notice
  □ English version correct
  □ Arabic version correct

□ Test confirmed email
  □ Customer receives "Confirmed" email
  □ Admin receives "Confirmed" email
  □ English version correct
  □ Arabic version correct

□ Test closed email
  □ Customer receives "Closed" + thank you
  □ Admin receives "Closed" notice
  □ English version correct
  □ Arabic version correct

□ Test generic fallback
  □ Use status without template
  □ Customer receives generic update
  □ Admin receives generic update
  □ No errors in console

□ Test system email filtering
  □ Set customer email to "external@system.internal"
  □ Verify customer email skipped
  □ Verify admin email still sent
  □ Check logs for "Skipping customer email"

□ Test language switching
  □ Send with language="en" → English email
  □ Send with language="ar" → Arabic email
  □ Subjects translated correctly
  □ Messages translated correctly
```

---

**Visual Guide Version**: 2.0.0  
**Last Updated**: November 8, 2025  
**Status**: ✅ Complete

