# CondoTrack — Database Design & DDL (PostgreSQL) / Diseño de Base de Datos / Modelagem de Dados

> **Languages / Idiomas / Idiomas:**  
> [English](#1-english) | [Español](#2-español) | [Português (pt-BR)](#3-português-pt-br) | [SQL DDL & Seed Scripts](#4-sql-ddl-and-seed-scripts)

---

## 1. English

### 1.1 Entity-Relationship Overview
The PostgreSQL schema consists of **12 core relational tables** designed to guarantee data integrity, ACID transactional consistency, and fast indexing:
1. `buildings`: Property/condominium records.
2. `units`: Autonomous units (apartments, suites, offices).
3. `users`: System users with roles (`ADMIN`, `PORTARIA`, `MORADOR`).
4. `user_units`: Associative table linking residents to units (`PROPRIETARIO`, `INQUILINO`, `FAMILIAR`).
5. `access_authorizations`: Visitor invitations with unique alphanumeric/QR tokens (`PENDING`, `USED`, `EXPIRED`, `REVOKED`).
6. `access_logs`: Immutable check-in and check-out records with timestamp, operator ID, and direction (`ENTRY`, `EXIT`).
7. `package_deliveries`: Parcel tracking records (`PENDING_PICKUP`, `DELIVERED`).
8. `common_areas`: Amenities available for reservation (party hall, barbecue area, gym).
9. `reservations`: Bookings with atomic overlap prevention constraints.
10. `move_schedules`: Move-in and move-out requests with shift allocation (`MORNING`, `AFTERNOON`) and admin approval.
11. `incident_tickets`: Maintenance tickets (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`) with priority, category, and photo attachments.
12. `audit_logs`: Centralized timeline records with JSONB metadata snapshots.

### 1.2 Performance & Optimization Indexes
* `idx_access_authorizations_token`: Fast B-tree index on `token_code` to ensure QR check-in response in $< 1.5$s.
* `idx_audit_logs_unit_timestamp`: Composite index `(unit_id, timestamp DESC)` for fast loading of the 360° Unit Overview.
* `idx_reservations_conflict`: Composite index on `(common_area_id, status, start_time, end_time)` for atomic conflict validation.
* `idx_package_deliveries_unit_status`: Fast lookup of pending deliveries by unit.

---

## 2. Español

### 2.1 Visión General del Modelo Entidad-Relación
El esquema relacional en PostgreSQL está compuesto por **12 tablas principales** diseñadas para garantizar consistencia transaccional ACID, integridad referencial y alto rendimiento:
1. `buildings`: Registro de condominios y edificios.
2. `units`: Unidades habitacionales u oficinas por edificio.
3. `users`: Directorio de usuarios y roles (`ADMIN`, `PORTARIA`, `MORADOR`).
4. `user_units`: Relación entre usuarios y departamentos (`PROPRIETARIO`, `INQUILINO`, `FAMILIAR`).
5. `access_authorizations`: Autorizaciones de visita con token QR único (`PENDING`, `USED`, `EXPIRED`, `REVOKED`).
6. `access_logs`: Registro cronológico de ingresos y egresos con operador responsable.
7. `package_deliveries`: Encomiendas y correspondencia recibida (`PENDING_PICKUP`, `DELIVERED`).
8. `common_areas`: Espacios comunes configurables para reserva.
9. `reservations`: Agendamientos con validación atómica contra superposiciones de horario.
10. `move_schedules`: Solicitudes de mudanza por turno (`MORNING`, `AFTERNOON`) sujetas a aprobación.
11. `incident_tickets`: Reportes de fallas y mantenimiento con fotos y flujo de estados.
12. `audit_logs`: Línea de tiempo inmutable con snapshot contextual en formato `JSONB`.

### 2.2 Índices de Rendimiento Críticos
* `idx_access_authorizations_token`: Búsqueda instantánea de autorizaciones por código QR ($< 1.5$ s).
* `idx_audit_logs_unit_timestamp`: Índice compuesto para acelerar el Panel 360° de la Unidad.
* `idx_reservations_conflict`: Prevención atómica de doble reserva en espacios comunes.

---

## 3. Português (pt-BR)

### 3.1 Visão Geral do Modelo Entidade-Relacionamento
O banco de dados relacional em PostgreSQL é composto por **12 tabelas principais** estruturadas para garantir integridade referencial, conformidade ACID e alta velocidade de consulta:
1. `buildings`: Cadastro de condomínios e edifícios.
2. `units`: Unidades autônomas (apartamentos/salas) vinculadas ao prédio.
3. `users`: Usuários do sistema com controle RBAC (`ADMIN`, `PORTARIA`, `MORADOR`).
4. `user_units`: Tabela associativa entre moradores e unidades (`PROPRIETARIO`, `INQUILINO`, `FAMILIAR`).
5. `access_authorizations`: Convites de acesso com token único para QR Code.
6. `access_logs`: Histórico imutável de check-in e check-out na portaria.
7. `package_deliveries`: Gestão e baixa presencial de encomendas e correspondências.
8. `common_areas`: Áreas sociais disponíveis para locação e regras de uso.
9. `reservations`: Agendamentos com prevenção atômica de sobreposição de horários.
10. `move_schedules`: Agendamento de mudanças com alocação de turno e aprovação do síndico.
11. `incident_tickets`: Chamados de manutenção com fotos, categorias e pipeline de status.
12. `audit_logs`: Linha do tempo unificada com payload flexível em `JSONB`.

### 3.2 Índices de Desempenho e Otimização
* `idx_access_authorizations_token`: Índice B-Tree no token para validação na portaria em $< 1.5$s.
* `idx_audit_logs_unit_timestamp`: Otimização do carregamento da Visão 360° da Unidade.
* `idx_reservations_conflict`: Bloqueio atômico de choques de horário em áreas comuns.

---

## 4. SQL DDL and Seed Scripts

### 4.1 Schema Migration (`V1__init_schema.sql`)

```sql
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
    role VARCHAR(20) NOT NULL DEFAULT 'MORADOR' CHECK (role IN ('ADMIN', 'PORTARIA', 'MORADOR')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. USER_UNITS
CREATE TABLE user_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    relationship_type VARCHAR(20) NOT NULL DEFAULT 'INQUILINO' CHECK (relationship_type IN ('PROPRIETARIO', 'INQUILINO', 'FAMILIAR')),
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
    package_type VARCHAR(30) NOT NULL DEFAULT 'ENCOMIENDA' CHECK (package_type IN ('ENCOMIENDA', 'PAQUETE', 'CORRESPONDENCIA', 'DELIVERY_EXPRESS')),
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
    category VARCHAR(30) NOT NULL DEFAULT 'OUTROS' CHECK (category IN ('ELETRICA', 'HIDRAULICA', 'ESTRUTURAL', 'SEGURANCA', 'LIMPEZA', 'OUTROS')),
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

-- INDEXES
CREATE INDEX idx_access_authorizations_token ON access_authorizations(token_code);
CREATE INDEX idx_access_authorizations_unit_status ON access_authorizations(unit_id, status);
CREATE INDEX idx_audit_logs_unit_timestamp ON audit_logs(unit_id, timestamp DESC);
CREATE INDEX idx_package_deliveries_unit_status ON package_deliveries(unit_id, status);
CREATE INDEX idx_reservations_unit ON reservations(unit_id, start_time DESC);
CREATE INDEX idx_reservations_conflict ON reservations(common_area_id, status, start_time, end_time);
CREATE INDEX idx_incident_tickets_unit_status ON incident_tickets(unit_id, status);
```

### 4.2 Seed Test Data (`V2__seed_test_data.sql`)

```sql
-- Default test password for all seeded users: 'password123'
-- BCrypt hash: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36

-- 1. Seed Building
INSERT INTO buildings (id, name, address, total_units) VALUES
('b1000000-0000-0000-0000-000000000001', 'Edifício Solar das Palmeiras', 'Av. Paulista, 1000, São Paulo - SP', 4);

-- 2. Seed Units
INSERT INTO units (id, building_id, block, number_code, floor) VALUES
('u1000000-0000-0000-0000-000000000101', 'b1000000-0000-0000-0000-000000000001', 'Torre A', '101', 1),
('u1000000-0000-0000-0000-000000000102', 'b1000000-0000-0000-0000-000000000001', 'Torre A', '102', 1),
('u1000000-0000-0000-0000-000000000201', 'b1000000-0000-0000-0000-000000000001', 'Torre A', '201', 2),
('u1000000-0000-0000-0000-000000000202', 'b1000000-0000-0000-0000-000000000001', 'Torre A', '202', 2);

-- 3. Seed Users
INSERT INTO users (id, name, email, password_hash, phone, role) VALUES
('a1000000-0000-0000-0000-000000000001', 'Carlos Síndico', 'admin@condotrack.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36', '+5511999990001', 'ADMIN'),
('p1000000-0000-0000-0000-000000000001', 'Roberto Porteiro', 'portaria@condotrack.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36', '+5511999990002', 'PORTARIA'),
('m1000000-0000-0000-0000-000000000001', 'Mariana Moradora', 'mariana@condotrack.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36', '+5511999990003', 'MORADOR'),
('m1000000-0000-0000-0000-000000000002', 'Lucas Morador', 'lucas@condotrack.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iwK84Z36', '+5511999990004', 'MORADOR');

-- 4. Seed User-Unit Associations
INSERT INTO user_units (user_id, unit_id, relationship_type, is_primary) VALUES
('m1000000-0000-0000-0000-000000000001', 'u1000000-0000-0000-0000-000000000101', 'PROPRIETARIO', TRUE),
('m1000000-0000-0000-0000-000000000002', 'u1000000-0000-0000-0000-000000000102', 'INQUILINO', TRUE);

-- 5. Seed Common Areas
INSERT INTO common_areas (id, building_id, name, max_capacity, open_time, close_time, rules_text) VALUES
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Salão de Festas', 50, '09:00:00', '23:00:00', 'No loud music after 22:00.'),
('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Churrasqueira Gourmet', 20, '10:00:00', '22:00:00', 'Cleaning fee included.');
```
