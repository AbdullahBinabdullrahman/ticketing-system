-- ============================================================================
-- Test Data Setup for SLA Auto-Unassign Testing
-- 
-- This script creates test data to verify the SLA auto-unassign mechanism
-- Run this in your development database
-- ============================================================================

-- Step 1: Create a test request that's already expired
-- (Replace the IDs with actual values from your database)

-- Find a test partner and branch
SELECT 
    p.id as partner_id,
    p.name as partner_name,
    b.id as branch_id,
    b.name as branch_name
FROM partners p
JOIN branches b ON b.partner_id = p.id
WHERE p.is_active = true 
  AND p.is_deleted = false
  AND b.is_active = true
  AND b.is_deleted = false
LIMIT 1;

-- Find test category and pickup option
SELECT id, name FROM categories WHERE is_active = true AND is_deleted = false LIMIT 1;
SELECT id, name FROM pickup_option_types WHERE is_active = true LIMIT 1;

-- ============================================================================
-- Create Test Request (manually insert or use your existing request)
-- ============================================================================

-- OPTION A: Update an existing assigned request to be expired
-- Replace <request_id> with an actual assigned request ID

UPDATE requests
SET 
    sla_deadline = NOW() - INTERVAL '20 minutes',  -- Expired 20 minutes ago
    assigned_at = NOW() - INTERVAL '25 minutes',   -- Assigned 25 minutes ago
    updated_at = NOW()
WHERE id = <request_id>
  AND status = 'assigned';

-- Verify the update
SELECT 
    id,
    request_number,
    status,
    partner_id,
    branch_id,
    assigned_at,
    sla_deadline,
    EXTRACT(EPOCH FROM (NOW() - sla_deadline))/60 as minutes_expired
FROM requests
WHERE id = <request_id>;

-- ============================================================================
-- OR OPTION B: Create a new test request (if you have the customer ID)
-- ============================================================================

-- Note: You'll need to replace these placeholders:
-- <customer_id> - External customer ID (usually 1)
-- <category_id> - Valid category ID
-- <pickup_option_id> - Valid pickup option ID
-- <partner_id> - Valid partner ID
-- <branch_id> - Valid branch ID
-- <admin_user_id> - Admin user who assigns the request

/*
INSERT INTO requests (
    request_number,
    customer_id,
    customer_name,
    customer_phone,
    customer_lat,
    customer_lng,
    customer_address,
    category_id,
    pickup_option_id,
    status,
    partner_id,
    branch_id,
    assigned_by_user_id,
    assigned_at,
    sla_deadline,
    submitted_at,
    created_by_id
) VALUES (
    'REQ-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
    <customer_id>,
    'Test Customer - SLA',
    '+966501234567',
    '24.7136',
    '46.6753',
    'Test Address for SLA Check, Riyadh',
    <category_id>,
    <pickup_option_id>,
    'assigned',
    <partner_id>,
    <branch_id>,
    <admin_user_id>,
    NOW() - INTERVAL '20 minutes',
    NOW() - INTERVAL '5 minutes',  -- Expired 5 minutes ago
    NOW() - INTERVAL '25 minutes',
    <admin_user_id>
) RETURNING id, request_number, sla_deadline;
*/

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- 1. Check for expired assigned requests (what the cron job queries)
SELECT 
    id,
    request_number,
    status,
    partner_id,
    branch_id,
    assigned_at,
    sla_deadline,
    EXTRACT(EPOCH FROM (NOW() - sla_deadline))/60 as minutes_expired,
    CASE 
        WHEN sla_deadline < NOW() THEN 'EXPIRED'
        ELSE 'NOT EXPIRED'
    END as sla_status
FROM requests
WHERE status = 'assigned'
  AND sla_deadline < NOW()
  AND is_deleted = false
ORDER BY sla_deadline ASC;

-- 2. Check request_assignments table (to verify timeout was logged)
SELECT 
    ra.id,
    r.request_number,
    p.name as partner_name,
    ra.response,
    ra.rejection_reason,
    ra.assigned_at,
    ra.responded_at
FROM request_assignments ra
JOIN requests r ON r.id = ra.request_id
JOIN partners p ON p.id = ra.partner_id
WHERE ra.response = 'timeout'
ORDER BY ra.responded_at DESC
LIMIT 10;

-- 3. Check request_status_log (to verify status change was logged)
SELECT 
    rsl.id,
    r.request_number,
    rsl.status,
    rsl.notes,
    rsl.timestamp,
    u.name as changed_by
FROM request_status_log rsl
JOIN requests r ON r.id = rsl.request_id
LEFT JOIN users u ON u.id = rsl.changed_by_id
WHERE rsl.status = 'unassigned'
  AND rsl.notes LIKE '%SLA timeout%'
ORDER BY rsl.timestamp DESC
LIMIT 10;

-- ============================================================================
-- Cleanup (Optional - run after testing)
-- ============================================================================

-- Delete test requests (be careful with this!)
/*
DELETE FROM request_status_log WHERE request_id IN (
    SELECT id FROM requests WHERE customer_name = 'Test Customer - SLA'
);

DELETE FROM request_assignments WHERE request_id IN (
    SELECT id FROM requests WHERE customer_name = 'Test Customer - SLA'
);

DELETE FROM requests WHERE customer_name = 'Test Customer - SLA';
*/

-- ============================================================================
-- Real-time Monitoring During Test
-- ============================================================================

-- Run this query to watch for changes in real-time
-- (Execute, wait 1 minute for cron to run, refresh)

SELECT 
    r.id,
    r.request_number,
    r.status,
    r.partner_id,
    r.assigned_at,
    r.sla_deadline,
    CASE 
        WHEN r.status = 'unassigned' THEN 'UNASSIGNED BY CRON'
        WHEN r.sla_deadline < NOW() THEN 'SHOULD BE UNASSIGNED'
        ELSE 'OK'
    END as test_status,
    (SELECT COUNT(*) FROM request_assignments WHERE request_id = r.id AND response = 'timeout') as timeout_count
FROM requests r
WHERE r.customer_name = 'Test Customer - SLA'
   OR (r.status IN ('assigned', 'unassigned') AND r.updated_at > NOW() - INTERVAL '10 minutes')
ORDER BY r.updated_at DESC;


