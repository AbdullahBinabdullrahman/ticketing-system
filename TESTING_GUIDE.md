# Complete Testing Guide

## 🧪 Testing Auto-Unassign SLA Mechanism

### Prerequisites
- ✅ Next.js app running locally or deployed
- ✅ Database seeded with test data
- ✅ CRON_SECRET set in environment variables
- ✅ Cron job app running (or ready to test API directly)

### Test 1: API Endpoint Testing

#### Using the Test Script
```bash
# Make script executable (first time only)
chmod +x scripts/test-sla-endpoint.sh

# Test local environment
./scripts/test-sla-endpoint.sh local

# Test production environment
export API_URL=https://your-app.vercel.app
export CRON_SECRET=your-secret
./scripts/test-sla-endpoint.sh production
```

#### Manual Testing with cURL
```bash
# Valid request
curl -X POST http://localhost:3000/api/cron/sla-check \
  -H "x-cron-secret: your-secret" \
  -H "Content-Type: application/json" \
  -v

# Expected: 200 OK with JSON response
# {
#   "success": true,
#   "unassignedCount": 0,
#   "timestamp": "2024-...",
#   "durationMs": 45
# }

# Invalid secret (should return 401)
curl -X POST http://localhost:3000/api/cron/sla-check \
  -H "x-cron-secret: wrong-secret" \
  -H "Content-Type: application/json"

# No secret (should return 401)
curl -X POST http://localhost:3000/api/cron/sla-check \
  -H "Content-Type: application/json"

# Wrong method (should return 405)
curl -X GET http://localhost:3000/api/cron/sla-check \
  -H "x-cron-secret: your-secret"
```

### Test 2: Database Integration Testing

#### Step 1: Setup Test Data
```bash
# Connect to your database
psql $DATABASE_URL

# Run the test data setup script
\i scripts/test-data-setup.sql

# Follow the instructions in the script to:
# 1. Find a test partner/branch
# 2. Update an existing request OR create a new one
# 3. Set sla_deadline to past time
```

#### Step 2: Verify Test Request is Expired
```sql
SELECT 
    id,
    request_number,
    status,
    partner_id,
    sla_deadline,
    EXTRACT(EPOCH FROM (NOW() - sla_deadline))/60 as minutes_expired
FROM requests
WHERE status = 'assigned'
  AND sla_deadline < NOW()
LIMIT 5;
```

Expected: At least one request with `minutes_expired > 0`

#### Step 3: Trigger SLA Check
```bash
# Call the API endpoint
curl -X POST http://localhost:3000/api/cron/sla-check \
  -H "x-cron-secret: your-secret" \
  -H "Content-Type: application/json"

# Expected response:
# {
#   "success": true,
#   "unassignedCount": 1,  <-- Should be > 0
#   ...
# }
```

#### Step 4: Verify Database Updates
```sql
-- Check request was unassigned
SELECT id, request_number, status, partner_id, branch_id, sla_deadline
FROM requests
WHERE request_number = 'YOUR-TEST-REQUEST-NUMBER';

-- Expected: status = 'unassigned', partner_id = NULL, sla_deadline = NULL

-- Check request_assignments was created
SELECT ra.*, r.request_number
FROM request_assignments ra
JOIN requests r ON r.id = ra.request_id
WHERE ra.response = 'timeout'
ORDER BY ra.responded_at DESC
LIMIT 1;

-- Expected: One row with response='timeout'

-- Check request_status_log was created
SELECT rsl.*, r.request_number
FROM request_status_log rsl
JOIN requests r ON r.id = rsl.request_id
WHERE rsl.status = 'unassigned'
  AND rsl.notes LIKE '%SLA timeout%'
ORDER BY rsl.timestamp DESC
LIMIT 1;

-- Expected: One row with notes about SLA timeout
```

#### Step 5: Verify Email Notification
- Check admin email inbox
- Look for subject: "⏰ SLA Timeout Alert - Request REQ-..."
- Verify email contains request number and partner name

### Test 3: Cron Job Integration Testing

#### Start Cron Job Locally
```bash
cd cron-jobs
npm install
cp .env.example .env

# Edit .env
nano .env
# Set:
# API_BASE_URL=http://localhost:3000
# CRON_SECRET=your-secret
# NODE_ENV=development
# LOG_LEVEL=debug

# Start cron job
npm start
```

Expected console output:
```
🚀 Ticketing System Cron Jobs Started
=====================================
📍 API Base URL: http://localhost:3000
⏰ SLA Check: Runs every minute
📊 Log Level: debug
🕐 Started at: 2024-...
=====================================

[DEBUG] [2024-...] Running SLA check...
[INFO] [2024-...] SLA check completed - No expired requests
```

