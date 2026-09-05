# CondoTrack — Domain Class Diagram (Spring Boot JPA) / Diagrama de Clases / Diagrama de Classes

> **Languages / Idiomas / Idiomas:**  
> [English](#1-english) | [Español](#2-español) | [Português (pt-BR)](#3-português-pt-br) | [Mermaid Visual Class Diagram](#4-mermaid-visual-class-diagram)

---

## 1. English

### 1.1 Overview
This UML Class Diagram reflects the **Spring Boot 3.x domain layer**, representing JPA entity classes (`@Entity`), their relationship mappings (`@ManyToOne`, `@OneToMany`), strongly typed Java Enums, and core domain behaviors.

### 1.2 Key JPA Design Highlights
* **UUID Identifiers:** All entities use `UUID` generated via `gen_random_uuid()` for distributed safety.
* **Audit Metadata:** Core tables include `created_at` or `timestamp` mapped via `@CreationTimestamp` / `Instant` with UTC timezone.
* **Encapsulation:** Entities feature private fields with getters, setters, and builder patterns (`Lombok`).
* **Rich Enums:** String-backed `@Enumerated(EnumType.STRING)` mapping ensures human-readable database values.

---

## 2. Español

### 2.1 Visión General
Este diagrama de clases UML modela la **capa de dominio de Spring Boot 3.x**, reflejando las entidades JPA (`@Entity`), sus relaciones (`@ManyToOne`, `@OneToMany`), enums tipados en Java y métodos de negocio.

### 2.2 Aspectos Clave del Diseño JPA
* **Identificadores UUID:** Todas las entidades usan `UUID` para evitar colisiones de identificadores numéricos.
* **Mapeo de Enumeraciones:** `@Enumerated(EnumType.STRING)` para persistir valores legibles y auditables.
* **Inmutabilidad de Auditoría:** `AuditLog` mapea campos de sólo inserción para respaldar la línea de tiempo.

---

## 3. Português (pt-BR)

### 3.1 Visão Geral
Este diagrama de classes UML representa a **camada de domínio do Spring Boot 3.x**, demonstrando o mapeamento das entidades JPA (`@Entity`), suas anotações relacionais (`@ManyToOne`, `@OneToMany`), enums de domínio e atributos fundamentais.

### 3.2 Destaques de Implementação JPA
* **Chaves UUID:** Utilização universal de `UUID` gerado pelo PostgreSQL para integridade e desacoplamento.
* **Enums Tipados:** Associação segura via `@Enumerated(EnumType.STRING)` prevenindo inconsistências de status.
* **Isolamento de Entidades:** As classes de entidade interagem com o banco e são convertidas em DTOs antes de trafegar pela API.

---

## 4. Mermaid Visual Class Diagram

```mermaid
classDiagram
    class Building {
        -UUID id
        -String name
        -String address
        -Integer totalUnits
        -Instant createdAt
        +getUnits() List~Unit~
    }

    class Unit {
        -UUID id
        -Building building
        -String block
        -String numberCode
        -Integer floor
        -Instant createdAt
        +getResidents() List~UserUnit~
    }

    class User {
        -UUID id
        -String name
        -String email
        -String passwordHash
        -String phone
        -UserRole role
        -Boolean isActive
        -Instant createdAt
        +isAdmin() boolean
        +isPortaria() boolean
    }

    class UserUnit {
        -UUID id
        -User user
        -Unit unit
        -RelationshipType relationshipType
        -Boolean isPrimary
    }

    class AccessAuthorization {
        -UUID id
        -Unit unit
        -User createdByUser
        -String visitorName
        -String visitorDocument
        -String tokenCode
        -Instant validFrom
        -Instant validUntil
        -AuthorizationStatus status
        -Instant createdAt
        +isValidNow() boolean
        +markAsUsed() void
    }

    class AccessLog {
        -UUID id
        -AccessAuthorization authorization
        -Unit unit
        -String visitorName
        -String visitorDocument
        -AccessDirection direction
        -User checkedByUser
        -String notes
        -Instant timestamp
    }

    class PackageDelivery {
        -UUID id
        -Unit unit
        -User receivedByUser
        -PackageType packageType
        -String carrierName
        -String trackingCode
        -PackageStatus status
        -Instant receivedAt
        -Instant pickedUpAt
        -String pickedUpByName
        -User pickupOperator
        +deliverTo(recipientName, operator) void
    }

    class CommonArea {
        -UUID id
        -Building building
        -String name
        -Integer maxCapacity
        -LocalTime openTime
        -LocalTime closeTime
        -String rulesText
        -Boolean isActive
    }

    class Reservation {
        -UUID id
        -CommonArea commonArea
        -Unit unit
        -User user
        -Instant startTime
        -Instant endTime
        -ReservationStatus status
        -Instant createdAt
        +cancel() void
    }

    class MoveSchedule {
        -UUID id
        -Unit unit
        -User user
        -MoveType moveType
        -LocalDate scheduledDate
        -MoveShift shift
        -MoveStatus status
        -String adminNotes
        -Instant createdAt
        +approve(notes) void
        +reject(notes) void
    }

    class IncidentTicket {
        -UUID id
        -Building building
        -Unit unit
        -CommonArea commonArea
        -User createdByUser
        -User assignedToUser
        -String title
        -String description
        -String photoUrl
        -IncidentCategory category
        -IncidentPriority priority
        -IncidentStatus status
        -Instant createdAt
        -Instant resolvedAt
        +assignTo(user) void
        +resolve() void
    }

    class AuditLog {
        -UUID id
        -Building building
        -Unit unit
        -User user
        -AuditModule module
        -String action
        -String description
        -String metadataJson
        -Instant timestamp
    }

    %% Enums
    class UserRole {
        <<enumeration>>
        ADMIN
        PORTARIA
        MORADOR
    }

    class RelationshipType {
        <<enumeration>>
        PROPRIETARIO
        INQUILINO
        FAMILIAR
    }

    class AuthorizationStatus {
        <<enumeration>>
        PENDING
        USED
        EXPIRED
        REVOKED
    }

    class AccessDirection {
        <<enumeration>>
        ENTRY
        EXIT
    }

    class PackageStatus {
        <<enumeration>>
        PENDING_PICKUP
        DELIVERED
    }

    class ReservationStatus {
        <<enumeration>>
        CONFIRMED
        CANCELLED
    }

    class MoveShift {
        <<enumeration>>
        MORNING
        AFTERNOON
    }

    class MoveStatus {
        <<enumeration>>
        REQUESTED
        APPROVED
        REJECTED
        COMPLETED
    }

    class IncidentStatus {
        <<enumeration>>
        OPEN
        IN_PROGRESS
        RESOLVED
        CLOSED
    }

    %% Relationships
    Building "1" *-- "many" Unit : contains
    Building "1" *-- "many" CommonArea : possesses
    Building "1" *-- "many" IncidentTicket : encompasses
    
    Unit "1" *-- "many" UserUnit : links
    User "1" *-- "many" UserUnit : holds
    
    Unit "1" <-- AccessAuthorization : relates_to
    User "1" <-- AccessAuthorization : created_by
    AccessAuthorization "0..1" <-- AccessLog : validates
    Unit "1" <-- AccessLog : logs_entry
    
    Unit "1" <-- PackageDelivery : belongs_to
    User "1" <-- PackageDelivery : received_by
    
    CommonArea "1" <-- Reservation : hosts
    Unit "1" <-- Reservation : books
    User "1" <-- Reservation : reserves
    
    Unit "1" <-- MoveSchedule : targets
    User "1" <-- MoveSchedule : requests
    
    Unit "0..1" <-- IncidentTicket : affects
    User "1" <-- IncidentTicket : reports
    
    Unit "0..1" <-- AuditLog : references

    User ..> UserRole
    UserUnit ..> RelationshipType
    AccessAuthorization ..> AuthorizationStatus
    AccessLog ..> AccessDirection
    PackageDelivery ..> PackageStatus
    Reservation ..> ReservationStatus
    MoveSchedule ..> MoveShift
    MoveSchedule ..> MoveStatus
    IncidentTicket ..> IncidentStatus
```
