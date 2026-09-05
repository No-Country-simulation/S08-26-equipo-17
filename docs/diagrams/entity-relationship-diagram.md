# CondoTrack — Entity-Relationship Diagram (ERD) / Diagrama Entidad-Relación / Diagrama Entidade-Relacionamento

> **Languages / Idiomas / Idiomas:**  
> [English](#1-english) | [Español](#2-español) | [Português (pt-BR)](#3-português-pt-br) | [Mermaid Visual ERD](#4-mermaid-visual-erd)

---

## 1. English

### 1.1 Structural Overview
The **CondoTrack** PostgreSQL relational model is structured into **12 tables** designed around the core operational spine:
$$\text{BUILDINGS} \longrightarrow \text{UNITS} \longrightarrow \text{USER\_UNITS} \longleftrightarrow \text{USERS}$$
From this backbone, operational satellites record transactional events:
* **Access Control:** `ACCESS_AUTHORIZATIONS` $\longrightarrow$ `ACCESS_LOGS`.
* **Deliveries:** `PACKAGE_DELIVERIES` (linked to `UNITS` and receiving/delivering operators).
* **Amenities:** `COMMON_AREAS` $\longrightarrow$ `RESERVATIONS`.
* **Move Schedules:** `MOVE_SCHEDULES` (linked to `UNITS` and requesting `USERS`).
* **Maintenance:** `INCIDENT_TICKETS` (linked to `BUILDINGS`, optional `UNITS` or `COMMON_AREAS`).
* **Traceability:** `AUDIT_LOGS` capturing all critical state transitions with `JSONB` context snapshots.

---

## 2. Español

### 2.1 Visión Estructural
El modelo relacional en PostgreSQL de **CondoTrack** está compuesto por **12 tablas** estructuradas sobre el eje vertebral del negocio:
$$\text{BUILDINGS} \longrightarrow \text{UNITS} \longrightarrow \text{USER\_UNITS} \longleftrightarrow \text{USERS}$$
A partir de este núcleo se desprenden los módulos transaccionales:
* **Control de Accesos:** `ACCESS_AUTHORIZATIONS` $\longrightarrow$ `ACCESS_LOGS`.
* **Paquetería:** `PACKAGE_DELIVERIES` (vinculada a la unidad y a los operadores de recepción y despacho).
* **Amenidades:** `COMMON_AREAS` $\longrightarrow$ `RESERVATIONS`.
* **Mudanzas:** `MOVE_SCHEDULES` (vinculada a la unidad y al usuario solicitante).
* **Mantenimiento:** `INCIDENT_TICKETS` (asociada al edificio, unidad o área común).
* **Auditoría:** `AUDIT_LOGS` con registro cronológico de acciones y contexto en formato `JSONB`.

---

## 3. Português (pt-BR)

### 3.1 Visão Estrutural
O modelo relacional do **CondoTrack** no PostgreSQL organiza-se em **12 tabelas** construídas em torno da espinha dorsal do domínio condominial:
$$\text{BUILDINGS} \longrightarrow \text{UNITS} \longrightarrow \text{USER\_UNITS} \longleftrightarrow \text{USERS}$$
A partir deste núcleo derivam-se os satélites operacionais:
* **Controle de Acessos:** `ACCESS_AUTHORIZATIONS` $\longrightarrow$ `ACCESS_LOGS`.
* **Correspondências e Deliveries:** `PACKAGE_DELIVERIES` (vinculada à unidade e aos operadores de portaria).
* **Áreas Comuns:** `COMMON_AREAS` $\longrightarrow$ `RESERVATIONS`.
* **Mudanças:** `MOVE_SCHEDULES` (vinculada à unidade e ao morador solicitante).
* **Manutenção:** `INCIDENT_TICKETS` (vinculada ao prédio, unidade ou área social).
* **Rastreabilidade e Auditoria:** `AUDIT_LOGS` garantindo a linha do tempo imutável com snapshots em `JSONB`.

---

## 4. Mermaid Visual ERD

```mermaid
erDiagram
    BUILDINGS ||--o{ UNITS : contains
    BUILDINGS ||--o{ COMMON_AREAS : possesses
    BUILDINGS ||--o{ INCIDENT_TICKETS : contains
    BUILDINGS ||--o{ AUDIT_LOGS : contextualizes

    UNITS ||--o{ USER_UNITS : links
    USERS ||--o{ USER_UNITS : belongs_to

    UNITS ||--o{ ACCESS_AUTHORIZATIONS : issues
    USERS ||--o{ ACCESS_AUTHORIZATIONS : created_by
    ACCESS_AUTHORIZATIONS ||--o{ ACCESS_LOGS : validates
    UNITS ||--o{ ACCESS_LOGS : registers_entry
    USERS ||--o{ ACCESS_LOGS : checked_by

    UNITS ||--o{ PACKAGE_DELIVERIES : receives
    USERS ||--o{ PACKAGE_DELIVERIES : received_by
    USERS ||--o{ PACKAGE_DELIVERIES : delivered_by

    COMMON_AREAS ||--o{ RESERVATIONS : hosts
    UNITS ||--o{ RESERVATIONS : books
    USERS ||--o{ RESERVATIONS : reserves

    UNITS ||--o{ MOVE_SCHEDULES : targets
    USERS ||--o{ MOVE_SCHEDULES : requests

    UNITS ||--o{ INCIDENT_TICKETS : affects
    USERS ||--o{ INCIDENT_TICKETS : reports
    USERS ||--o{ INCIDENT_TICKETS : assigned_to

    UNITS ||--o{ AUDIT_LOGS : relates_to
    USERS ||--o{ AUDIT_LOGS : executed_by

    BUILDINGS {
        UUID id PK
        VARCHAR name
        VARCHAR address
        INTEGER total_units
        TIMESTAMPTZ created_at
    }

    UNITS {
        UUID id PK
        UUID building_id FK
        VARCHAR block
        VARCHAR number_code
        INTEGER floor
        TIMESTAMPTZ created_at
    }

    USERS {
        UUID id PK
        VARCHAR name
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR phone
        VARCHAR role
        BOOLEAN is_active
        TIMESTAMPTZ created_at
    }

    USER_UNITS {
        UUID id PK
        UUID user_id FK
        UUID unit_id FK
        VARCHAR relationship_type
        BOOLEAN is_primary
    }

    ACCESS_AUTHORIZATIONS {
        UUID id PK
        UUID unit_id FK
        UUID created_by_user_id FK
        VARCHAR visitor_name
        VARCHAR visitor_document
        VARCHAR token_code UK
        TIMESTAMPTZ valid_from
        TIMESTAMPTZ valid_until
        VARCHAR status
        TIMESTAMPTZ created_at
    }

    ACCESS_LOGS {
        UUID id PK
        UUID authorization_id FK
        UUID unit_id FK
        VARCHAR visitor_name
        VARCHAR visitor_document
        VARCHAR direction
        UUID checked_by_user_id FK
        TEXT notes
        TIMESTAMPTZ timestamp
    }

    PACKAGE_DELIVERIES {
        UUID id PK
        UUID unit_id FK
        UUID received_by_user_id FK
        VARCHAR package_type
        VARCHAR carrier_name
        VARCHAR tracking_code UK
        VARCHAR status
        TIMESTAMPTZ received_at
        TIMESTAMPTZ picked_up_at
        VARCHAR picked_up_by_name
        UUID pickup_operator_user_id FK
    }

    COMMON_AREAS {
        UUID id PK
        UUID building_id FK
        VARCHAR name
        INTEGER max_capacity
        TIME open_time
        TIME close_time
        TEXT rules_text
        BOOLEAN is_active
    }

    RESERVATIONS {
        UUID id PK
        UUID common_area_id FK
        UUID unit_id FK
        UUID user_id FK
        TIMESTAMPTZ start_time
        TIMESTAMPTZ end_time
        VARCHAR status
        TIMESTAMPTZ created_at
    }

    MOVE_SCHEDULES {
        UUID id PK
        UUID unit_id FK
        UUID user_id FK
        VARCHAR move_type
        DATE scheduled_date
        VARCHAR shift
        VARCHAR status
        TEXT admin_notes
        TIMESTAMPTZ created_at
    }

    INCIDENT_TICKETS {
        UUID id PK
        UUID building_id FK
        UUID unit_id FK
        UUID common_area_id FK
        UUID created_by_user_id FK
        UUID assigned_to_user_id FK
        VARCHAR title
        TEXT description
        VARCHAR photo_url
        VARCHAR category
        VARCHAR priority
        VARCHAR status
        TIMESTAMPTZ created_at
        TIMESTAMPTZ resolved_at
    }

    AUDIT_LOGS {
        UUID id PK
        UUID building_id FK
        UUID unit_id FK
        UUID user_id FK
        VARCHAR module
        VARCHAR action
        TEXT description
        JSONB metadata_json
        TIMESTAMPTZ timestamp
    }
```
