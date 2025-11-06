-- Script to fix partner role permissions
-- This ensures all partner users have the correct permissions

-- 1. Check current partner role permissions
SELECT 
    r.name as role_name,
    p.name as permission_name,
    rp.is_active,
    rp.is_deleted
FROM role_permissions rp
JOIN roles r ON r.id = rp.role_id
JOIN permissions p ON p.id = rp.permission_id
WHERE r.name = 'partner';

-- 2. Get partner role ID and required permission IDs
DO $$ 
DECLARE
    partner_role_id INT;
    request_view_id INT;
    request_update_id INT;
    notification_view_id INT;
BEGIN
    -- Get partner role ID
    SELECT id INTO partner_role_id FROM roles WHERE name = 'partner';
    
    -- Get permission IDs
    SELECT id INTO request_view_id FROM permissions WHERE name = 'request_view';
    SELECT id INTO request_update_id FROM permissions WHERE name = 'request_update';
    SELECT id INTO notification_view_id FROM permissions WHERE name = 'notification_view';
    
    -- Insert or update request_view permission
    INSERT INTO role_permissions (role_id, permission_id, is_active, is_deleted, created_at, updated_at)
    VALUES (partner_role_id, request_view_id, TRUE, FALSE, NOW(), NOW())
    ON CONFLICT (role_id, permission_id)
    DO UPDATE SET is_active = TRUE, is_deleted = FALSE, updated_at = NOW();
    
    -- Insert or update request_update permission
    INSERT INTO role_permissions (role_id, permission_id, is_active, is_deleted, created_at, updated_at)
    VALUES (partner_role_id, request_update_id, TRUE, FALSE, NOW(), NOW())
    ON CONFLICT (role_id, permission_id)
    DO UPDATE SET is_active = TRUE, is_deleted = FALSE, updated_at = NOW();
    
    -- Insert or update notification_view permission
    INSERT INTO role_permissions (role_id, permission_id, is_active, is_deleted, created_at, updated_at)
    VALUES (partner_role_id, notification_view_id, TRUE, FALSE, NOW(), NOW())
    ON CONFLICT (role_id, permission_id)
    DO UPDATE SET is_active = TRUE, is_deleted = FALSE, updated_at = NOW();
    
    RAISE NOTICE 'Partner role permissions fixed successfully!';
END $$;

-- 3. Verify partner users have correct role
UPDATE users 
SET role_id = (SELECT id FROM roles WHERE name = 'partner')
WHERE user_type = 'partner'
  AND role_id != (SELECT id FROM roles WHERE name = 'partner');

-- 4. Check final state
SELECT 
    r.name as role_name,
    p.name as permission_name,
    rp.is_active,
    rp.is_deleted
FROM role_permissions rp
JOIN roles r ON r.id = rp.role_id
JOIN permissions p ON p.id = rp.permission_id
WHERE r.name = 'partner'
ORDER BY p.name;

-- 5. Check partner users
SELECT 
    u.id,
    u.name,
    u.email,
    r.name as role_name,
    u.user_type,
    u.is_active
FROM users u
JOIN roles r ON r.id = u.role_id
WHERE u.user_type = 'partner'
  AND u.is_deleted = FALSE;

