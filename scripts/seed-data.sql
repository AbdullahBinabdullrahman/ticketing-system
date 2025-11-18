-- ============================================================
-- COMPLETE SEED DATA SCRIPT
-- Based on lib/db/seed.ts
-- ============================================================
-- 
-- This script inserts all seed data:
-- - Roles (admin, operational, partner, customer)
-- - Permissions (12 permissions)
-- - Role-permission mappings
-- - Users (operational, partner users, external customer)
-- - Partners (3 companies)
-- - Branches (7 branches)
-- - Pickup option types (5 types)
-- - Categories (4 categories)
-- - Services (6 services)
-- - Configurations (5 global configs)
-- - External customer profile
--
-- Usage: psql -U your_user -d your_database -f scripts/seed-data.sql
-- ============================================================

DO $$
DECLARE
    admin_role_id INTEGER;
    operation_role_id INTEGER;
    partner_role_id INTEGER;
    customer_role_id INTEGER;
    admin_user_id INTEGER;
    operation_user_id INTEGER;
    quick_fix_partner_id INTEGER;
    express_auto_partner_id INTEGER;
    pro_tire_partner_id INTEGER;
    external_customer_user_id INTEGER;
    external_customer_id INTEGER;
    car_maintenance_category_id INTEGER;
    tires_category_id INTEGER;
    oil_change_category_id INTEGER;
    battery_category_id INTEGER;
