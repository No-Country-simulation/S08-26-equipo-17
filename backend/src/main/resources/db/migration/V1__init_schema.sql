CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. BUILDINGS
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    total_units INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. UNITS
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE RESTRICT,
    block VARCHAR(50),
    number_code VARCHAR(20) NOT NULL,
    floor INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_building_unit UNIQUE (building_id, block, number_code)
);

-- 3. USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(20) NOT NULL DEFAULT 'RESIDENT' CHECK (role IN ('ADMIN', 'CONCIERGE', 'RESIDENT')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. USER_UNITS
CREATE TABLE user_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    relationship_type VARCHAR(20) NOT NULL DEFAULT 'TENANT' CHECK (relationship_type IN ('OWNER', 'TENANT', 'FAMILY_MEMBER')),
    is_primary BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_user_unit UNIQUE (user_id, unit_id)
);

-- 5. ACCESS_AUTHORIZATIONS
CREATE TABLE access_authorizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
    created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    visitor_name VARCHAR(120) NOT NULL,
    visitor_document VARCHAR(30),
    token_code VARCHAR(64) NOT NULL UNIQUE,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'USED', 'EXPIRED', 'REVOKED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. ACCESS_LOGS
CREATE TABLE access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    authorization_id UUID REFERENCES access_authorizations(id) ON DELETE SET NULL,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
    visitor_name VARCHAR(120) NOT NULL,
    visitor_document VARCHAR(30),
    direction VARCHAR(10) NOT NULL DEFAULT 'ENTRY' CHECK (direction IN ('ENTRY', 'EXIT')),
    checked_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    notes TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. PACKAGE_DELIVERIES
CREATE TABLE package_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
    received_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    package_type VARCHAR(30) NOT NULL DEFAULT 'PARCEL' CHECK (package_type IN ('PARCEL', 'PACKAGE', 'MAIL', 'EXPRESS_DELIVERY')),
    carrier_name VARCHAR(100) NOT NULL,
    tracking_code VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING_PICKUP' CHECK (status IN ('PENDING_PICKUP', 'DELIVERED')),
    received_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    picked_up_at TIMESTAMPTZ,
    picked_up_by_name VARCHAR(120),
    pickup_operator_user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 8. COMMON_AREAS
CREATE TABLE common_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    max_capacity INTEGER NOT NULL DEFAULT 10,
    open_time TIME NOT NULL DEFAULT '08:00:00',
    close_time TIME NOT NULL DEFAULT '22:00:00',
    rules_text TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 9. RESERVATIONS
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    common_area_id UUID NOT NULL REFERENCES common_areas(id) ON DELETE RESTRICT,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_reservation_interval CHECK (end_time > start_time)
);

-- 10. MOVE_SCHEDULES
CREATE TABLE move_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    move_type VARCHAR(10) NOT NULL DEFAULT 'IN' CHECK (move_type IN ('IN', 'OUT')),
    scheduled_date DATE NOT NULL,
    shift VARCHAR(20) NOT NULL DEFAULT 'MORNING' CHECK (shift IN ('MORNING', 'AFTERNOON')),
    status VARCHAR(20) NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. INCIDENT_TICKETS
CREATE TABLE incident_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    common_area_id UUID REFERENCES common_areas(id) ON DELETE SET NULL,
    created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    photo_url VARCHAR(255),
    category VARCHAR(30) NOT NULL DEFAULT 'OTHER' CHECK (category IN ('ELECTRICAL', 'PLUMBING', 'STRUCTURAL', 'SECURITY', 'CLEANING', 'OTHER')),
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ
);

-- 12. AUDIT_LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    module VARCHAR(30) NOT NULL CHECK (module IN ('ACCESS', 'PACKAGE', 'RESERVATION', 'MOVE', 'MAINTENANCE', 'UNIT', 'AUTH')),
    action VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- PERFORMANCE & SEARCH INDEXES
CREATE INDEX idx_access_authorizations_token ON access_authorizations(token_code);
CREATE INDEX idx_access_authorizations_unit_status ON access_authorizations(unit_id, status);
CREATE INDEX idx_audit_logs_unit_timestamp ON audit_logs(unit_id, timestamp DESC);
CREATE INDEX idx_package_deliveries_unit_status ON package_deliveries(unit_id, status);
CREATE INDEX idx_reservations_unit ON reservations(unit_id, start_time DESC);
CREATE INDEX idx_reservations_conflict ON reservations(common_area_id, status, start_time, end_time);
CREATE INDEX idx_incident_tickets_unit_status ON incident_tickets(unit_id, status);
