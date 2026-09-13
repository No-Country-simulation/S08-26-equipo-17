-- V3: Compatibilidad unit_residents + datos demo (Dev 3).
-- Tabla canónica: user_units (V1). Esta vista expone el alias unit_residents
-- pedido por el módulo "Perfiles de Usuario y Asociación Residente-Unidad".
CREATE OR REPLACE VIEW unit_residents AS
SELECT id, user_id, unit_id, relationship_type, is_primary
FROM user_units;

-- Default demo password for all seeded users: 'password123'
-- BCrypt hash: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36

-- 1. Condominio demo
INSERT INTO buildings (id, name, address, total_units) VALUES
('b2000000-0000-0000-0000-000000000001', 'Condominio Jardines del Sur', 'Calle Los Pinos 456, Ciudad Demo', 4)
ON CONFLICT (id) DO NOTHING;

-- 2. Unidades demo
INSERT INTO units (id, building_id, block, number_code, floor) VALUES
('u2000000-0000-0000-0000-000000000101', 'b2000000-0000-0000-0000-000000000001', 'Bloque B', '101', 1),
('u2000000-0000-0000-0000-000000000102', 'b2000000-0000-0000-0000-000000000001', 'Bloque B', '102', 1),
('u2000000-0000-0000-0000-000000000201', 'b2000000-0000-0000-0000-000000000001', 'Bloque B', '201', 2),
('u2000000-0000-0000-0000-000000000202', 'b2000000-0000-0000-0000-000000000001', 'Bloque B', '202', 2)
ON CONFLICT (id) DO NOTHING;

-- 3. Personal de portería de ejemplo
INSERT INTO users (id, name, email, password_hash, phone, role) VALUES
('p2000000-0000-0000-0000-000000000001', 'Ana Portería Turno Mañana', 'ana.porteria@condotrack.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36', '+5501999990101', 'PORTARIA'),
('p2000000-0000-0000-0000-000000000002', 'Diego Portería Turno Noche', 'diego.porteria@condotrack.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36', '+5501999990102', 'PORTARIA')
ON CONFLICT (id) DO NOTHING;

-- 4. Residentes de ejemplo
INSERT INTO users (id, name, email, password_hash, phone, role) VALUES
('m2000000-0000-0000-0000-000000000001', 'Sofía Residente', 'sofia@condotrack.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36', '+5501999990201', 'MORADOR'),
('m2000000-0000-0000-0000-000000000002', 'Martín Residente', 'martin@condotrack.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36', '+5501999990202', 'MORADOR'),
('m2000000-0000-0000-0000-000000000003', 'Valentina Familiar', 'valentina@condotrack.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36', '+5501999990203', 'MORADOR'),
('m2000000-0000-0000-0000-000000000004', 'Pablo Propietario', 'pablo@condotrack.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36', '+5501999990204', 'MORADOR')
ON CONFLICT (id) DO NOTHING;

-- 5. Asociación residente-unidad de ejemplo
INSERT INTO user_units (user_id, unit_id, relationship_type, is_primary) VALUES
('m2000000-0000-0000-0000-000000000001', 'u2000000-0000-0000-0000-000000000101', 'PROPRIETARIO', TRUE),
('m2000000-0000-0000-0000-000000000003', 'u2000000-0000-0000-0000-000000000101', 'FAMILIAR', FALSE),
('m2000000-0000-0000-0000-000000000002', 'u2000000-0000-0000-0000-000000000102', 'INQUILINO', TRUE),
('m2000000-0000-0000-0000-000000000004', 'u2000000-0000-0000-0000-000000000201', 'PROPRIETARIO', TRUE)
ON CONFLICT (user_id, unit_id) DO NOTHING;
