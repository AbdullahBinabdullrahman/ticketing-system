# 🧪 Partner Flow Testing Guide

## Pre-requisites

✅ Partner user created: `partner1@test.com` / `7&i1cmByGoHL`
✅ Partner HTTP client configured with token: `partnerToken`
✅ All API endpoints implemented
✅ SWR hooks configured
✅ Route guards in place

## 🔐 Authentication Test

### 1. Token Storage Verification

**Login Flow:**
```
1. Visit: http://localhost:3000/login
2. Enter: partner1@test.com / 7&i1cmByGoHL
3. Click Login
```

**Check localStorage:**
```javascript
// Open Browser DevTools > Console
localStorage.getItem("partnerToken");  // Should return JWT token
localStorage.getItem("auth_tokens");    // Should return full auth object
```

**Expected:**
- ✅ `partnerToken` is stored
- ✅ Redirect to `/partner/dashboard`
- ✅ User stays on partner routes

### 2. Token Injection Verification

**Check Network Requests:**
```
1. Open DevTools > Network tab
2. Navigate to /partner/requests
3. Find the API call to /api/partner/requests
4. Check Headers
```

**Expected Headers:**
```
Authorization: Bearer <partnerToken>
Accept-Language: en (or ar)
Content-Type: application/json
```

## 📋 Requests List Page Test

### URL: `http://localhost:3000/partner/requests`

**Test Cases:**

#### TC1: Page Load
- [ ] Page loads without errors
- [ ] Requests list displays (even if empty)
- [ ] No console errors
- [ ] No "Bearer null" in network requests

#### TC2: Auto-Refresh
- [ ] Wait 30 seconds
- [ ] Check Network tab for automatic API call
- [ ] Data refreshes without page reload

#### TC3: Search
- [ ] Enter request number in search
- [ ] Results filter correctly
- [ ] Enter customer name
- [ ] Results filter correctly

#### TC4: Status Filter
- [ ] Select "Assigned" from dropdown
- [ ] Only assigned requests show
- [ ] URL updates with ?status=assigned
- [ ] Try other statuses

#### TC5: SLA Timer
- [ ] Assigned requests show countdown timer
- [ ] Timer color-coded (green > 10min, yellow ≤ 10min, orange ≤ 5min, red expired)
- [ ] Timer updates every minute

#### TC6: Quick Actions
- [ ] "Accept" button visible on assigned requests
- [ ] "Reject" button visible on assigned requests
- [ ] "Start Work" button on confirmed requests
- [ ] "Mark Complete" button on in_progress requests

## 📝 Request Detail Page Test

### URL: `http://localhost:3000/partner/requests/REQ-XXX`

**Test Cases:**

#### TC7: Page Load
- [ ] Request details display correctly
- [ ] Customer info populated
- [ ] Service info populated
- [ ] Branch info populated (if assigned)
- [ ] Timeline shows activities

#### TC8: Accept Request
- [ ] Click "Accept Request" button
- [ ] Modal appears
- [ ] Shows confirmation message
- [ ] Shows timer remaining
- [ ] Click "Accept" button
- [ ] Success toast appears
- [ ] Redirects to /partner/requests
- [ ] Request status updated to "confirmed"

**API Call Check:**
```
POST /api/partner/requests/{id}/accept
Headers: Authorization: Bearer <partnerToken>
Response: 200 OK
```

#### TC9: Reject Request
- [ ] Click "Reject Request" button
- [ ] Modal appears with textarea
- [ ] Try submitting with < 10 characters → Error
- [ ] Enter valid reason (≥ 10 chars)
- [ ] Click "Reject" button
- [ ] Success toast appears
- [ ] Redirects to /partner/requests
- [ ] Request status updated to "rejected"

**API Call Check:**
```
POST /api/partner/requests/{id}/reject
Body: { "reason": "Cannot service this area" }
Headers: Authorization: Bearer <partnerToken>
Response: 200 OK
```

#### TC10: Status Updates
- [ ] On confirmed request, click "Start Work"
- [ ] Modal appears
- [ ] Add optional notes
- [ ] Submit
- [ ] Status changes to "in_progress"
- [ ] Timeline updates

- [ ] On in_progress request, click "Mark Complete"
- [ ] Modal appears
- [ ] Add optional notes
- [ ] Submit
- [ ] Status changes to "completed"
- [ ] Timeline updates

#### TC11: Timer Countdown
- [ ] On assigned request, countdown timer displays
- [ ] Timer updates every minute (client-side)
- [ ] Timer color changes based on time
- [ ] When timer expires (0 minutes), buttons disabled

#### TC12: Timeline
- [ ] Timeline shows all activities
- [ ] Most recent at top
- [ ] Shows timestamp
- [ ] Shows performer name
- [ ] Shows notes if available

## 🏠 Dashboard Test

### URL: `http://localhost:3000/partner/dashboard`

**Test Cases:**

#### TC13: Stats Display
- [ ] Total requests count correct
- [ ] Pending confirmation count correct
- [ ] In progress count correct
- [ ] Completed count correct
- [ ] Completion rate calculated
- [ ] Avg handling time shown
- [ ] Avg rating shown

#### TC14: Auto-Refresh
- [ ] Stats update automatically
- [ ] Urgent requests alert shows if pending > 0
- [ ] No console errors

## 🔒 Authentication Protection Test

### TC15: Route Guards
**Test unauthenticated access:**
```
1. Logout (if logged in)
2. Try to visit: http://localhost:3000/partner/requests
```
- [ ] Redirects to /login
- [ ] No API calls made

