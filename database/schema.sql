-- ============================================================
-- TICKETING SYSTEM DATABASE SCHEMA
-- PostgreSQL Schema for Admin Portal
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_type_enum AS ENUM ('admin', 'partner', 'customer');
CREATE TYPE request_status_enum AS ENUM (
    'submitted',
    'assigned',
    'confirmed',
    'in_progress',
    'completed',
    'closed',
    'rejected',
    'unassigned'
);
CREATE TYPE notification_type_enum AS ENUM (
    'request_submitted',
    'request_assigned',
    'request_confirmed',
    'request_rejected',
    'request_in_progress',
    'request_completed',
    'request_closed',
    'partner_timeout',
    'sla_reminder',
    'general'
);
CREATE TYPE assignment_response_enum AS ENUM ('confirmed', 'rejected', 'timeout', 'pending');
CREATE TYPE config_scope_enum AS ENUM ('global', 'partner');
CREATE TYPE partner_status_enum AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE branch_user_role_enum AS ENUM ('branch_manager', 'technician', 'viewer', 'admin');

-- ============================================================
-- CORE IDENTITY & ACCESS CONTROL
-- ============================================================

-- ROLES TABLE
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- PERMISSIONS TABLE
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    user_type user_type_enum NOT NULL,
    partner_id INTEGER, -- FK added later after partners table
    language_preference VARCHAR(5) DEFAULT 'en',
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- USER_PERMISSIONS TABLE (many-to-many)
CREATE TABLE user_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, permission_id)
);

-- ROLE_PERMISSIONS TABLE (many-to-many)
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    UNIQUE(role_id, permission_id)
);

-- USER_SESSIONS TABLE (authentication)
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    refresh_token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    device_info TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- CUSTOMERS TABLE (customer profiles)
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(50) NOT NULL,
    preferred_language VARCHAR(5) DEFAULT 'en',
    profile_picture_url TEXT,
    default_lat DECIMAL(10, 8),
    default_lng DECIMAL(11, 8),
    default_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- PARTNERS & CATALOG
-- ============================================================

-- PARTNERS TABLE
CREATE TABLE partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status partner_status_enum DEFAULT 'active',
    logo_url TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Add partner_id FK to users table
ALTER TABLE users ADD CONSTRAINT fk_users_partner 
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL;

-- BRANCHES TABLE
CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    contact_name VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    radius_km DECIMAL(5, 2) DEFAULT 10.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- BRANCH_USERS TABLE (partner users assigned to branches)
CREATE TABLE branch_users (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role branch_user_role_enum DEFAULT 'viewer',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_by_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    UNIQUE(branch_id, user_id)
);

-- CATEGORIES TABLE
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- PARTNER_CATEGORIES TABLE (many-to-many)
CREATE TABLE partner_categories (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    UNIQUE(partner_id, category_id)
);

-- SERVICES TABLE
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- PICKUP_OPTION_TYPES TABLE (master table for 5 pickup types)
CREATE TABLE pickup_option_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    name_ar VARCHAR(100),
    description TEXT,
    description_ar TEXT,
    requires_service_selection BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- PARTNER_PICKUP_OPTIONS TABLE (which options each partner offers)