#### Monitor Logs
```bash
# Watch logs in real-time
tail -f cron-jobs/*.log  # If logging to file

# Or watch console output
# Logs will show every minute when cron runs
```

#### Verify Auto-Unassign
1. Create expired request in database (using SQL script)
2. Wait up to 1 minute for cron to run
3. Check logs for: `Unassigned X request(s)`
4. Verify database was updated
5. Check admin email

---

## 🎯 Testing Admin Request Creation

### Test 1: UI Flow Testing

#### Step 1: Access Form
1. Login as admin user
2. Navigate to `/admin/requests/new`
3. Or click "Create Request" in sidebar

#### Step 2: Verify Form Loads
✅ Check all fields are visible:
- Customer Name
- Customer Phone
- Customer Address (textarea)
- Map (with Mapbox)
- Category dropdown (populated)
- Service dropdown (disabled initially)
- Pickup Option dropdown (populated)

#### Step 3: Test Form Validation
Try submitting empty form:
- ❌ Should show validation errors
- ❌ Should not submit

Fill in invalid data:
- Name: "A" (too short)
- Phone: "123" (too short)
- Address: "123" (too short)
- ❌ Should show specific error messages

#### Step 4: Test Map Interaction
**Option A: Click Map**
1. Click anywhere on map
2. ✅ Marker should appear
3. ✅ Lat/Lng fields should populate
4. ✅ Toast notification: "Click on map to set customer location"

**Option B: Get Current Location**
1. Click "Get Current Location" button
2. ✅ Browser should ask for location permission
3. ✅ Map should zoom to your location
4. ✅ Marker should appear
5. ✅ Lat/Lng fields should populate

#### Step 5: Test Category/Service Filtering
1. Select a category
2. ✅ Service dropdown should enable
3. ✅ Service dropdown should show only services for that category
4. Change category
5. ✅ Service selection should clear if invalid
6. ✅ Service dropdown should update with new category's services

#### Step 6: Complete Form Submission
Fill in valid data:
```
Customer Name: Test Customer
Customer Phone: +966501234567
Customer Address: Test Address, Riyadh, Saudi Arabia
Location: Click on map or use current location
Category: Any category
Service: (optional) Any service from selected category
Pickup Option: Any option
```

Click "Create Request" button:
- ✅ Loading state should show
- ✅ Button should disable
- ✅ Success toast should appear
- ✅ Should redirect to request detail page
- ✅ Request detail page should show created request

### Test 2: API Integration Testing

#### Test with cURL
```bash
# Get admin token first
ADMIN_TOKEN="your-admin-jwt-token"

# Create request
curl -X POST http://localhost:3000/api/admin/requests/customer \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test Customer",
    "customerPhone": "+966501234567",
    "customerAddress": "Test Address, Riyadh",
    "customerLat": 24.7136,
    "customerLng": 46.6753,
    "categoryId": 1,
    "serviceId": 1,
    "pickupOptionId": 1
  }'

# Expected: 201 Created with request object
```

#### Test Validation
```bash
# Invalid data (missing required fields)
curl -X POST http://localhost:3000/api/admin/requests/customer \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "A"
  }'

# Expected: 400 Bad Request with validation errors
```

#### Test Authorization
```bash
# No token
curl -X POST http://localhost:3000/api/admin/requests/customer \
  -H "Content-Type: application/json" \
  -d '{...}'

# Expected: 401 Unauthorized

# Invalid token
curl -X POST http://localhost:3000/api/admin/requests/customer \
  -H "Authorization: Bearer invalid-token" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Expected: 401 Unauthorized
```

### Test 3: Database Verification

After creating a request via UI or API:

```sql
-- Find the created request
SELECT 
    id,
    request_number,
    customer_id,
    customer_name,
    customer_phone,
    customer_address,
    status,
    category_id,
    service_id,
    pickup_option_id,
    created_by_id,
    created_at
FROM requests
WHERE customer_name = 'Test Customer'
ORDER BY created_at DESC
LIMIT 1;

-- Verify:
-- ✅ customer_id = 1 (EXTERNAL_CUSTOMER_ID)
-- ✅ status = 'submitted'
-- ✅ All fields populated correctly
-- ✅ request_number generated (format: REQ-YYYYMMDD-XXXX)

-- Check it appears in admin requests list
SELECT request_number, status, customer_name
FROM requests
WHERE status = 'submitted'
  AND is_deleted = false
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🔄 End-to-End Integration Test

### Complete Flow Test

#### Step 1: Create Request
1. Login as admin
2. Create request via `/admin/requests/new`
3. Note the request number

#### Step 2: Assign to Partner
1. Go to `/admin/requests/queue`
2. Find your test request
3. Assign to a partner
4. Note the assigned time

#### Step 3: Manually Expire SLA
```sql
UPDATE requests
SET 
    sla_deadline = NOW() - INTERVAL '5 minutes',
    updated_at = NOW()
