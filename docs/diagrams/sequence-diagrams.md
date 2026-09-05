# CondoTrack — Detailed Sequence Diagrams / Diagramas de Secuencia / Diagramas de Sequência

> **Languages / Idiomas / Idiomas:**  
> [English](#1-english) | [Español](#2-español) | [Português (pt-BR)](#3-português-pt-br) | [Mermaid Visual Sequence Diagrams](#4-mermaid-visual-sequence-diagrams)

---

## 1. English

### 1.1 Overview
This document supplements the core operational sequence flows by illustrating critical technical mechanisms:
1. **JWT Authentication Flow:** Credential verification, BCrypt password matching, token generation with role claims, and client context storage.
2. **Atomic Amenity Booking with Concurrency Lock:** Two concurrent booking requests for the same time slot demonstrating how the database prevents double-booking and returns `409 Conflict`.
3. **Maintenance Ticket Lifecycle with Photo Attachment:** Ticket submission, media storage, technician assignment, and status transitions.

---

## 2. Español

### 2.1 Visión General
Este documento complementa los flujos operativos detallando los mecanismos técnicos más críticos de la plataforma:
1. **Autenticación JWT:** Validación de credenciales con BCrypt, emisión del token con claims de rol y unidades vinculadas.
2. **Reserva Concurrente con Prevención de Conflictos:** Dos moradores intentando agendar el mismo espacio en simultáneo; bloqueo transaccional atómico y respuesta `409 Conflict`.
3. **Ciclo de Vida de Incidentes con Foto:** Registro de avería, almacenamiento de imagen, asignación a técnico y resolución con auditoría.

---

## 3. Português (pt-BR)

### 3.1 Visão Geral
Este documento aprofunda a documentação técnica apresentando o passo a passo de três mecanismos arquiteturais fundamentais:
1. **Fluxo de Autenticação JWT:** Validação de hash BCrypt no Spring Security, emissão do token assinado e injeção do contexto de segurança.
2. **Reserva de Espaço com Prevenção de Concorrência:** Simulação de requisições simultâneas para a mesma churrasqueira demonstrando o bloqueio atômico com retorno `409 Conflict`.
3. **Ciclo de Chamado de Manutenção com Anexo de Foto:** Abertura com imagem, persistência, atribuição pelo síndico e pipeline até o fechamento.

---

## 4. Mermaid Visual Sequence Diagrams

### 4.1 JWT Authentication & Security Context Injection
```mermaid
sequenceDiagram
    autonumber
    actor User as User / Usuário
    participant Front as Next.js Client
    participant SecFilter as Spring Security Filter
    participant AuthManager as AuthenticationManager
    participant UserDetails as CustomUserDetailsService
    participant TokenProvider as JwtTokenProvider
    participant DB as PostgreSQL

    User->>Front: Enters email and password
    Front->>SecFilter: POST /api/v1/auth/login { email, password }
    SecFilter->>AuthManager: authenticate(UsernamePasswordAuthenticationToken)
    AuthManager->>UserDetails: loadUserByUsername(email)
    UserDetails->>DB: SELECT * FROM users WHERE email = ?
    DB-->>UserDetails: Returns UserEntity (password_hash, role)
    UserDetails-->>AuthManager: Returns UserDetails
    AuthManager->>AuthManager: BCrypt.checkpw(password, hash)
    
    alt Credentials Valid
        AuthManager-->>SecFilter: Authentication Successful
        SecFilter->>TokenProvider: generateToken(authentication)
        TokenProvider-->>SecFilter: Returns signed JWT (sub, role, units)
        SecFilter-->>Front: 200 OK { accessToken, user }
        Front->>Front: Stores token in secure memory / cookie
        Front-->>User: Redirects to user role dashboard
    else Credentials Invalid
        AuthManager-->>SecFilter: BadCredentialsException
        SecFilter-->>Front: 401 Unauthorized (RFC 7807 ProblemDetail)
        Front-->>User: Displays error notification
    end
```

### 4.2 Atomic Amenity Booking with Concurrency Lock (409 Conflict)
```mermaid
sequenceDiagram
    autonumber
    actor ResidentA as Resident A (Unit 101)
    actor ResidentB as Resident B (Unit 102)
    participant API as Spring Boot API
    participant DB as PostgreSQL

    Note over ResidentA, ResidentB: Both residents submit reservation for Party Hall at 19:00 simultaneously
    par Concurrent Requests
        ResidentA->>API: POST /api/v1/reservations (19:00 - 23:00)
    and
        ResidentB->>API: POST /api/v1/reservations (19:00 - 23:00)
    end

    rect rgb(240, 255, 240)
        Note over API, DB: Transaction A acquires row lock first
        API->>DB: BEGIN TRANSACTION A (Isolation Level: SERIALIZABLE / SELECT FOR UPDATE)
        API->>DB: Check existing reservations in [19:00, 23:00] -> NONE found
        API->>DB: INSERT INTO reservations (unit_id=101, status='CONFIRMED')
        API->>DB: COMMIT TRANSACTION A
        API-->>ResidentA: 201 Created (Reservation Confirmed)
    end

    rect rgb(255, 240, 240)
        Note over API, DB: Transaction B evaluates after Transaction A commits
        API->>DB: BEGIN TRANSACTION B
        API->>DB: Check existing reservations in [19:00, 23:00] -> FOUND Unit 101
        API->>DB: ROLLBACK TRANSACTION B
        API-->>ResidentB: 409 Conflict (Horário Indisponível / Slot Unavailable)
    end
```

### 4.3 Maintenance Ticket with Photo Attachment & Resolution Pipeline
```mermaid
sequenceDiagram
    autonumber
    actor Resident as Resident / Morador
    participant Front as Next.js Client
    participant API as Spring Boot API
    participant Storage as File / Cloud Storage
    participant DB as PostgreSQL
    actor Admin as Property Manager / Síndico

    Resident->>Front: Fills incident form & selects photo
    Front->>Storage: Uploads image file
    Storage-->>Front: Returns public photo URL
    Front->>API: POST /api/v1/incidents { title, category, priority, photoUrl }
    API->>DB: INSERT INTO incident_tickets (status='OPEN', photo_url)
    API->>DB: INSERT INTO audit_logs (module='MAINTENANCE', action='TICKET_OPENED')
    API-->>Front: 201 Created (Ticket #INC-042)
    Front-->>Resident: Displays ticket confirmation card

    Note over Admin: Admin reviews open incidents
    Admin->>API: PATCH /api/v1/incidents/INC-042/status { status='IN_PROGRESS', assignedToUserId }
    API->>DB: UPDATE incident_tickets SET status='IN_PROGRESS'
    API->>DB: INSERT INTO audit_logs (module='MAINTENANCE', action='TICKET_ASSIGNED')
    API-->>Admin: 200 OK (Status Updated)

    Note over Admin: Maintenance completed
    Admin->>API: PATCH /api/v1/incidents/INC-042/status { status='RESOLVED' }
    API->>DB: UPDATE incident_tickets SET status='RESOLVED', resolved_at=NOW()
    API->>DB: INSERT INTO audit_logs (module='MAINTENANCE', action='TICKET_RESOLVED')
    API-->>Admin: 200 OK (Resolved)
```
