-- ============================================================
-- SQL Script to Create Admin Account in PostgreSQL
-- Based on seed.ts configuration
-- ============================================================
-- 
-- Admin credentials:
-- Email: admin@ticketing.com
-- Password: Admin123!
-- ============================================================

-- Step 1: Create admin role if it doesn't exist
INSERT INTO roles (name, description, created_at, is_active, is_deleted)
SELECT 
    'admin',
    'System administrator with full access',
    CURRENT_TIMESTAMP,
    TRUE,
    FALSE
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE name = 'admin' AND is_deleted = FALSE
);

-- Step 2: Create admin user if it doesn't exist
INSERT INTO users (
    name,
    email,
    password,
    role_id,
    user_type,
    language_preference,
    email_verified_at,
    created_at,
    is_active,
    is_deleted
)
SELECT 
    'System Administrator',
    'admin@ticketing.com',
    '$2b$12$1ZB0A.kz9wXsm5waCitF/.5HPyqI2/c4iKno29mSKKCny8FciuCXK', -- bcrypt hash for "Admin123!"
    (SELECT id FROM roles WHERE name = 'admin' AND is_deleted = FALSE LIMIT 1),
    'admin',
    'en',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    TRUE,
    FALSE
WHERE NOT EXISTS (
    SELECT 1 FROM users 
    WHERE email = 'admin@ticketing.com' 
    AND is_deleted = FALSE
);

-- Step 3: Update password if user already exists (ensures correct password)
UPDATE users
SET password = '$2b$12$1ZB0A.kz9wXsm5waCitF/.5HPyqI2/c4iKno29mSKKCny8FciuCXK',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@ticketing.com'
AND is_deleted = FALSE
AND password != '$2b$12$1ZB0A.kz9wXsm5waCitF/.5HPyqI2/c4iKno29mSKKCny8FciuCXK';

-- Step 4: Verify the admin account
SELECT 
    u.id,
    u.name,
    u.email,
    u.user_type,
    r.name as role_name,
    u.email_verified_at,
    u.created_at
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE u.email = 'admin@ticketing.com'
AND u.is_deleted = FALSE;

-- ============================================================
-- Done! Login credentials:
-- Email: admin@ticketing.com
-- Password: Admin123!
-- ============================================================