WHERE request_number = 'YOUR-REQUEST-NUMBER';
```

#### Step 4: Wait for Cron
- Wait 1 minute for cron to run
- Or trigger manually via API

#### Step 5: Verify Auto-Unassign
```sql
SELECT status, partner_id, sla_deadline
FROM requests
WHERE request_number = 'YOUR-REQUEST-NUMBER';

-- Expected: status='unassigned', partner_id=NULL
```

#### Step 6: Check Queue
1. Go to `/admin/requests/queue`
2. ✅ Your request should be back in queue
3. ✅ Can reassign to same or different partner

---

## ✅ Testing Checklist

### SLA Auto-Unassign
- [ ] API endpoint responds to valid requests
- [ ] API endpoint rejects invalid secrets (401)
- [ ] API endpoint rejects wrong HTTP methods (405)
- [ ] Database query finds expired requests
- [ ] Requests table updated correctly
- [ ] Request_assignments table logged timeout
- [ ] Request_status_log table logged status change
- [ ] Admin email notification sent
- [ ] Cron job runs every minute
- [ ] Cron job logs execution
- [ ] Multiple requests unassigned in batch

### Admin Request Creation
- [ ] Form loads with all fields
- [ ] Map displays correctly
- [ ] Click-to-set-location works
- [ ] Get current location works
- [ ] Form validation works
- [ ] Category/service filtering works
- [ ] Required fields enforced
- [ ] Submit creates request
- [ ] Redirects to detail page
- [ ] Request uses external customer ID
- [ ] Navigation link added to sidebar
- [ ] Translation keys work (EN/AR)

### Integration
- [ ] Created request can be assigned
- [ ] Assigned request can be auto-unassigned
- [ ] Unassigned request returns to queue
- [ ] Request can be reassigned after timeout
- [ ] Email notifications work end-to-end

---

## 🐛 Troubleshooting

### SLA Endpoint Returns 401
- Check CRON_SECRET matches between cron app and Next.js app
- Verify header name is exact: `x-cron-secret`
- Check .env files are loaded

### No Requests Being Unassigned
- Verify request has `status='assigned'`
- Check `sla_deadline < NOW()`
- Look at cron logs for errors
- Verify database connection
- Check SYSTEM_USER_ID exists in users table

### Email Not Received
- Check BREVO_API_KEY is set
- Verify ADMIN_EMAIL is correct
- Look for email service errors in logs
- Check spam folder
- Test emailService directly

### Request Creation Fails
- Check admin authentication token
- Verify EXTERNAL_CUSTOMER_ID exists
- Check category/service/pickup IDs are valid
- Look at API error response
- Check browser console for errors

---

## 📊 Performance Testing

### Load Testing SLA Endpoint
```bash
# Install Apache Bench
# apt-get install apache2-utils  # Ubuntu/Debian
# brew install httpd              # macOS

# Test 100 requests, 10 concurrent
ab -n 100 -c 10 \
  -H "x-cron-secret: your-secret" \
  -H "Content-Type: application/json" \
  -p /dev/null \
  -T "application/json" \
  http://localhost:3000/api/cron/sla-check
```

### Database Performance
```sql
-- Check index is being used
EXPLAIN ANALYZE
SELECT * FROM requests
WHERE status = 'assigned'
  AND sla_deadline < NOW();

-- Should show: Index Scan using idx_requests_sla_deadline
```

---

## 📝 Test Results Template

```markdown
## Test Results - [Date]

### Environment
- Next.js: [local/staging/production]
- Cron Job: [local/vps/cloud]
- Database: [development/staging/production]

### SLA Auto-Unassign
- [ ] API endpoint security: PASS/FAIL
- [ ] Database integration: PASS/FAIL
- [ ] Email notifications: PASS/FAIL
- [ ] Cron job execution: PASS/FAIL
- Notes: 

### Admin Request Creation
- [ ] Form UI/UX: PASS/FAIL
- [ ] Map integration: PASS/FAIL
- [ ] Form validation: PASS/FAIL
- [ ] API integration: PASS/FAIL
- [ ] Database storage: PASS/FAIL
- Notes:

### Issues Found
1. 
2. 
3. 

### Performance
- SLA check execution time: XX ms
- Request creation time: XX ms
- Database query time: XX ms
```

---

**Ready to test!** Follow the steps above and report any issues you find. 🚀


