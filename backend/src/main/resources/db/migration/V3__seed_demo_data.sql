-- V3: compatibility view unit_residents + demo data.
-- Canonical table: user_units (V1). This view exposes the alias unit_residents
-- requested by the "User Profiles and Resident-Unit Association" module.
CREATE OR REPLACE VIEW unit_residents AS
SELECT id, user_id, unit_id, relationship_type, is_primary
FROM user_units;

-- Default demo password for all seeded users: 'password123'
-- BCrypt hash: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36

-- 1. Demo condominium
INSERT INTO buildings (id, name, address, total_units) VALUES
('b2000000-0000-0000-0000-000000000001', 'Southern Gardens Condominium', '456 Pine Street, Demo City', 4)
ON CONFLICT (id) DO NOTHING;

-- 2. Demo units
INSERT INTO units (id, building_id, block, number_code, floor) VALUES
('u2000000-0000-0000-0000-000000000101', 'b2000000-0000-0000-0000-000000000001', 'Block B', '101', 1),
('u2000000-0000-0000-0000-000000000102', 'b2000000-0000-0000-0000-000000000001', 'Block B', '102', 1),
('u2000000-0000-0000-0000-000000000201', 'b2000000-0000-0000-0000-000000000001', 'Block B', '201', 2),
('u2000000-0000-0000-0000-000000000202', 'b2000000-0000-0000-0000-000000000001', 'Block B', '202', 2)
ON CONFLICT (id) DO NOTHING;

-- 3. Sample front-desk (concierge) staff
INSERT INTO users (id, name, email, password_hash, phone, role) VALUES
('p2000000-0000-0000-0000-000000000001', 'Ana Concierge Morning Shift', 'ana.concierge@condotrack.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36', '+5501999990101', 'CONCIERGE'),
('p2000000-0000-0000-0000-000000000002', 'Diego Concierge Night Shift', 'diego.concierge@condotrack.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36', '+5501999990102', 'CONCIERGE')
ON CONFLICT (id) DO NOTHING;

-- 4. Sample residents
INSERT INTO users (id, name, email, password_hash, phone, role) VALUES
('m2000000-0000-0000-0000-000000000001', 'Sofia Resident', 'sofia@condotrack.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36', '+5501999990201', 'RESIDENT'),
('m2000000-0000-0000-0000-000000000002', 'Martin Resident', 'martin@condotrack.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36', '+5501999990202', 'RESIDENT'),
('m2000000-0000-0000-0000-000000000003', 'Valentina Family Member', 'valentina@condotrack.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36', '+5501999990203', 'RESIDENT'),
('m2000000-0000-0000-0000-000000000004', 'Pablo Owner', 'pablo@condotrack.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36', '+5501999990204', 'RESIDENT')
ON CONFLICT (id) DO NOTHING;

-- 5. Sample resident-unit associations
INSERT INTO user_units (user_id, unit_id, relationship_type, is_primary) VALUES
('m2000000-0000-0000-0000-000000000001', 'u2000000-0000-0000-0000-000000000101', 'OWNER', TRUE),
('m2000000-0000-0000-0000-000000000003', 'u2000000-0000-0000-0000-000000000101', 'FAMILY_MEMBER', FALSE),
('m2000000-0000-0000-0000-000000000002', 'u2000000-0000-0000-0000-000000000102', 'TENANT', TRUE),
('m2000000-0000-0000-0000-000000000004', 'u2000000-0000-0000-0000-000000000201', 'OWNER', TRUE)
ON CONFLICT (user_id, unit_id) DO NOTHING;
