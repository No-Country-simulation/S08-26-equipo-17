-- V6: Seed prototype demo accounts for seamless frontend alignment (Figma & Vercel demo)
-- Default password: 'condo1234'
-- BCrypt hash: $2a$10$3a9xorzUdMIBIMu.l773DuoVXeZlH7aY5RwqpMrASHPl3BnrWISue

-- 1. Unit 7D (matching prototype resident unit)
INSERT INTO units (id, building_id, block, number_code, floor) VALUES
('11000000-0000-0000-0000-000000000704', 'b1000000-0000-0000-0000-000000000001', 'Tower A', '7D', 7)
ON CONFLICT (id) DO NOTHING;

-- 2. Demo users matching UI prototype
INSERT INTO users (id, name, email, password_hash, phone, role) VALUES
('a3000000-0000-0000-0000-000000000001', 'Mariana Ferrari', 'admin@araoz1280.com.ar', '$2a$10$3a9xorzUdMIBIMu.l773DuoVXeZlH7aY5RwqpMrASHPl3BnrWISue', '+54 9 11 5233 9040', 'ADMIN'),
('33000000-0000-0000-0000-000000000001', 'Diego Sosa', 'recepcion@araoz1280.com.ar', '$2a$10$3a9xorzUdMIBIMu.l773DuoVXeZlH7aY5RwqpMrASHPl3BnrWISue', '+54 9 11 4788 2210', 'CONCIERGE'),
('23000000-0000-0000-0000-000000000001', 'Felipe Osorio', 'felipe@araoz1280.com.ar', '$2a$10$3a9xorzUdMIBIMu.l773DuoVXeZlH7aY5RwqpMrASHPl3BnrWISue', '+54 11 4555 1280', 'RESIDENT')
ON CONFLICT (email) DO NOTHING;

-- 3. Link Felipe to Unit 7D and Unit 101
INSERT INTO user_units (user_id, unit_id, relationship_type, is_primary) VALUES
('23000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000704', 'OWNER', TRUE),
('23000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000101', 'OWNER', FALSE)
ON CONFLICT (user_id, unit_id) DO NOTHING;

-- 4. Sample pending package for unit 7D
INSERT INTO package_deliveries (id, unit_id, received_by_user_id, package_type, carrier_name, tracking_code, status, received_at) VALUES
('33000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000704', '33000000-0000-0000-0000-000000000001', 'PARCEL', 'Amazon Prime', 'AMZ-AR-78921', 'PENDING_PICKUP', CURRENT_TIMESTAMP - INTERVAL '2 hours')
ON CONFLICT (tracking_code) DO NOTHING;

-- 5. Sample audit log for unit 7D
INSERT INTO audit_logs (building_id, unit_id, user_id, module, action, description, timestamp) VALUES
('b1000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000704', '33000000-0000-0000-0000-000000000001', 'PACKAGE', 'PACKAGE_RECEIVED', 'Encomenda registrada por Diego Sosa', CURRENT_TIMESTAMP - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;
