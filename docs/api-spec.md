# CondoTrack — REST API Specification (OpenAPI / Springdoc) / Especificación de API / Especificação de API

> **Languages / Idiomas / Idiomas:**  
> [English](#1-english) | [Español](#2-español) | [Português (pt-BR)](#3-português-pt-br) | [Endpoint Payloads Reference](#4-endpoint-payloads-reference)

---

## 1. English

### 1.1 Global Conventions
* **Base URL:** `/api/v1`
* **Content-Type:** `application/json; charset=UTF-8`
* **Security:** `Authorization: Bearer <JWT_TOKEN>` on protected endpoints.
* **Date Format:** ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`).
* **Error Envelope (RFC 7807):** Consistent error structure (`type`, `title`, `status`, `detail`, `instance`, `timestamp`, and optional `fieldErrors`).

### 1.2 Endpoints Summary by Module
| Module | Method | Endpoint | Access / Role | Description |
| :--- | :---: | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/login` | Public | Authenticates credentials, returns JWT, user info, and linked units. |
| **Auth** | `GET` | `/api/v1/auth/me` | Authenticated | Returns currently authenticated user context. |
| **Overview** | `GET` | `/api/v1/units/{id}/overview-360` | `ADMIN`, `PORTARIA`, `MORADOR` | **Core MVP Endpoint:** Consolidated 360° overview of unit, residents, packages, visits, bookings, and tickets. |
| **Access** | `POST` | `/api/v1/access/authorizations` | `MORADOR`, `ADMIN` | Issues guest pre-authorization and generates QR token. |
| **Access** | `POST` | `/api/v1/access/validate-qr` | `PORTARIA`, `ADMIN` | Scans and validates guest QR token in $< 1.5$s, logging entry. |
| **Access** | `POST` | `/api/v1/access/manual-entry` | `PORTARIA`, `ADMIN` | Logs unscheduled visitor after resident phone confirmation. |
| **Access** | `POST` | `/api/v1/access/checkout` | `PORTARIA`, `ADMIN` | Records guest exit. |
| **Packages** | `POST` | `/api/v1/packages` | `PORTARIA`, `ADMIN` | Registers arrived package and sends instant alert to unit. |
| **Packages** | `GET` | `/api/v1/packages/pending` | `PORTARIA`, `ADMIN` | Lists parcels awaiting resident pickup. |
| **Packages** | `PATCH` | `/api/v1/packages/{id}/deliver` | `PORTARIA`, `ADMIN` | Marks package delivered to resident with operator signature. |
| **Bookings** | `GET` | `/api/v1/common-areas` | Authenticated | Lists building amenities and operating rules. |
| **Bookings** | `POST` | `/api/v1/reservations` | `MORADOR`, `ADMIN` | Books amenity slot; returns `409 Conflict` on overlap. |
| **Bookings** | `DELETE` | `/api/v1/reservations/{id}` | Author / `ADMIN` | Cancels confirmed reservation. |
| **Moves** | `POST` | `/api/v1/moves` | `MORADOR` | Requests move-in or move-out date and shift. |
| **Moves** | `PATCH` | `/api/v1/moves/{id}/status` | `ADMIN` | Reviews and approves or rejects move schedule. |
| **Incidents**| `POST` | `/api/v1/incidents` | Authenticated | Reports building or unit maintenance issue with photo. |
| **Incidents**| `PATCH` | `/api/v1/incidents/{id}/status` | `ADMIN` | Assigns technician and updates lifecycle status. |
| **Audit** | `GET` | `/api/v1/audit-logs` | `ADMIN`, `PORTARIA` | Paged query of chronological operational events. |

---

## 2. Español

### 2.1 Convenciones Globales
* **URL Base:** `/api/v1`
* **Formato:** `application/json; charset=UTF-8`
* **Autenticación:** Cabecera `Authorization: Bearer <JWT_TOKEN>`.
* **Formato de Fechas:** ISO 8601 UTC.
* **Envelope de Error (RFC 7807):** Formato homogéneo con campos `title`, `status`, `detail`, `instance` y `fieldErrors`.

### 2.2 Resumen de Endpoints por Módulo
| Módulo | Método | Ruta | Acceso / Rol | Descripción |
| :--- | :---: | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/login` | Público | Autentica usuario y devuelve token JWT con perfil. |
| **Auth** | `GET` | `/api/v1/auth/me` | Autenticado | Devuelve contexto del usuario en sesión. |
| **Vista 360°**| `GET` | `/api/v1/units/{id}/overview-360` | `ADMIN`, `PORTARIA`, `MORADOR` | **Endpoint Clave MVP:** Dossier 360° con residentes, paquetes, visitas, reservas y reclamos. |
| **Accesos** | `POST` | `/api/v1/access/authorizations` | `MORADOR`, `ADMIN` | Genera autorización con código QR para visitantes. |
| **Accesos** | `POST` | `/api/v1/access/validate-qr` | `PORTARIA`, `ADMIN` | Valida código QR en $< 1.5$s y registra ingreso. |
| **Accesos** | `POST` | `/api/v1/access/manual-entry` | `PORTARIA`, `ADMIN` | Registra visitas imprevistas tras confirmación telefónica. |
| **Accesos** | `POST` | `/api/v1/access/checkout` | `PORTARIA`, `ADMIN` | Registra egreso del visitante. |
| **Deliveries**| `POST` | `/api/v1/packages` | `PORTARIA`, `ADMIN` | Registra paquete y notifica al residente de inmediato. |
| **Deliveries**| `GET` | `/api/v1/packages/pending` | `PORTARIA`, `ADMIN` | Lista paquetes pendientes de retiro en portería. |
| **Deliveries**| `PATCH` | `/api/v1/packages/{id}/deliver` | `PORTARIA`, `ADMIN` | Registra entrega física del paquete al residente. |
| **Reservas** | `GET` | `/api/v1/common-areas` | Autenticado | Consulta áreas comunes disponibles. |
| **Reservas** | `POST` | `/api/v1/reservations` | `MORADOR`, `ADMIN` | Reserva espacio común; devuelve `409 Conflict` si está ocupado. |
| **Reservas** | `DELETE` | `/api/v1/reservations/{id}` | Autor / `ADMIN` | Cancela reserva confirmada. |
| **Mudanzas** | `POST` | `/api/v1/moves` | `MORADOR` | Solicita turno de mudanza (mañana/tarde). |
| **Mudanzas** | `PATCH` | `/api/v1/moves/{id}/status` | `ADMIN` | Aprueba o rechaza solicitud de mudanza con notas. |
| **Incidentes**| `POST` | `/api/v1/incidents` | Autenticado | Abre ticket de mantenimiento con fotos y prioridad. |
| **Incidentes**| `PATCH` | `/api/v1/incidents/{id}/status` | `ADMIN` | Asigna responsable y avanza el estado del ticket. |
| **Auditoría** | `GET` | `/api/v1/audit-logs` | `ADMIN`, `PORTARIA` | Consulta paginada del historial de eventos del edificio. |

---

## 3. Português (pt-BR)

### 3.1 Convenções Globais
* **URL Base:** `/api/v1`
* **Formato:** `application/json; charset=UTF-8`
* **Autenticação:** Header HTTP `Authorization: Bearer <JWT_TOKEN>`.
* **Formato de Datas:** ISO 8601 UTC.
* **Envelope de Erro (RFC 7807):** Padrão Problem Details com campos `title`, `status`, `detail`, `instance` e lista `fieldErrors`.

### 3.2 Resumo dos Endpoints por Módulo
| Módulo | Método | Rota | Acesso / Perfil | Descrição |
| :--- | :---: | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/login` | Público | Autentica credenciais e retorna JWT com papéis e unidades vinculadas. |
| **Auth** | `GET` | `/api/v1/auth/me` | Autenticado | Retorna os dados do usuário autenticado no token atual. |
| **Visão 360°**| `GET` | `/api/v1/units/{id}/overview-360` | `ADMIN`, `PORTARIA`, `MORADOR` | **Endpoint Chave do MVP:** Dossiê unificado 360° da unidade (moradores, encomendas, visitas, reservas, chamados). |
| **Acessos** | `POST` | `/api/v1/access/authorizations` | `MORADOR`, `ADMIN` | Morador emite convite com QR Code e janela de validade. |
| **Acessos** | `POST` | `/api/v1/access/validate-qr` | `PORTARIA`, `ADMIN` | Validação atômica do QR Code na portaria em $< 1.5$s com check-in. |
| **Acessos** | `POST` | `/api/v1/access/manual-entry` | `PORTARIA`, `ADMIN` | Registro de visitante não agendado após contato com o apartamento. |
| **Acessos** | `POST` | `/api/v1/access/checkout` | `PORTARIA`, `ADMIN` | Registro de saída do visitante. |
| **Encomendas**| `POST` | `/api/v1/packages` | `PORTARIA`, `ADMIN` | Registra encomenda recebida e dispara alerta imediato aos moradores. |
| **Encomendas**| `GET` | `/api/v1/packages/pending` | `PORTARIA`, `ADMIN` | Lista de encomendas aguardando retirada na recepção. |
| **Encomendas**| `PATCH` | `/api/v1/packages/{id}/deliver` | `PORTARIA`, `ADMIN` | Registra a baixa e entrega física do pacote ao morador. |
| **Reservas** | `GET` | `/api/v1/common-areas` | Autenticado | Lista áreas sociais cadastradas e regras de uso. |
| **Reservas** | `POST` | `/api/v1/reservations` | `MORADOR`, `ADMIN` | Solicita reserva com validação atômica contra sobreposição (`409 Conflict`). |
| **Reservas** | `DELETE` | `/api/v1/reservations/{id}` | Autor / `ADMIN` | Cancela reserva confirmada. |
| **Mudanças** | `POST` | `/api/v1/moves` | `MORADOR` | Agenda turno de mudança (manhã/tarde). |
| **Mudanças** | `PATCH` | `/api/v1/moves/{id}/status` | `ADMIN` | Parecer do síndico (aprovação/rejeição) com justificativa. |
| **Chamados** | `POST` | `/api/v1/incidents` | Autenticado | Abre chamado de manutenção com fotos, categoria e urgência. |
| **Chamados** | `PATCH` | `/api/v1/incidents/{id}/status` | `ADMIN` | Atribui técnico e atualiza o ciclo de vida do chamado. |
| **Auditoria** | `GET` | `/api/v1/audit-logs` | `ADMIN`, `PORTARIA` | Consulta a linha do tempo cronológica de eventos operacionais. |

---

## 4. Endpoint Payloads Reference

### 4.1 Authentication: `POST /api/v1/auth/login`
```json
// Request
{
  "email": "admin@condotrack.com",
  "password": "password123"
}

// Response (200 OK)
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": "a1000000-0000-0000-0000-000000000001",
    "name": "Carlos Síndico",
    "email": "admin@condotrack.com",
    "role": "ADMIN",
    "units": []
  }
}
```

### 4.2 360° Unit Overview: `GET /api/v1/units/{unitId}/overview-360`
```json
// Response (200 OK)
{
  "unit": {
    "id": "u1000000-0000-0000-0000-000000000101",
    "buildingName": "Edifício Solar das Palmeiras",
    "block": "Torre A",
    "numberCode": "101",
    "floor": 1
  },
  "residents": [
    {
      "userId": "m1000000-0000-0000-0000-000000000001",
      "name": "Mariana Moradora",
      "phone": "+5511999990003",
      "relationshipType": "PROPRIETARIO"
    }
  ],
  "pendingPackages": [
    {
      "id": "p1000000-0000-0000-0000-000000000001",
      "carrierName": "Mercado Livre",
      "trackingCode": "PKG-2026-0042",
      "receivedAt": "2026-09-05T14:30:00Z"
    }
  ],
  "recentAccesses": [
    {
      "visitorName": "João Pintor",
      "visitorDocument": "123.456.789-00",
      "direction": "ENTRY",
      "checkedByOperator": "Roberto Porteiro",
      "timestamp": "2026-09-05T10:15:00Z"
    }
  ],
  "upcomingReservations": [
    {
      "commonAreaName": "Churrasqueira Gourmet",
      "startTime": "2026-09-06T12:00:00Z",
      "endTime": "2026-09-06T16:00:00Z",
      "status": "CONFIRMED"
    }
  ],
  "scheduledMove": {
    "moveType": "IN",
    "scheduledDate": "2026-09-12",
    "shift": "MORNING",
    "status": "APPROVED"
  },
  "openIncidents": [
    {
      "id": "i1000000-0000-0000-0000-000000000001",
      "title": "Vazamento na torneira da área de serviço",
      "priority": "MEDIUM",
      "status": "IN_PROGRESS",
      "createdAt": "2026-09-04T18:00:00Z"
    }
  ],
  "recentAuditTimeline": [
    {
      "module": "PACKAGE",
      "action": "PACKAGE_RECEIVED",
      "description": "Encomenda recebida por Roberto Porteiro",
      "timestamp": "2026-09-05T14:30:00Z"
    }
  ]
}
```

### 4.3 QR Code Validation: `POST /api/v1/access/validate-qr`
```json
// Request
{
  "tokenCode": "AUTH-QR-8F92D0A1E"
}

// Response (200 OK — Entry Approved)
{
  "authorized": true,
  "authorizationId": "a2000000-0000-0000-0000-000000000001",
  "unitNumber": "101",
  "block": "Torre A",
  "residentName": "Mariana Moradora",
  "visitorName": "Carlos Silva",
  "registeredAt": "2026-09-06T09:12:00Z"
}
```

### 4.4 Swagger / OpenAPI Interactive Documentation
* **Swagger UI:** `http://localhost:8080/swagger-ui.html`
* **OpenAPI 3.0 JSON:** `http://localhost:8080/v3/api-docs`
