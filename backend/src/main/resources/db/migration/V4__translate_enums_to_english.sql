-- V4: translate legacy Portuguese/Spanish enum values to English.
-- Needed for databases created before V1 was renamed to English.
-- Safe to run multiple times (only touches old values).

-- Roles: PORTARIA -> CONCIERGE, MORADOR -> RESIDENT
UPDATE users SET role = 'CONCIERGE' WHERE role = 'PORTARIA';
UPDATE users SET role = 'RESIDENT' WHERE role = 'MORADOR';

-- Resident relationships: PROPRIETARIO -> OWNER, INQUILINO -> TENANT, FAMILIAR -> FAMILY_MEMBER
UPDATE user_units SET relationship_type = 'OWNER' WHERE relationship_type = 'PROPRIETARIO';
UPDATE user_units SET relationship_type = 'TENANT' WHERE relationship_type = 'INQUILINO';
UPDATE user_units SET relationship_type = 'FAMILY_MEMBER' WHERE relationship_type = 'FAMILIAR';

-- Package types: ENCOMIENDA -> PARCEL, PAQUETE -> PACKAGE, CORRESPONDENCIA -> MAIL, DELIVERY_EXPRESS -> EXPRESS_DELIVERY
UPDATE package_deliveries SET package_type = 'PARCEL' WHERE package_type = 'ENCOMIENDA';
UPDATE package_deliveries SET package_type = 'PACKAGE' WHERE package_type = 'PAQUETE';
UPDATE package_deliveries SET package_type = 'MAIL' WHERE package_type = 'CORRESPONDENCIA';
UPDATE package_deliveries SET package_type = 'EXPRESS_DELIVERY' WHERE package_type = 'DELIVERY_EXPRESS';

-- Maintenance categories: ELETRICA -> ELECTRICAL, HIDRAULICA -> PLUMBING, ESTRUTURAL -> STRUCTURAL,
-- SEGURANCA -> SECURITY, LIMPEZA -> CLEANING, OUTROS -> OTHER
UPDATE incident_tickets SET category = 'ELECTRICAL' WHERE category = 'ELETRICA';
UPDATE incident_tickets SET category = 'PLUMBING' WHERE category = 'HIDRAULICA';
UPDATE incident_tickets SET category = 'STRUCTURAL' WHERE category = 'ESTRUTURAL';
UPDATE incident_tickets SET category = 'SECURITY' WHERE category = 'SEGURANCA';
UPDATE incident_tickets SET category = 'CLEANING' WHERE category = 'LIMPEZA';
UPDATE incident_tickets SET category = 'OTHER' WHERE category = 'OUTROS';