CREATE TABLE partner_pickup_options (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    pickup_option_type_id INTEGER NOT NULL REFERENCES pickup_option_types(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    UNIQUE(partner_id, pickup_option_type_id)
);

-- ============================================================
-- REQUESTS & OPERATIONS
-- ============================================================

-- REQUESTS TABLE
CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    request_number VARCHAR(50) NOT NULL UNIQUE,
    
    -- Customer Information
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    customer_phone VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_lat DECIMAL(10, 8) NOT NULL,
    customer_lng DECIMAL(11, 8) NOT NULL,
    customer_address TEXT NOT NULL,
    
    -- Service Selection
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    service_id INTEGER REFERENCES services(id) ON DELETE RESTRICT,
    pickup_option_id INTEGER NOT NULL REFERENCES pickup_option_types(id) ON DELETE RESTRICT,
    
    -- Assignment
    partner_id INTEGER REFERENCES partners(id) ON DELETE SET NULL,
    branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,
    assigned_by_user_id INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    
    -- Status & Lifecycle
    status request_status_enum DEFAULT 'submitted',
    sla_deadline TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    in_progress_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    closed_by_user_id INTEGER REFERENCES users(id),
    
    -- Feedback
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    rated_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- REQUEST_ASSIGNMENTS TABLE (track reassignments)
CREATE TABLE request_assignments (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    assigned_by_user_id INTEGER NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP WITH TIME ZONE,
    response assignment_response_enum DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- REQUEST_STATUS_LOG TABLE (audit trail)
CREATE TABLE request_status_log (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    status request_status_enum NOT NULL,
    changed_by_id INTEGER NOT NULL REFERENCES users(id),
    notes TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255),
    body TEXT NOT NULL,
    body_ar TEXT,
    type notification_type_enum DEFAULT 'general',
    request_id INTEGER REFERENCES requests(id) ON DELETE CASCADE,
    action_url TEXT,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- CONFIGURATION & LOGGING
-- ============================================================

-- CONFIGURATIONS TABLE (hybrid: global and per-partner)
CREATE TABLE configurations (
    id SERIAL PRIMARY KEY,
    scope config_scope_enum DEFAULT 'global',
    partner_id INTEGER REFERENCES partners(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_config_key UNIQUE (scope, partner_id, key),
    CONSTRAINT partner_id_required_for_partner_scope 
        CHECK ((scope = 'partner' AND partner_id IS NOT NULL) OR (scope = 'global' AND partner_id IS NULL))
);

-- LOGS TABLE (system audit logs)
CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    actor_role_id INTEGER REFERENCES roles(id),
    entity_type VARCHAR(100),
    entity_id INTEGER,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_id INTEGER REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email) WHERE is_deleted = FALSE;
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_partner_id ON users(partner_id) WHERE partner_id IS NOT NULL;

-- Sessions indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Customers indexes
CREATE INDEX idx_customers_user_id ON customers(user_id);

-- Partners indexes
CREATE INDEX idx_partners_status ON partners(status) WHERE is_deleted = FALSE;

-- Branches indexes
CREATE INDEX idx_branches_partner_id ON branches(partner_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_branches_lat_lng ON branches(lat, lng);

-- Branch users indexes
CREATE INDEX idx_branch_users_branch_id ON branch_users(branch_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_branch_users_user_id ON branch_users(user_id) WHERE is_deleted = FALSE;

-- Categories indexes
CREATE INDEX idx_categories_active ON categories(is_active) WHERE is_deleted = FALSE;

-- Services indexes
CREATE INDEX idx_services_category_id ON services(category_id) WHERE is_deleted = FALSE;

-- Requests indexes
CREATE INDEX idx_requests_request_number ON requests(request_number);
CREATE INDEX idx_requests_customer_id ON requests(customer_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_partner_id ON requests(partner_id);
CREATE INDEX idx_requests_branch_id ON requests(branch_id);
CREATE INDEX idx_requests_category_id ON requests(category_id);
CREATE INDEX idx_requests_submitted_at ON requests(submitted_at);
CREATE INDEX idx_requests_sla_deadline ON requests(sla_deadline) WHERE status IN ('assigned');
CREATE INDEX idx_requests_created_at ON requests(created_at);

-- Request assignments indexes
CREATE INDEX idx_request_assignments_request_id ON request_assignments(request_id);
CREATE INDEX idx_request_assignments_partner_id ON request_assignments(partner_id);
CREATE INDEX idx_request_assignments_response ON request_assignments(response);

-- Request status log indexes
CREATE INDEX idx_request_status_log_request_id ON request_status_log(request_id);
CREATE INDEX idx_request_status_log_timestamp ON request_status_log(timestamp);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_notifications_read ON notifications(read, user_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_notifications_request_id ON notifications(request_id) WHERE request_id IS NOT NULL;
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Configurations indexes
CREATE INDEX idx_configurations_scope ON configurations(scope) WHERE is_deleted = FALSE;
CREATE INDEX idx_configurations_partner_id ON configurations(partner_id) WHERE partner_id IS NOT NULL;

-- Logs indexes
CREATE INDEX idx_logs_actor_id ON logs(actor_id);
CREATE INDEX idx_logs_entity_type_id ON logs(entity_type, entity_id);
CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_logs_metadata ON logs USING GIN (metadata);

-- ============================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configurations_updated_at BEFORE UPDATE ON configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED DATA QUERIES (for reference)
-- ============================================================
-- These queries are automatically generated by the seed script
-- Run: npm run db:seed to populate the database

-- Note: Permission names and IDs will vary based on insert order
-- The seed script handles this automatically via Drizzle ORM

-- Example: Insert request_update permission (12th permission)
-- INSERT INTO permissions (name, description, created_at, is_active, is_deleted)
-- VALUES ('request_update', 'Update request status (confirm, reject, in-progress, completed)', CURRENT_TIMESTAMP, TRUE, FALSE);

-- Example: Map permissions to Admin role (all 12 permissions)
-- INSERT INTO role_permissions (role_id, permission_id, created_at, is_active, is_deleted)
-- SELECT 
--   (SELECT id FROM roles WHERE name = 'admin'),
--   id,
--   CURRENT_TIMESTAMP,
--   TRUE,
--   FALSE
-- FROM permissions
-- WHERE is_active = TRUE AND is_deleted = FALSE;

-- Example: Map permissions to Operation role (all except config_manage)
-- INSERT INTO role_permissions (role_id, permission_id, created_at, is_active, is_deleted)
-- SELECT 
--   (SELECT id FROM roles WHERE name = 'operation'),
--   id,
--   CURRENT_TIMESTAMP,
--   TRUE,
--   FALSE
-- FROM permissions
-- WHERE name != 'config_manage' AND is_active = TRUE AND is_deleted = FALSE;

-- Example: Map permissions to Partner role (request_view, request_update, notification_view)
-- INSERT INTO role_permissions (role_id, permission_id, created_at, is_active, is_deleted)
-- SELECT 
--   (SELECT id FROM roles WHERE name = 'partner'),
--   id,
--   CURRENT_TIMESTAMP,
--   TRUE,
--   FALSE
-- FROM permissions
-- WHERE name IN ('request_view', 'request_update', 'notification_view')
--   AND is_active = TRUE AND is_deleted = FALSE;

-- Example: Insert Operation user (password hash for 'operation123' - use bcrypt in seed script)
-- INSERT INTO users (name, email, password, role_id, user_type, language_preference, email_verified_at, created_at, is_active, is_deleted)
-- VALUES (
--   'Operation Team Member',
--   'operation@ticketing.com',
--   '$2a$12$[HASH_FROM_BCRYPT]',  -- Replace with actual bcrypt hash from seed script
--   (SELECT id FROM roles WHERE name = 'operation'),
--   'admin',
--   'en',
--   CURRENT_TIMESTAMP,
--   CURRENT_TIMESTAMP,
--   TRUE,
--   FALSE
-- );

-- Note: Customer role has no portal permissions - customers use mobile API only
-- Customer role exists in database but role_permissions table remains empty for customer role

-- ============================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================

COMMENT ON TABLE users IS 'Core users table supporting admin, partner, and customer user types';
COMMENT ON TABLE customers IS 'Extended profile information for customer users';
COMMENT ON TABLE partners IS 'Service partner organizations';
COMMENT ON TABLE branches IS 'Partner branch locations with geolocation data';
COMMENT ON TABLE branch_users IS 'Assignment of partner users to specific branches';
COMMENT ON TABLE requests IS 'Service requests submitted by customers';
COMMENT ON TABLE request_assignments IS 'Tracks assignment history including reassignments';
COMMENT ON TABLE configurations IS 'Hybrid configuration supporting global and per-partner settings';
COMMENT ON COLUMN requests.sla_deadline IS 'Calculated deadline for partner response (typically 15 minutes from assignment)';
COMMENT ON COLUMN configurations.scope IS 'Configuration scope: global applies to all, partner applies to specific partner';

-- ============================================================
-- END OF SCHEMA
-- ============================================================

