# CondoTrack — UML Use Case Diagrams / Casos de Uso / Casos de Uso

> **Languages / Idiomas / Idiomas:**  
> [English](#1-english) | [Español](#2-español) | [Português (pt-BR)](#3-português-pt-br) | [Mermaid Visual Diagrams](#4-mermaid-visual-diagrams)

---

## 1. English

### 1.1 Overview
This document models the functional boundaries and permissions of the **CondoTrack** platform through UML Use Case diagrams, distinguishing what each of the three primary actors can perform:
* **Administrator / Property Manager (`ADMIN`):** Manages buildings, units, and tenant links; approves move schedules; assigns maintenance tickets; inspects the full 360° unit overview and audit logs.
* **Concierge / Front Desk (`PORTARIA`):** Scans visitor QR codes; registers unscheduled guests; logs arriving packages; signs off package pickups; reports immediate operational incidents.
* **Resident / Owner (`MORADOR`):** Generates visitor QR passes; views package alerts and history; books amenities without conflicts; schedules move shifts; opens maintenance tickets.

---

## 2. Español

### 2.1 Visión General
Este documento modela los límites funcionales y permisos de la plataforma **CondoTrack** mediante diagramas de Casos de Uso UML, delimitando las capacidades de cada uno de los tres actores del sistema:
* **Administrador / Síndico (`ADMIN`):** Da de alta inmuebles y vincula residentes; aprueba mudanzas; asigna reclamos; consulta la vista 360° y la auditoría.
* **Recepción / Portería (`PORTARIA`):** Escanea códigos QR de visitas; registra ingresos manuales; recibe encomiendas y entrega paquetes; abre incidentes urgentes.
* **Residente / Propietario (`MORADOR`):** Emite pases QR para invitados; consulta encomiendas; reserva áreas comunes; solicita mudanzas; reporta averías.

---

## 3. Português (pt-BR)

### 3.1 Visão Geral
Este documento modela as fronteiras funcionais e as regras de controle de acesso (RBAC) do **CondoTrack** por meio de diagramas de Casos de Uso UML, explicitando as operações de cada um dos três perfis:
* **Administrador / Síndico (`ADMIN`):** Cadastra edifícios e vincula moradores; aprova turnos de mudança; gerencia chamados técnicos; audita a Visão 360° da Unidade.
* **Operador de Portaria (`PORTARIA`):** Escaneia QR Codes de visitantes; registra entradas manuais; recebe e dá baixa em encomendas; reporta ocorrências da portaria.
* **Morador / Proprietário (`MORADOR`):** Gera convites QR para visitas; acompanha encomendas; agenda espaços sociais; solicita mudanças; abre chamados com foto.

---

## 4. Mermaid Visual Diagrams

### 4.1 Global Use Case Diagram by Actor
```mermaid
flowchart LR
    %% Actors
    Admin["fa:fa-user-tie Administrator (ADMIN)"]
    Portaria["fa:fa-shield-halved Concierge (PORTARIA)"]
    Morador["fa:fa-house-user Resident (MORADOR)"]

    %% System Boundary
    subgraph CondoTrackPlatform ["CondoTrack Platform"]
        %% Auth
        UC_Login(["UC01: Login & JWT Auth"]):::authStyle
        
        %% Admin cases
        UC_ManageUnits(["UC02: Manage Buildings & Units"]):::adminStyle
        UC_ApproveMoves(["UC03: Review & Approve Moves"]):::adminStyle
        UC_AssignTickets(["UC04: Assign & Close Incidents"]):::adminStyle
        UC_Audit360(["UC05: View 360° Unit Dossier"]):::coreStyle

        %% Portaria cases
        UC_ScanQR(["UC06: Scan & Validate Visitor QR (< 1.5s)"]):::portariaStyle
        UC_ManualAccess(["UC07: Register Unscheduled Visitor"]):::portariaStyle
        UC_ReceivePackage(["UC08: Register Package Arrival"]):::portariaStyle
        UC_DeliverPackage(["UC09: Sign off Package Pickup"]):::portariaStyle

        %% Morador cases
        UC_CreateQR(["UC10: Issue Visitor QR Pass"]):::moradorStyle
        UC_BookAmenity(["UC11: Book Amenity (Atomic Check)"]):::moradorStyle
        UC_RequestMove(["UC12: Request Moving Shift"]):::moradorStyle
        UC_OpenIncident(["UC13: Open Incident Ticket with Photo"]):::moradorStyle
        UC_ViewMyPackages(["UC14: View My Package Deliveries"]):::moradorStyle
    end

    %% Relations
    Admin --> UC_Login
    Admin --> UC_ManageUnits
    Admin --> UC_ApproveMoves
    Admin --> UC_AssignTickets
    Admin --> UC_Audit360

    Portaria --> UC_Login
    Portaria --> UC_ScanQR
    Portaria --> UC_ManualAccess
    Portaria --> UC_ReceivePackage
    Portaria --> UC_DeliverPackage
    Portaria --> UC_Audit360

    Morador --> UC_Login
    Morador --> UC_CreateQR
    Morador --> UC_BookAmenity
    Morador --> UC_RequestMove
    Morador --> UC_OpenIncident
    Morador --> UC_ViewMyPackages
    Morador --> UC_Audit360

    classDef adminStyle fill:#e3f2fd,stroke:#1565c0,stroke-width:2px;
    classDef portariaStyle fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef moradorStyle fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef coreStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px;
    classDef authStyle fill:#eceff1,stroke:#455a64,stroke-width:2px;
```

### 4.2 Concierge & Access Subsystem (Use Case Detail)
```mermaid
flowchart TD
    Guest((Visitor))
    Portaria((Concierge))
    Morador((Resident))

    subgraph AccessManagementSubsystem ["Access & Visitor Subsystem"]
        UC1(["Issue QR Code Authorization"])
        UC2(["Validate QR Code on Front Desk Camera"])
        UC3(["Record Entry in Access Logs"])
        UC4(["Register Unscheduled Access"])
        UC5(["Record Checkout Exit"])
        UC6(["Notify Resident of Arrival"])
    end

    Morador --> UC1
    UC1 -.->|generates| UC2
    Guest -->|presents QR to| Portaria
    Portaria --> UC2
    UC2 -->|includes| UC3
    UC2 -->|triggers| UC6
    Portaria --> UC4
    Portaria --> UC5
```

### 4.3 Package Delivery Subsystem (Use Case Detail)
```mermaid
flowchart TD
    Carrier((Delivery Carrier))
    Portaria((Concierge))
    Morador((Resident))

    subgraph PackageSubsystem ["Package & Delivery Subsystem"]
        P1(["Receive Parcel from Carrier"])
        P2(["Register Package & Unit"])
        P3(["Dispatch Automated Resident Alert"])
        P4(["View Pending Deliveries"])
        P5(["Handover Parcel & Register Pickup"])
        P6(["Update Audit Log to DELIVERED"])
    end

    Carrier -->|delivers to| Portaria
    Portaria --> P1
    P1 --> P2
    P2 -->|triggers| P3
    P3 --> Morador
    Morador --> P4
    Portaria --> P5
    P5 -->|includes| P6
    Morador -->|claims parcel from| Portaria
```