BEGIN
    -- ============================================================
    -- 1. CREATE ROLES
    -- ============================================================
    RAISE NOTICE 'Creating roles...';
    
    -- Admin role (should already exist from create-admin-account.sql)
    SELECT id INTO admin_role_id FROM roles WHERE name = 'admin' AND is_deleted = FALSE LIMIT 1;
    IF admin_role_id IS NULL THEN
        INSERT INTO roles (name, description, created_at, is_active, is_deleted)
        VALUES ('admin', 'System administrator with full access', CURRENT_TIMESTAMP, TRUE, FALSE)
        RETURNING id INTO admin_role_id;
    END IF;
    
    -- Operational role
    SELECT id INTO operation_role_id FROM roles WHERE name = 'operational' AND is_deleted = FALSE LIMIT 1;
    IF operation_role_id IS NULL THEN
        INSERT INTO roles (name, description, created_at, is_active, is_deleted)
        VALUES ('operational', 'Operations team member', CURRENT_TIMESTAMP, TRUE, FALSE)
        RETURNING id INTO operation_role_id;
    END IF;
    
    -- Partner role
    SELECT id INTO partner_role_id FROM roles WHERE name = 'partner' AND is_deleted = FALSE LIMIT 1;
    IF partner_role_id IS NULL THEN
        INSERT INTO roles (name, description, created_at, is_active, is_deleted)
        VALUES ('partner', 'Service partner user', CURRENT_TIMESTAMP, TRUE, FALSE)
        RETURNING id INTO partner_role_id;
    END IF;
    
    -- Customer role
    SELECT id INTO customer_role_id FROM roles WHERE name = 'customer' AND is_deleted = FALSE LIMIT 1;
    IF customer_role_id IS NULL THEN
        INSERT INTO roles (name, description, created_at, is_active, is_deleted)
        VALUES ('customer', 'Customer user', CURRENT_TIMESTAMP, TRUE, FALSE)
        RETURNING id INTO customer_role_id;
    END IF;
    
    -- Get admin user ID (should already exist)
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@ticketing.com' AND is_deleted = FALSE LIMIT 1;
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Admin user not found. Please run create-admin-account.sql first.';
    END IF;
    
    -- ============================================================
    -- 2. CREATE PERMISSIONS
    -- ============================================================
    RAISE NOTICE 'Creating permissions...';
    
    INSERT INTO permissions (name, description, created_at, is_active, is_deleted)
    SELECT * FROM (VALUES
        ('user_manage', 'Manage users', CURRENT_TIMESTAMP, TRUE, FALSE),
        ('partner_manage', 'Manage partners', CURRENT_TIMESTAMP, TRUE, FALSE),
        ('branch_manage', 'Manage branches', CURRENT_TIMESTAMP, TRUE, FALSE),
        ('category_manage', 'Manage categories', CURRENT_TIMESTAMP, TRUE, FALSE),
        ('service_manage', 'Manage services', CURRENT_TIMESTAMP, TRUE, FALSE),
        ('request_view', 'View requests', CURRENT_TIMESTAMP, TRUE, FALSE),
        ('request_assign', 'Assign requests', CURRENT_TIMESTAMP, TRUE, FALSE),
        ('request_update', 'Update request status (confirm, reject, in-progress, completed)', CURRENT_TIMESTAMP, TRUE, FALSE),
        ('request_close', 'Close requests', CURRENT_TIMESTAMP, TRUE, FALSE),
        ('reports_view', 'View reports', CURRENT_TIMESTAMP, TRUE, FALSE),
        ('config_manage', 'Manage configurations', CURRENT_TIMESTAMP, TRUE, FALSE),
        ('notification_view', 'View notifications', CURRENT_TIMESTAMP, TRUE, FALSE)
    ) AS v(name, description, created_at, is_active, is_deleted)
    WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE permissions.name = v.name AND is_deleted = FALSE);
    
    -- ============================================================
    -- 3. CREATE ROLE-PERMISSION MAPPINGS
    -- ============================================================
    RAISE NOTICE 'Mapping permissions to roles...';
    
    -- Admin role: All 12 permissions
    INSERT INTO role_permissions (role_id, permission_id, created_by_id, created_at, is_active, is_deleted)
    SELECT admin_role_id, p.id, admin_user_id, CURRENT_TIMESTAMP, TRUE, FALSE
    FROM permissions p
    WHERE p.is_deleted = FALSE
    AND NOT EXISTS (
        SELECT 1 FROM role_permissions rp 
        WHERE rp.role_id = admin_role_id 
        AND rp.permission_id = p.id 
        AND rp.is_deleted = FALSE
    );
    
    -- Operation role: All except config_manage (11 permissions)
    INSERT INTO role_permissions (role_id, permission_id, created_by_id, created_at, is_active, is_deleted)
    SELECT operation_role_id, p.id, admin_user_id, CURRENT_TIMESTAMP, TRUE, FALSE
    FROM permissions p
    WHERE p.name != 'config_manage' AND p.is_deleted = FALSE
    AND NOT EXISTS (
        SELECT 1 FROM role_permissions rp 
        WHERE rp.role_id = operation_role_id 
        AND rp.permission_id = p.id 
        AND rp.is_deleted = FALSE
    );
    
    -- Partner role: request_view, request_update, notification_view
    INSERT INTO role_permissions (role_id, permission_id, created_by_id, created_at, is_active, is_deleted)
    SELECT partner_role_id, p.id, admin_user_id, CURRENT_TIMESTAMP, TRUE, FALSE
    FROM permissions p
    WHERE p.name IN ('request_view', 'request_update', 'notification_view')
    AND p.is_deleted = FALSE
    AND NOT EXISTS (
        SELECT 1 FROM role_permissions rp 
        WHERE rp.role_id = partner_role_id 
        AND rp.permission_id = p.id 
        AND rp.is_deleted = FALSE
    );
    
    -- Customer role: No portal permissions (mobile API only)
    
    -- ============================================================
    -- 4. CREATE OPERATIONAL USER
    -- ============================================================
    RAISE NOTICE 'Creating operational user...';
    
    INSERT INTO users (name, email, password, role_id, user_type, language_preference, email_verified_at, created_at, is_active, is_deleted)
    SELECT 
        'Operation Team Member',
        'operation@ticketing.com',
        '$2b$12$RuIGg4GSG7kgrUP3azYmH.kMVyiMoZQBtUiy8JamDAUJHxpdJPDuu', -- bcrypt hash for "operation123"
        operation_role_id,
        'admin'::user_type_enum,
        'en',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        TRUE,
        FALSE
    WHERE NOT EXISTS (
        SELECT 1 FROM users WHERE email = 'operation@ticketing.com' AND is_deleted = FALSE
    )
    RETURNING id INTO operation_user_id;
    
    -- Update password if user exists
    UPDATE users
    SET password = '$2b$12$RuIGg4GSG7kgrUP3azYmH.kMVyiMoZQBtUiy8JamDAUJHxpdJPDuu',
        updated_at = CURRENT_TIMESTAMP
    WHERE email = 'operation@ticketing.com' AND is_deleted = FALSE;
    
    SELECT id INTO operation_user_id FROM users WHERE email = 'operation@ticketing.com' AND is_deleted = FALSE LIMIT 1;
    
    -- ============================================================
    -- 5. CREATE PARTNERS
    -- ============================================================
    RAISE NOTICE 'Creating partner companies...';
    
    -- Quick Fix Auto Services
    INSERT INTO partners (name, status, contact_email, contact_phone, created_by_id, created_at, is_active, is_deleted)
    SELECT 'Quick Fix Auto Services', 'active'::partner_status_enum, 'contact@quickfix.com', '+966501111111', admin_user_id, CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM partners WHERE contact_email = 'contact@quickfix.com' AND is_deleted = FALSE)
    RETURNING id INTO quick_fix_partner_id;
    
    SELECT id INTO quick_fix_partner_id FROM partners WHERE contact_email = 'contact@quickfix.com' AND is_deleted = FALSE LIMIT 1;
    
    -- Express Auto Care
    INSERT INTO partners (name, status, contact_email, contact_phone, created_by_id, created_at, is_active, is_deleted)
    SELECT 'Express Auto Care', 'active'::partner_status_enum, 'info@expressauto.com', '+966502222222', admin_user_id, CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM partners WHERE contact_email = 'info@expressauto.com' AND is_deleted = FALSE)
    RETURNING id INTO express_auto_partner_id;
    
    SELECT id INTO express_auto_partner_id FROM partners WHERE contact_email = 'info@expressauto.com' AND is_deleted = FALSE LIMIT 1;
    
    -- Pro Tire Services
    INSERT INTO partners (name, status, contact_email, contact_phone, created_by_id, created_at, is_active, is_deleted)
    SELECT 'Pro Tire Services', 'active'::partner_status_enum, 'contact@protire.com', '+966503333333', admin_user_id, CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM partners WHERE contact_email = 'contact@protire.com' AND is_deleted = FALSE)
    RETURNING id INTO pro_tire_partner_id;
    
    SELECT id INTO pro_tire_partner_id FROM partners WHERE contact_email = 'contact@protire.com' AND is_deleted = FALSE LIMIT 1;
    
    -- ============================================================
    -- 6. CREATE BRANCHES
    -- ============================================================
    RAISE NOTICE 'Creating partner branches...';
    
    -- Quick Fix branches
    INSERT INTO branches (partner_id, name, lat, lng, contact_name, phone, address, radius_km, created_by_id, created_at, is_active, is_deleted)
    SELECT quick_fix_partner_id, 'Main Branch', 24.7136, 46.6753, 'Main Branch Manager', '+966501111112', 'Riyadh Center, Riyadh, Saudi Arabia', 15.0, admin_user_id, CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM branches WHERE partner_id = quick_fix_partner_id AND name = 'Main Branch' AND is_deleted = FALSE);
    
    INSERT INTO branches (partner_id, name, lat, lng, contact_name, phone, address, radius_km, created_by_id, created_at, is_active, is_deleted)
    SELECT quick_fix_partner_id, 'North Branch', 24.8000, 46.6753, 'North Branch Manager', '+966501111113', 'North Riyadh, Riyadh, Saudi Arabia', 10.0, admin_user_id, CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM branches WHERE partner_id = quick_fix_partner_id AND name = 'North Branch' AND is_deleted = FALSE);
    
    INSERT INTO branches (partner_id, name, lat, lng, contact_name, phone, address, radius_km, created_by_id, created_at, is_active, is_deleted)
    SELECT quick_fix_partner_id, 'East Branch', 24.7136, 46.7500, 'East Branch Manager', '+966501111114', 'East Riyadh, Riyadh, Saudi Arabia', 10.0, admin_user_id, CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM branches WHERE partner_id = quick_fix_partner_id AND name = 'East Branch' AND is_deleted = FALSE);
    
    -- Express Auto branches
    INSERT INTO branches (partner_id, name, lat, lng, contact_name, phone, address, radius_km, created_by_id, created_at, is_active, is_deleted)
    SELECT express_auto_partner_id, 'Downtown Branch', 24.6877, 46.6857, 'Downtown Manager', '+966502222223', 'Al Olaya, Riyadh, Saudi Arabia', 12.0, admin_user_id, CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM branches WHERE partner_id = express_auto_partner_id AND name = 'Downtown Branch' AND is_deleted = FALSE);
    
    INSERT INTO branches (partner_id, name, lat, lng, contact_name, phone, address, radius_km, created_by_id, created_at, is_active, is_deleted)
    SELECT express_auto_partner_id, 'West Branch', 24.7136, 46.6000, 'West Branch Manager', '+966502222224', 'West Riyadh, Riyadh, Saudi Arabia', 10.0, admin_user_id, CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM branches WHERE partner_id = express_auto_partner_id AND name = 'West Branch' AND is_deleted = FALSE);
    
    -- Pro Tire branches
    INSERT INTO branches (partner_id, name, lat, lng, contact_name, phone, address, radius_km, created_by_id, created_at, is_active, is_deleted)
    SELECT pro_tire_partner_id, 'Main Service Center', 24.7265, 46.7296, 'Service Center Manager', '+966503333334', 'Al Malaz, Riyadh, Saudi Arabia', 15.0, admin_user_id, CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM branches WHERE partner_id = pro_tire_partner_id AND name = 'Main Service Center' AND is_deleted = FALSE);
    
    INSERT INTO branches (partner_id, name, lat, lng, contact_name, phone, address, radius_km, created_by_id, created_at, is_active, is_deleted)
    SELECT pro_tire_partner_id, 'South Branch', 24.6500, 46.6753, 'South Branch Manager', '+966503333335', 'South Riyadh, Riyadh, Saudi Arabia', 10.0, admin_user_id, CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM branches WHERE partner_id = pro_tire_partner_id AND name = 'South Branch' AND is_deleted = FALSE);
    
    -- ============================================================
    -- 7. CREATE PARTNER USERS
    -- ============================================================
    RAISE NOTICE 'Creating partner users...';
    
    -- Quick Fix user
    INSERT INTO users (name, email, password, role_id, user_type, partner_id, language_preference, email_verified_at, created_at, is_active, is_deleted)
    SELECT 'Quick Fix Manager', 'partner@quickfix.com', '$2b$12$GEyUcKwPfdDrBPEyhXs4W.aimAGCfKE3N4rcKCfteOkpKWMxJnJhK', partner_role_id, 'partner'::user_type_enum, quick_fix_partner_id, 'en', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'partner@quickfix.com' AND is_deleted = FALSE);
    
    -- Express Auto user
    INSERT INTO users (name, email, password, role_id, user_type, partner_id, language_preference, email_verified_at, created_at, is_active, is_deleted)
    SELECT 'Express Auto Manager', 'partner@expressauto.com', '$2b$12$GEyUcKwPfdDrBPEyhXs4W.aimAGCfKE3N4rcKCfteOkpKWMxJnJhK', partner_role_id, 'partner'::user_type_enum, express_auto_partner_id, 'en', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'partner@expressauto.com' AND is_deleted = FALSE);
    
    -- Pro Tire user
    INSERT INTO users (name, email, password, role_id, user_type, partner_id, language_preference, email_verified_at, created_at, is_active, is_deleted)
    SELECT 'Pro Tire Manager', 'partner@protire.com', '$2b$12$GEyUcKwPfdDrBPEyhXs4W.aimAGCfKE3N4rcKCfteOkpKWMxJnJhK', partner_role_id, 'partner'::user_type_enum, pro_tire_partner_id, 'en', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'partner@protire.com' AND is_deleted = FALSE);
    
    -- ============================================================
    -- 8. CREATE PICKUP OPTION TYPES
    -- ============================================================
    RAISE NOTICE 'Creating pickup option types...';
    
    INSERT INTO pickup_option_types (name, name_ar, description, description_ar, requires_service_selection, created_at, is_active, is_deleted)
    SELECT * FROM (VALUES
        ('Pickup Only', 'استلام فقط', 'Customer brings vehicle to partner location', 'العميل يجلب المركبة إلى موقع الشريك', FALSE, CURRENT_TIMESTAMP, TRUE, FALSE),
        ('Pickup and Return', 'استلام وإرجاع', 'Partner picks up and returns vehicle', 'الشريك يستلم ويرجع المركبة', FALSE, CURRENT_TIMESTAMP, TRUE, FALSE),
        ('Emergency Pickup', 'استلام طارئ', 'Urgent pickup service', 'خدمة استلام طارئة', FALSE, CURRENT_TIMESTAMP, TRUE, FALSE),
        ('Drop-off In Center', 'تسليم في المركز', 'Customer drops off at service center', 'العميل يسلم في مركز الخدمة', TRUE, CURRENT_TIMESTAMP, TRUE, FALSE),
        ('Service At Location', 'خدمة في الموقع', 'Service provided at customer location', 'الخدمة مقدمة في موقع العميل', TRUE, CURRENT_TIMESTAMP, TRUE, FALSE)
    ) AS v(name, name_ar, description, description_ar, requires_service_selection, created_at, is_active, is_deleted)
    WHERE NOT EXISTS (SELECT 1 FROM pickup_option_types WHERE pickup_option_types.name = v.name AND is_deleted = FALSE);
    
    -- ============================================================
    -- 9. CREATE CATEGORIES
    -- ============================================================
    RAISE NOTICE 'Creating categories...';
    
    INSERT INTO categories (name, name_ar, description, description_ar, created_at, is_active, is_deleted)
    SELECT 'Car Maintenance', 'صيانة السيارات', 'General car maintenance services', 'خدمات الصيانة العامة للسيارات', CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Car Maintenance' AND is_deleted = FALSE)
    RETURNING id INTO car_maintenance_category_id;
    
    SELECT id INTO car_maintenance_category_id FROM categories WHERE name = 'Car Maintenance' AND is_deleted = FALSE LIMIT 1;
    
    INSERT INTO categories (name, name_ar, description, description_ar, created_at, is_active, is_deleted)
    SELECT 'Tires', 'الإطارات', 'Tire related services', 'الخدمات المتعلقة بالإطارات', CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Tires' AND is_deleted = FALSE)
    RETURNING id INTO tires_category_id;
    
    SELECT id INTO tires_category_id FROM categories WHERE name = 'Tires' AND is_deleted = FALSE LIMIT 1;
    
    INSERT INTO categories (name, name_ar, description, description_ar, created_at, is_active, is_deleted)
    SELECT 'Oil Change', 'تغيير الزيت', 'Oil change services', 'خدمات تغيير الزيت', CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Oil Change' AND is_deleted = FALSE)
    RETURNING id INTO oil_change_category_id;
    
    SELECT id INTO oil_change_category_id FROM categories WHERE name = 'Oil Change' AND is_deleted = FALSE LIMIT 1;
    
    INSERT INTO categories (name, name_ar, description, description_ar, created_at, is_active, is_deleted)
    SELECT 'Battery', 'البطارية', 'Battery services', 'خدمات البطارية', CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Battery' AND is_deleted = FALSE)
    RETURNING id INTO battery_category_id;
    
    SELECT id INTO battery_category_id FROM categories WHERE name = 'Battery' AND is_deleted = FALSE LIMIT 1;
    
    -- ============================================================
    -- 10. CREATE SERVICES
    -- ============================================================
    RAISE NOTICE 'Creating services...';
    
    INSERT INTO services (category_id, name, name_ar, description, description_ar, created_at, is_active, is_deleted)
    SELECT car_maintenance_category_id, 'General Inspection', 'فحص عام', 'Complete vehicle inspection', 'فحص شامل للمركبة', CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM services WHERE category_id = car_maintenance_category_id AND name = 'General Inspection' AND is_deleted = FALSE);
    
    INSERT INTO services (category_id, name, name_ar, description, description_ar, created_at, is_active, is_deleted)
    SELECT car_maintenance_category_id, 'Brake Service', 'خدمة الفرامل', 'Brake system maintenance', 'صيانة نظام الفرامل', CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM services WHERE category_id = car_maintenance_category_id AND name = 'Brake Service' AND is_deleted = FALSE);
    
    INSERT INTO services (category_id, name, name_ar, description, description_ar, created_at, is_active, is_deleted)
    SELECT tires_category_id, 'Tire Replacement', 'استبدال الإطارات', 'Replace old tires with new ones', 'استبدال الإطارات القديمة بأخرى جديدة', CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM services WHERE category_id = tires_category_id AND name = 'Tire Replacement' AND is_deleted = FALSE);
    
    INSERT INTO services (category_id, name, name_ar, description, description_ar, created_at, is_active, is_deleted)
    SELECT tires_category_id, 'Tire Repair', 'إصلاح الإطارات', 'Repair punctured or damaged tires', 'إصلاح الإطارات المثقوبة أو التالفة', CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM services WHERE category_id = tires_category_id AND name = 'Tire Repair' AND is_deleted = FALSE);
    
    INSERT INTO services (category_id, name, name_ar, description, description_ar, created_at, is_active, is_deleted)
    SELECT oil_change_category_id, 'Engine Oil Change', 'تغيير زيت المحرك', 'Replace engine oil and filter', 'استبدال زيت المحرك والفلتر', CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM services WHERE category_id = oil_change_category_id AND name = 'Engine Oil Change' AND is_deleted = FALSE);
    
    INSERT INTO services (category_id, name, name_ar, description, description_ar, created_at, is_active, is_deleted)
    SELECT battery_category_id, 'Battery Replacement', 'استبدال البطارية', 'Replace car battery', 'استبدال بطارية السيارة', CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM services WHERE category_id = battery_category_id AND name = 'Battery Replacement' AND is_deleted = FALSE);
    
    INSERT INTO services (category_id, name, name_ar, description, description_ar, created_at, is_active, is_deleted)
    SELECT battery_category_id, 'Battery Testing', 'فحص البطارية', 'Test battery health and charge', 'فحص صحة البطارية وشحنها', CURRENT_TIMESTAMP, TRUE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM services WHERE category_id = battery_category_id AND name = 'Battery Testing' AND is_deleted = FALSE);
    
    -- ============================================================
    -- 11. CREATE CONFIGURATIONS
    -- ============================================================
    RAISE NOTICE 'Creating global configurations...';
    
    INSERT INTO configurations (scope, key, value, description, created_at, is_active, is_deleted)
    SELECT * FROM (VALUES
        ('global'::config_scope_enum, 'sla_timeout_minutes', '15', 'Default SLA timeout in minutes for partner response', CURRENT_TIMESTAMP, TRUE, FALSE),
        ('global'::config_scope_enum, 'reminder_time_minutes', '10', 'Time in minutes before SLA deadline to send reminder', CURRENT_TIMESTAMP, TRUE, FALSE),
        ('global'::config_scope_enum, 'notification_retention_days', '30', 'Number of days to keep notifications', CURRENT_TIMESTAMP, TRUE, FALSE),
        ('global'::config_scope_enum, 'max_file_size_mb', '10', 'Maximum file upload size in MB', CURRENT_TIMESTAMP, TRUE, FALSE),
        ('global'::config_scope_enum, 'default_language', 'en', 'Default system language', CURRENT_TIMESTAMP, TRUE, FALSE)
    ) AS v(scope, key, value, description, created_at, is_active, is_deleted)
    WHERE NOT EXISTS (SELECT 1 FROM configurations WHERE configurations.scope = v.scope AND configurations.key = v.key AND is_deleted = FALSE);
    
    -- ============================================================
    -- 12. CREATE EXTERNAL CUSTOMER
    -- ============================================================
    RAISE NOTICE 'Creating external customer...';
    
    -- Generate a random password hash (using a fixed one for consistency)
    -- In production, this would be a random secure password
    INSERT INTO users (name, email, password, role_id, user_type, language_preference, email_verified_at, created_at, is_active, is_deleted)
    SELECT 
        'External Customer (System)',
        'external@system.internal',
        '$2b$12$dkp6Ek9FVbE49mdgfvvey.XuZiYX8.nQ/hRWnkO6ruiJ0VsHc1KKa', -- bcrypt hash for external customer
        customer_role_id,
        'customer'::user_type_enum,
        'en',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        TRUE,
        FALSE
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'external@system.internal' AND is_deleted = FALSE)
    RETURNING id INTO external_customer_user_id;
    
    SELECT id INTO external_customer_user_id FROM users WHERE email = 'external@system.internal' AND is_deleted = FALSE LIMIT 1;
    
    -- Create customer profile
    INSERT INTO customers (user_id, phone, preferred_language, created_at, is_active)
    SELECT external_customer_user_id, '+966000000000', 'en', CURRENT_TIMESTAMP, TRUE
    WHERE NOT EXISTS (SELECT 1 FROM customers WHERE user_id = external_customer_user_id)
    RETURNING id INTO external_customer_id;
    
    SELECT id INTO external_customer_id FROM customers WHERE user_id = external_customer_user_id LIMIT 1;
    
    RAISE NOTICE '✅ Database seeding completed successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Created Users:';
    RAISE NOTICE '  - Admin user: admin@ticketing.com / Admin123!';
    RAISE NOTICE '  - Operation user: operation@ticketing.com / operation123';
    RAISE NOTICE '';
    RAISE NOTICE '👥 Partner Users:';
    RAISE NOTICE '  - Quick Fix: partner@quickfix.com / Partner123!';
    RAISE NOTICE '  - Express Auto: partner@expressauto.com / Partner123!';
    RAISE NOTICE '  - Pro Tire: partner@protire.com / Partner123!';
    RAISE NOTICE '';
    RAISE NOTICE '🏢 Partner Companies:';
    RAISE NOTICE '  - Quick Fix Auto Services (3 branches)';
    RAISE NOTICE '  - Express Auto Care (2 branches)';
    RAISE NOTICE '  - Pro Tire Services (2 branches)';
    RAISE NOTICE '';
    RAISE NOTICE '📍 Total Branches: 7';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Role Permissions:';
    RAISE NOTICE '  - Admin: All 12 permissions (full access)';
    RAISE NOTICE '  - Operation: 11 permissions (all except config_manage)';
    RAISE NOTICE '  - Partner: request_view, request_update, notification_view';
    RAISE NOTICE '  - Customer: No portal permissions (mobile API only)';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 External Customer:';
    RAISE NOTICE '  - Customer ID: %', external_customer_id;
    RAISE NOTICE '  - Email: external@system.internal';
    RAISE NOTICE '';
    RAISE NOTICE '📋 IMPORTANT: Add this to your .env file:';
    RAISE NOTICE 'EXTERNAL_CUSTOMER_ID=%', external_customer_id;
    
END $$;

-- Verification queries
SELECT 'Roles' as type, COUNT(*) as count FROM roles WHERE is_deleted = FALSE
UNION ALL
SELECT 'Permissions', COUNT(*) FROM permissions WHERE is_deleted = FALSE
UNION ALL
SELECT 'Users', COUNT(*) FROM users WHERE is_deleted = FALSE
UNION ALL
SELECT 'Partners', COUNT(*) FROM partners WHERE is_deleted = FALSE
UNION ALL
SELECT 'Branches', COUNT(*) FROM branches WHERE is_deleted = FALSE
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories WHERE is_deleted = FALSE
UNION ALL
SELECT 'Services', COUNT(*) FROM services WHERE is_deleted = FALSE
UNION ALL
SELECT 'Pickup Options', COUNT(*) FROM pickup_option_types WHERE is_deleted = FALSE
UNION ALL
SELECT 'Configurations', COUNT(*) FROM configurations WHERE is_deleted = FALSE
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers WHERE is_active = TRUE;

-- ============================================================
-- SEED DATA COMPLETE!
-- ============================================================