**Test admin accessing partner route:**
```
1. Login as admin (admin@ticketing.com / Admin123!)
2. Try to visit: http://localhost:3000/partner/requests
```
- [ ] Redirects to /dashboard (admin portal)
- [ ] Shows "Access Denied" or redirects automatically

### TC16: Token Expiry
**Simulate token expiry:**
```
1. Login as partner
2. In DevTools Console:
   localStorage.setItem("partnerToken", "invalid_token");
3. Navigate to /partner/requests
```
- [ ] API call returns 401
- [ ] Automatically redirects to /login
- [ ] Token cleared from localStorage

## 📊 Network Tab Checks

### TC17: Request Headers
**For ALL API calls to /api/partner/***
```
Authorization: Bearer <valid_JWT_token>
Accept-Language: en or ar
Content-Type: application/json
```

### TC18: No Token Issues
- [ ] No `Bearer null` in any request
- [ ] No `Bearer undefined` in any request
- [ ] Token present in ALL partner API calls

## 🎯 Integration Tests

### TC19: Complete Request Flow
**End-to-end test:**
```
1. Login as admin
2. Create a new request and assign to partner
3. Logout
4. Login as partner (partner1@test.com)
5. Go to /partner/requests
6. See new request in "assigned" status with timer
7. Click request to view details
8. Accept request
9. Go back to list
10. Click request again
11. Start work (in_progress)
12. Mark as completed
13. Check timeline shows all activities
```

- [ ] All steps complete successfully
- [ ] No errors in console
- [ ] All API calls have proper tokens
- [ ] Status transitions correctly
- [ ] Timeline updates properly

### TC20: Multi-Branch Support
```
1. Partner has multiple branches
2. Requests assigned to different branches
3. All branches' requests visible
4. Branch info displayed correctly
```

## 🐛 Error Scenarios

### TC21: Network Errors
- [ ] Disconnect internet → Shows error message
- [ ] Reconnect → Auto-revalidates data

### TC22: Invalid Request ID
```
Visit: http://localhost:3000/partner/requests/invalid-id
```
- [ ] Shows error message
- [ ] Redirects to /partner/requests

### TC23: Expired SLA
```
Find request with expired timer (0 minutes remaining)
```
- [ ] Accept/Reject buttons disabled
- [ ] Shows "Time expired" message
- [ ] Red warning banner

## ✅ Checklist Summary

**Authentication:**
- [ ] Token stored as `partnerToken`
- [ ] Token injected in all requests
- [ ] 401 redirects to login
- [ ] Route guards working

**Requests List:**
- [ ] Lists display correctly
- [ ] Search works
- [ ] Filter works
- [ ] Auto-refresh (30s)
- [ ] Timers display and countdown
- [ ] Quick actions present

**Request Detail:**
- [ ] Details display correctly
- [ ] Accept works with API
- [ ] Reject works with reason validation
- [ ] Status updates work
- [ ] Timeline displays correctly
- [ ] Timer countdown works

**Dashboard:**
- [ ] Stats load correctly
- [ ] Auto-refresh works
- [ ] Urgent alerts show

**Integration:**
- [ ] Complete flow works end-to-end
- [ ] No console errors
- [ ] No token issues
- [ ] Email notifications sent (if configured)

## 🔍 Debug Commands

### Check Current Token:
```javascript
console.log(localStorage.getItem("partnerToken"));
```

### Check All Auth Data:
```javascript
console.log(localStorage.getItem("auth_tokens"));
console.log(localStorage.getItem("partnerToken"));
console.log(localStorage.getItem("adminToken"));
```

### Check Current User:
```javascript
const tokens = JSON.parse(localStorage.getItem("auth_tokens"));
console.log("User Type:", tokens?.userType);
console.log("User ID:", tokens?.userId);
```

### Clear All Tokens (Force Re-login):
```javascript
localStorage.removeItem("auth_tokens");
localStorage.removeItem("partnerToken");
localStorage.removeItem("adminToken");
localStorage.removeItem("customerToken");
location.reload();
```

## 📧 Email Notification Tests

### TC24: Welcome Email
```
Create new partner user via admin panel
```
- [ ] Email sent to user
- [ ] Contains login credentials
- [ ] Contains partner portal URL

### TC25: Request Assigned Email
```
Admin assigns request to partner
```
- [ ] Partner receives email notification
- [ ] Email contains request details
- [ ] Email contains link to request

### TC26: Request Accepted Email
```
Partner accepts request
```
- [ ] Admin receives notification
- [ ] Customer receives notification
- [ ] Emails contain updated status

### TC27: Request Rejected Email
```
Partner rejects request with reason
```
- [ ] Admin receives notification
- [ ] Email contains rejection reason
- [ ] Admin can reassign

### TC28: SLA Breach Email
```
Partner doesn't respond within 15 minutes
```
- [ ] Admin receives alert
- [ ] Email contains request details
- [ ] Email marked as urgent

## 🎉 Success Criteria

**All tests passing means:**
- ✅ Partner authentication working perfectly
- ✅ Token injection correct in all requests
- ✅ SWR hooks fetching data properly
- ✅ Auto-refresh working
- ✅ Accept/Reject/Status updates working
- ✅ Route protection in place
- ✅ Error handling robust
- ✅ Email notifications sent
- ✅ Production-ready partner portal

## 📝 Test Results Template

```
Partner Flow Test Results
Date: ___________
Tester: ___________

Authentication: ✅ / ❌
Requests List: ✅ / ❌
Request Detail: ✅ / ❌
Dashboard: ✅ / ❌
Route Guards: ✅ / ❌
Integration: ✅ / ❌
Email Notifications: ✅ / ❌

Issues Found:
1. ___________
2. ___________
3. ___________

Overall Status: PASS / FAIL
```

