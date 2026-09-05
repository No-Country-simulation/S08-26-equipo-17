# CondoTrack — State Machines & Sequence Flows / Máquinas de Estado y Flujos / Máquinas de Estado e Fluxos

> **Languages / Idiomas / Idiomas:**  
> [English](#1-english) | [Español](#2-español) | [Português (pt-BR)](#3-português-pt-br) | [Mermaid Visual Diagrams](#4-mermaid-visual-diagrams)

---

## 1. English

### 1.1 State Machines Overview
1. **Access Authorizations (`access_authorizations`)**:
   - `PENDING`: Issued by resident with QR token and time window.
   - `USED`: Scanned and validated at concierge; entry logged in `access_logs`.
   - `EXPIRED`: Time window passed (`valid_until < NOW`); automatically invalidated.
   - `REVOKED`: Manually canceled by resident prior to use.
2. **Package Deliveries (`package_deliveries`)**:
   - `PENDING_PICKUP`: Arrived at concierge; notification dispatched to unit residents.
   - `DELIVERED`: Handed over to resident with operator signature and timestamp.
3. **Common Area Bookings (`reservations`)**:
   - `CONFIRMED`: Booked after atomic conflict check.
   - `CANCELLED`: Canceled by resident or admin.
   - `COMPLETED`: Booking concluded after end time.
4. **Moving Shifts (`move_schedules`)**:
   - `REQUESTED`: Submitted by resident for Morning or Afternoon shift.
   - `APPROVED`: Authorized by admin for service elevator allocation.
   - `REJECTED`: Declined by admin with justification.
   - `COMPLETED`: Move finished.
5. **Maintenance Tickets (`incident_tickets`)**:
   - `OPEN` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED` $\rightarrow$ `CLOSED`.

### 1.2 Critical Sequence Flows
* **QR Check-in Flow ($< 1.5$s):** Guest shows QR $\rightarrow$ Concierge camera scans token $\rightarrow$ Backend executes atomic lookup, updates status to `USED`, records `access_logs` and `audit_logs` $\rightarrow$ Concierge screen displays green approval card.
* **Package Delivery & Handover:** Carrier drops parcel $\rightarrow$ Concierge logs unit $\rightarrow$ Resident receives email/in-app alert $\rightarrow$ Resident visits front desk $\rightarrow$ Concierge signs off package as `DELIVERED`.
* **360° Unit Overview Aggregation:** Admin clicks Unit 101 $\rightarrow$ Backend performs indexed parallel lookups across 6 tables $\rightarrow$ Returns single consolidated JSON DTO.

---

## 2. Español

### 2.1 Máquinas de Estado y Ciclos de Vida
1. **Autorizaciones de Acceso (`access_authorizations`)**:
   - `PENDING`: Creada por el residente con código QR y ventana de validez.
   - `USED`: Escaneada y validada en portería; ingreso registrado en `access_logs`.
   - `EXPIRED`: Expirada automáticamente por tiempo (`valid_until < NOW`).
   - `REVOKED`: Cancelada por el morador antes de su uso.
2. **Deliveries y Correspondencia (`package_deliveries`)**:
   - `PENDING_PICKUP`: Recibida en portería; alerta enviada a los residentes.
   - `DELIVERED`: Entregada físicamente al residente con operador responsable.
3. **Reservas de Áreas Comunes (`reservations`)**:
   - `CONFIRMED`: Confirmada tras validación atómica sin superposiciones.
   - `CANCELLED`: Cancelada según políticas del condominio.
   - `COMPLETED`: Período finalizado.
4. **Programación de Mudanzas (`move_schedules`)**:
   - `REQUESTED`: Solicitada para turno mañana o tarde.
   - `APPROVED`: Aprobada por administración para uso del montacargas.
   - `REJECTED`: Rechazada con motivo explícito.
   - `COMPLETED`: Mudanza concluida.
5. **Tickets de Mantenimiento (`incident_tickets`)**:
   - `OPEN` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED` $\rightarrow$ `CLOSED`.

### 2.2 Flujos de Secuencia Críticos
* **Validación de QR ($< 1.5$ s):** Visitante presenta QR $\rightarrow$ Cámara de recepción escanea $\rightarrow$ Backend actualiza a `USED` e inserta registro de acceso $\rightarrow$ Pantalla muestra confirmación visual verde.
* **Ciclo de Encomiendas:** Transportista entrega $\rightarrow$ Portería registra y notifica $\rightarrow$ Residente retira $\rightarrow$ Portería da de baja.
* **Dossier 360° de la Unidad:** Consulta agregada de residentes, paquetes, visitas, reservas e incidentes en un solo clic.

---

## 3. Português (pt-BR)

### 3.1 Máquinas de Estado e Ciclos de Vida
1. **Autorizações de Acesso (`access_authorizations`)**:
   - `PENDING`: Emitida pelo morador com token QR e janela de permissão.
   - `USED`: Lida e validada na portaria com registro em `access_logs`.
   - `EXPIRED`: Invalidada automaticamente por decurso de prazo.
   - `REVOKED`: Revogada pelo morador antes da chegada da visita.
2. **Encomendas e Deliveries (`package_deliveries`)**:
   - `PENDING_PICKUP`: Recebida na portaria com disparo imediato de alerta.
   - `DELIVERED`: Entregue presencialmente com baixa do operador.
3. **Reservas de Áreas Comuns (`reservations`)**:
   - `CONFIRMED`: Confirmada após verificação atômica de disponibilidade.
   - `CANCELLED`: Cancelada antes do início.
   - `COMPLETED`: Concluída após o término do horário.
4. **Agendamento de Mudanças (`move_schedules`)**:
   - `REQUESTED`: Solicitada pelo morador para turno da manhã ou tarde.
   - `APPROVED`: Homologada pelo síndico para reserva do elevador.
   - `REJECTED`: Recusada com justificativa.
   - `COMPLETED`: Mudança finalizada.
5. **Chamados de Manutenção (`incident_tickets`)**:
   - `OPEN` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED` $\rightarrow$ `CLOSED`.

### 3.2 Fluxos de Sequência Críticos
* **Check-in por QR Code na Portaria ($< 1.5$s):** Visitante apresenta imagem do QR $\rightarrow$ Portaria lê pela câmera $\rightarrow$ Backend valida token, muda para `USED` e grava `access_logs` e `audit_logs` $\rightarrow$ Portaria exibe tela verde de liberação.
* **Recepção e Baixa de Pacotes:** Encomenda chega $\rightarrow$ Porteiro cadastra unidade $\rightarrow$ Morador recebe e-mail/alerta $\rightarrow$ Morador retira $\rightarrow$ Baixa concluída.
* **Consulta da Visão 360°:** Consulta agregada em paralelo via índices unificando todo o histórico da unidade.

---

## 4. Mermaid Visual Diagrams

### 4.1 State Diagram: Access Authorization
```mermaid
stateDiagram-v2
    [*] --> PENDING: Resident generates QR code
    PENDING --> USED: Concierge validates QR at front desk
    PENDING --> EXPIRED: Validity window ends (valid_until < NOW)
    PENDING --> REVOKED: Resident revokes before visit
    USED --> [*]: Cycle complete
    EXPIRED --> [*]: Token invalid
    REVOKED --> [*]: Canceled
```

### 4.2 State Diagram: Package Delivery
```mermaid
stateDiagram-v2
    [*] --> PENDING_PICKUP: Concierge registers parcel & triggers alert
    PENDING_PICKUP --> DELIVERED: Resident picks up package in person
    DELIVERED --> [*]: Handover signed off
```

### 4.3 Sequence Diagram: QR Code Check-In (< 1.5s)
```mermaid
sequenceDiagram
    autonumber
    actor Guest as Visitor / Visitante
    actor Concierge as Concierge / Portaria
    participant Front as Next.js Frontend
    participant API as Spring Boot API
    participant DB as PostgreSQL

    Guest->>Concierge: Presents QR Code on smartphone
    Concierge->>Front: Scans code via camera scanner
    Front->>API: POST /api/v1/access/validate-qr { tokenCode }
    
    rect rgb(240, 248, 255)
        Note over API, DB: Atomic validation (< 1.5s)
        API->>DB: SELECT * FROM access_authorizations WHERE token_code = ?
        API->>DB: UPDATE access_authorizations SET status = 'USED'
        API->>DB: INSERT INTO access_logs (direction='ENTRY', visitor_name, unit_id)
        API->>DB: INSERT INTO audit_logs (module='ACCESS', action='QR_VALIDATED')
    end

    API-->>Front: 200 OK (Unit 101, Authorized, Resident: Mariana)
    Front-->>Concierge: Displays green confirmation dialog
    Concierge->>Guest: Grants physical building access
```

### 4.4 Sequence Diagram: Package Reception and Pickup
```mermaid
sequenceDiagram
    autonumber
    actor Carrier as Delivery Carrier
    actor Concierge as Concierge / Portaria
    participant Front as Next.js Frontend
    participant API as Spring Boot API
    participant DB as PostgreSQL
    participant Mail as Email Service
    actor Resident as Resident / Morador

    Carrier->>Concierge: Delivers parcel for Unit 101 (Amazon)
    Concierge->>Front: Submits unit and carrier details
    Front->>API: POST /api/v1/packages
    API->>DB: INSERT INTO package_deliveries (status='PENDING_PICKUP')
    API->>Mail: Sends notification email to Unit 101 residents
    Mail-->>Resident: Notification: "New package waiting at front desk"
    API-->>Front: 201 Created (Tracking PKG-2026-0042)

    Note over Resident, Concierge: Resident arrives at reception desk
    Resident->>Concierge: "Picking up package for Unit 101"
    Concierge->>Front: Marks parcel as delivered
    Front->>API: PATCH /api/v1/packages/{id}/deliver
    API->>DB: UPDATE package_deliveries SET status='DELIVERED', picked_up_at=NOW()
    API-->>Front: 200 OK (Delivered)
    Concierge->>Resident: Hands over parcel
```
