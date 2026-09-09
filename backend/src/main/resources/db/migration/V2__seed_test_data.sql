-- Default test password for all seeded users: 'password123'
-- BCrypt hash: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36

-- 1. Seed Building
INSERT INTO buildings (id, name, address, total_units) VALUES
('b1000000-0000-0000-0000-000000000001', 'Edifício Solar das Palmeiras', 'Av. Paulista, 1000, São Paulo - SP', 4)
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Units
INSERT INTO units (id, building_id, block, number_code, floor) VALUES
('u1000000-0000-0000-0000-000000000101', 'b1000000-0000-0000-0000-000000000001', 'Torre A', '101', 1),
('u1000000-0000-0000-0000-000000000102', 'b1000000-0000-0000-0000-000000000001', 'Torre A', '102', 1),
('u1000000-0000-0000-0000-000000000201', 'b1000000-0000-0000-0000-000000000001', 'Torre A', '201', 2),
('u1000000-0000-0000-0000-000000000202', 'b1000000-0000-0000-0000-000000000001', 'Torre A', '202', 2)
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Users
INSERT INTO users (id, name, email, password_hash, phone, role) VALUES
('a1000000-0000-0000-0000-000000000001', 'Carlos Síndico', 'admin@condotrack.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36', '+5511999990001', 'ADMIN'),
('p1000000-0000-0000-0000-000000000001', 'Roberto Porteiro', 'portaria@condotrack.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36', '+5511999990002', 'PORTARIA'),
('m1000000-0000-0000-0000-000000000001', 'Mariana Moradora', 'mariana@condotrack.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36', '+5511999990003', 'MORADOR'),
('m1000000-0000-0000-0000-000000000002', 'Lucas Morador', 'lucas@condotrack.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36', '+5511999990004', 'MORADOR')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed User-Unit Associations
INSERT INTO user_units (user_id, unit_id, relationship_type, is_primary) VALUES
('m1000000-0000-0000-0000-000000000001', 'u1000000-0000-0000-0000-000000000101', 'PROPRIETARIO', TRUE),
('m1000000-0000-0000-0000-000000000002', 'u1000000-0000-0000-0000-000000000102', 'INQUILINO', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Common Areas
INSERT INTO common_areas (id, building_id, name, max_capacity, open_time, close_time, rules_text) VALUES
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Salão de Festas', 50, '09:00:00', '23:00:00', 'No loud music after 22:00.'),
('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Churrasqueira Gourmet', 20, '10:00:00', '22:00:00', 'Cleaning fee included.')
ON CONFLICT (id) DO NOTHING;
