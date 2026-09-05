# CondoTrack — Agile Backlog & Sprint Plan / Plan de Sprints / Planejamento de Sprints

> **Languages / Idiomas / Idiomas:**  
> [English](#1-english) | [Español](#2-español) | [Português (pt-BR)](#3-português-pt-br)

---

## 1. English

### 1.1 Sprints Roadmap
| Sprint | Focus | Key Deliverables |
| :--- | :--- | :--- |
| **Sprint 1** | **Foundation, Auth & Core Domain** | Docker/PostgreSQL setup, Flyway migrations, JWT RBAC auth, Building & Unit directory. |
| **Sprint 2** | **Concierge Operations, Access & Deliveries** | Guest QR code issue and camera scan in $< 1.5$s, parcel reception and handover sign-off. |
| **Sprint 3** | **Bookings, Moves & Incident Tickets** | Atomic conflict-free amenity reservations, move shift approvals, maintenance tickets with photos. |
| **Sprint 4** | **360° Unit Overview & Demo Pitch** | Consolidated 360° unit dossier, immutable audit timeline, end-to-end testing, cloud demo deploy. |

### 1.2 User Stories Summary (US-01 to US-10)
* **US-01 (Auth & RBAC):** As a user, I want to authenticate with email/password so I access features permitted for my role (`ADMIN`, `PORTARIA`, `MORADOR`).
* **US-02 (Property Structure):** As an admin, I want to register buildings, blocks, and units with resident links so building operations have an authoritative structure.
* **US-03 (Guest QR Code Pass):** As a resident, I want to generate a visitor pass with a temporary QR code so my guests enter without intercom friction.
* **US-04 (Concierge QR Scanner):** As a concierge, I want to scan visitor QR codes in $< 1.5$s so entry is verified and logged without front desk lines.
* **US-05 (Package Reception & Handover):** As a concierge, I want to log arriving packages and sign off resident pickups so mail isn't lost.
* **US-06 (Conflict-Free Amenity Booking):** As a resident, I want to view real-time amenity availability and book slots with zero double-booking.
* **US-07 (Moving Shift Scheduling):** As a resident/admin, I want to request and approve moving shifts so elevator access remains organized.
* **US-08 (Maintenance Reporting):** As a resident/concierge, I want to submit maintenance tickets with photos and track resolution progress.
* **US-09 (360° Unit Overview - Core MVP):** As an admin or concierge, I want to click any unit and instantly view all residents, packages, visits, bookings, moves, and tickets in one single screen.
* **US-10 (Audit Trail & Demo Ready):** As a dev team, I want all events recorded in `audit_logs` and the demo seeded for presentation.

### 1.3 Definition of Done (DoD)
1. **Code:** Follows architecture standards (`architecture.md`) and Git branching conventions (`setup-guide.md`).
2. **API:** Endpoints strictly conform to OpenAPI specs (`api-spec.md`) and return RFC 7807 error envelopes.
3. **Auditing:** State mutations record an immutable event in the `audit_logs` table.
4. **Validation:** Input validated on client (Zod) and backend (Bean Validation).
5. **Review:** PR approved by at least 1 teammate prior to merging into `develop`.

---

## 2. Español

### 2.1 Hoja de Ruta de Sprints
| Sprint | Enfoque Principal | Entregables Clave |
| :--- | :--- | :--- |
| **Sprint 1** | **Fundación, Auth y Dominio Base** | Docker/Postgres, migraciones Flyway, autenticación JWT con roles, ABM de edificios y departamentos. |
| **Sprint 2** | **Portería, Accesos y Encomiendas** | Emisión y lectura de QR en $< 1.5$s, registro de paquetes y entrega con aviso inmediato. |
| **Sprint 3** | **Reservas, Mudanzas e Incidentes** | Motor de reservas sin colisiones, aprobación de mudanzas por turnos, tickets de falla con fotos. |
| **Sprint 4** | **Vista 360° de la Unidad y Demo** | Pantalla 360° integrada, línea de tiempo de auditoría, pruebas completas y despliegue para pitch. |

### 2.2 Resumen de Historias de Usuario (US-01 a US-10)
* **US-01 (Autenticación y RBAC):** Como usuario, quiero iniciar sesión con email y contraseña para acceder a las opciones de mi rol (`ADMIN`, `PORTARIA`, `MORADOR`).
* **US-02 (Estructura Inmueble):** Como administrador, quiero dar de alta edificios y unidades para estructurar el padrón de residentes.
* **US-03 (Pase QR para Visitas):** Como residente, quiero generar un pase con código QR temporal para agilizar el ingreso de mis invitados.
* **US-04 (Escáner QR en Portería):** Como recepcionista, quiero escanear el QR del visitante en $< 1.5$s para autorizar y registrar su ingreso.
* **US-05 (Recepción y Baja de Paquetes):** Como recepcionista, quiero registrar paquetes y darles salida firmada para evitar extravíos.
* **US-06 (Reserva de Amenidades sin Conflictos):** Como residente, quiero consultar disponibilidad y reservar parrillas sin riesgo de solapamientos.
* **US-07 (Programación de Mudanzas):** Como residente y administrador, quiero coordinar turnos de mudanza para no saturar los montacargas.
* **US-08 (Gestión de Incidentes):** Como morador o portero, quiero abrir reclamos con fotos y seguir el avance del mantenimiento.
* **US-09 (Vista 360° de la Unidad - Clave MVP):** Como administrador o portero, quiero seleccionar una unidad y ver en una sola pantalla todos sus residentes, visitas, paquetes, reservas y reclamos con auditoría.
* **US-10 (Trazabilidad y Demostración):** Como equipo, queremos que toda acción quede asentada en `audit_logs` y la demo lista para el pitch.

### 2.3 Criterio de Finalizado (Definition of Done)
1. **Código:** Respeta los lineamientos de capas y convención de branches.
2. **API:** Endpoints conformes al contrato `api-spec.md` con manejo de errores RFC 7807.
3. **Auditoría:** Cada mutación operativa persiste su snapshot en `audit_logs`.
4. **Validación:** Doble validación en cliente (Zod) y servidor (Bean Validation).
5. **Revisión:** Al menos 1 aprobación en el Pull Request antes del merge a `develop`.

---

## 3. Português (pt-BR)

### 3.1 Cronograma de Sprints
| Sprint | Foco Principal | Entregáveis de Valor |
| :--- | :--- | :--- |
| **Sprint 1** | **Fundação, Auth e Domínio Base** | Setup Docker/Postgres, migrations Flyway, login JWT com RBAC, cadastro de Prédios e Unidades. |
| **Sprint 2** | **Portaria, Acessos e Encomendas** | Geração e leitura de QR Code em $< 1.5$s, recebimento de pacotes e baixa com alerta imediato. |
| **Sprint 3** | **Reservas, Mudanças e Incidentes** | Motor de reservas sem conflito, fluxo de mudanças com aprovação do síndico, chamados com foto. |
| **Sprint 4** | **Visão 360° da Unidade e Demo** | Painel 360° unificado, linha do tempo de auditoria, testes de ponta a ponta e deploy da demo. |

### 3.2 Histórias de Usuário (US-01 a US-10)
* **US-01 (Autenticação e RBAC):** Como usuário do sistema, quero fazer login com e-mail e senha para acessar as funções do meu perfil (`ADMIN`, `PORTARIA`, `MORADOR`).
* **US-02 (Estrutura do Imóvel):** Como síndico, quero cadastrar edifícios, blocos e unidades com vínculo de moradores para manter a base atualizada.
* **US-03 (Pré-autorização com QR Code):** Como morador, quero emitir convites com QR Code para visitantes entrarem sem espera na portaria.
* **US-04 (Leitura de QR na Portaria):** Como porteiro, quero validar o QR Code via câmera em $< 1.5$s para agilizar a entrada e registrar o acesso.
* **US-05 (Recepção e Baixa de Encomendas):** Como porteiro, quero cadastrar encomendas e dar baixa na entrega presencial com carimbo do operador.
* **US-06 (Reserva de Áreas Comuns sem Conflito):** Como morador, quero visualizar a agenda e reservar espaços sociais com bloqueio atômico de choque de horários.
* **US-07 (Programação de Mudanças):** Como morador e síndico, quero solicitar e aprovar turnos de mudança para organizar o elevador de serviço.
* **US-08 (Chamados de Manutenção):** Como morador ou porteiro, quero reportar falhas com fotos e acompanhar o conserto.
* **US-09 (Painel Visão 360° da Unidade - Chave MVP):** Como administrador ou porteiro, quero selecionar qualquer unidade e visualizar em tela única moradores, encomendas, visitas, reservas, mudanças e chamados.
* **US-10 (Trilha de Auditoria e Demonstração):** Como time, queremos que todas as mutações gravem eventos em `audit_logs` e os dados do seed permitam uma apresentação perfeita.

### 3.3 Definição de Pronto (Definition of Done)
1. **Padrão:** Código em conformidade com `architecture.md` e branches conforme `setup-guide.md`.
2. **API:** Endpoints rigorosamente fiéis ao `api-spec.md` com envelopes de erro RFC 7807.
3. **Auditoria:** Toda mutação relevante gera log imutável na tabela `audit_logs`.
4. **Validação:** Formulários com validação estrita no frontend (Zod) e no backend (Bean Validation).
5. **Revisão:** PR aprovado por ao menos 1 colega de equipe antes do merge na `develop`.
