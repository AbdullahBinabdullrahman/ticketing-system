# Email Notifications for Request Assignment

## Overview
This document describes the email notification system that has been implemented for partner assignment in the ticketing system.

## Problem
Previously, when an admin assigned a request to a partner through the `AssignRequestModal`, no email notifications were sent to inform the partner about the new assignment.

## Solution
Added comprehensive email notification functionality that sends emails to all relevant partner contacts when a request is assigned.

## Implementation Details

### 1. Modified Files

#### `/lib/services/requestService.ts`
- **Line 352**: Added call to `sendAssignmentEmail()` method in the `assignRequest` function
- **Lines 1467-1596**: Added new private method `sendAssignmentEmail()` that:
  - Fetches request details including customer info, service, and category
  - Collects email addresses from:
    - Partner's primary contact email (`partners.contactEmail`)
    - All branch users assigned to the specific branch
  - Sends personalized emails to each recipient in their preferred language (English/Arabic)
  - Logs success/failure for monitoring

### 2. Email Recipients
The system sends assignment emails to:
1. **Partner Contact Email**: The primary email from the `partners` table
2. **Branch Users**: All active users assigned to the specific branch through the `branchUsers` junction table

### 3. Email Content
The email includes:
- Request number (e.g., REQ-20250108-0001)
- Branch name and address
- Service and category information
- Customer name and location
- **SLA Warning**: Reminder to accept or reject within the configured time limit (default: 15 minutes)
- Call-to-action to log in to the partner dashboard

### 4. Language Support
- Automatically detects each recipient's language preference from the `users.languagePreference` field
- Supports both English (`en`) and Arabic (`ar`)
- Defaults to English if no preference is set

### 5. Error Handling
- Email failures do NOT break the assignment process
- All errors are logged for monitoring
- If no email addresses are found, a warning is logged but the assignment continues

## Email Template
The email uses the pre-existing `sendRequestAssignedEmail()` method from `notificationService`, which provides:
- Professional bilingual templates
- Responsive HTML formatting
- Clear call-to-action buttons
- SLA deadline warnings
- Partner dashboard links

## Flow Diagram

```
Admin assigns request via AssignRequestModal
           ↓
API: POST /api/admin/requests/[id]/assign
           ↓
requestService.assignRequest()
           ↓
1. Update database (request, assignment, status log)
2. Create in-app notifications
3. ✨ NEW: Send assignment emails ✨
           ↓
sendAssignmentEmail()
           ↓
- Fetch request details
- Collect partner & branch user emails
- Send personalized emails (en/ar)
- Log results
           ↓
Return success to admin
```

## Testing Checklist

### Prerequisites
- [ ] Ensure `NEXT_PUBLIC_EMAIL` and `NEXT_PUBLIC_EMAIL_PASSWORD` are set in `.env.local`
- [ ] Verify SMTP settings in `emailService.ts` (host: mail.privateemail.com)
- [ ] Ensure partner has a valid `contactEmail` in the `partners` table
- [ ] Ensure branch users have valid emails and `languagePreference` set

### Test Scenarios

#### Test 1: Basic Assignment
1. Create a new request as a customer
2. Log in as admin
3. Assign the request to a partner/branch
4. **Expected**: Email sent to partner contact email and all branch users

#### Test 2: Language Preference
1. Set a branch user's `languagePreference` to `'ar'`
2. Assign a request to that branch
3. **Expected**: That user receives email in Arabic

#### Test 3: No Email Address
1. Remove `contactEmail` from partner
2. Remove email from all branch users
3. Assign a request
4. **Expected**: Warning logged, but assignment succeeds

#### Test 4: Multiple Branch Users
1. Assign 3+ users to the same branch
2. Assign a request to that branch
3. **Expected**: All users receive individual emails

#### Test 5: Email Failure Resilience
1. Use an invalid SMTP password temporarily
2. Assign a request
3. **Expected**: Assignment succeeds, error logged

### Verification
Check the logs for:
```
"Assignment emails sent to partner"
```

And individual recipient logs:
```
"Request assigned email sent"
```

## Configuration

### Required Environment Variables
```bash
NEXT_PUBLIC_EMAIL=platform@mesdrive.com
NEXT_PUBLIC_EMAIL_PASSWORD=your_secure_password
```

### SLA Configuration
The SLA timeout can be configured per partner or globally via the `configurations` table:
- Key: `sla_timeout_minutes`
- Default: 15 minutes

## Monitoring

### Success Logs
```typescript
logger.info("Assignment emails sent to partner", {
  requestId,
  partnerId,
  branchId,
  recipients: emailRecipients.length
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

### Warning Logs
```typescript
logger.warn("No email recipients found for partner assignment", {
  requestId,
  partnerId,
  branchId
});
```

## Future Enhancements
1. **Retry Mechanism**: Implement exponential backoff for failed emails
2. **Email Queue**: Use background job queue (Bull, Agenda) for async processing
3. **Delivery Tracking**: Track email open rates and click-through rates
4. **SMS Notifications**: Add SMS alerts for time-critical assignments
5. **Push Notifications**: Implement browser/mobile push notifications
6. **Digest Emails**: Option to batch multiple assignments into one email

## Related Files
- `/lib/services/requestService.ts` - Main service with assignment logic
- `/lib/services/notificationService.ts` - Email notification wrapper
- `/services/emailService.ts` - Core email service with SMTP configuration
- `/components/modals/AssignRequestModal.tsx` - UI component for assignment
- `/pages/api/admin/requests/[id]/assign.ts` - API endpoint

## Database Schema Reference

### Tables Used
- `requests` - Service requests
- `partners` - Partner companies
- `branches` - Partner branch locations
- `branchUsers` - Junction table for branch-user assignments
- `users` - User accounts with email and language preferences
- `requestAssignments` - Assignment history

## Security Considerations
- Emails contain sensitive customer information - ensure SMTP connection is secure (TLS/SSL)
- Do not include passwords or authentication tokens in emails
- Rate limit email sending to prevent abuse
- Sanitize all user input before including in emails (prevent XSS)

## Compliance
- All emails include unsubscribe options (future enhancement)
- Emails comply with GDPR/data protection requirements
- Customer data is only shared with assigned partners
- Email logs are retained for audit purposes

## Support
For issues or questions:
1. Check logs in production/development console
2. Verify SMTP credentials
3. Test email service independently using `/api/debug/test-email` endpoint
4. Review partner/branch user configurations in database

---

**Last Updated**: 2025-11-08  
**Author**: AI Assistant  
**Version**: 1.0

