# CondoTrack — Technical Requirements Specification / Especificación de Requisitos / Especificação de Requisitos

> **Languages / Idiomas / Idiomas:**  
> [English](#1-english) | [Español](#2-español) | [Português (pt-BR)](#3-português-pt-br)

---

## 1. English

### 1. Overview and MVP Objective
#### 1.1 Context
**CondoTrack** is a centralized platform for residential and commercial condominium management. Its goal is to solve operational fragmentation—currently scattered across WhatsApp chats, reception logbooks, and spreadsheets—turning everyday processes into an **auditable, unified digital workflow**.

#### 1.2 MVP Objective
Deliver a Minimum Viable Product focused on **operational traceability and centralization**, allowing Administration, Concierge, and Residents to operate from a single source of truth structured under the hierarchy:
$$\text{Building} \longrightarrow \text{Unit} \longrightarrow \text{Resident} \longrightarrow \text{Operations (Access, Deliveries, Bookings, Moves, Incidents)}$$

#### 1.3 MVP Success Metric
> An authorized user (Admin or Concierge) can select any **Building** or **Unit** and immediately view on a single screen ("360° Unit Overview") the status and history of residents, authorizations/accesses, pending/picked-up packages, amenity reservations, scheduled moves, and maintenance tickets with audit logs.

---

### 2. MVP Scope: In-Scope vs. Out-of-Scope
| Module / Feature | In MVP Scope (Essential) | Out of MVP Scope (Future Phases) |
| :--- | :--- | :--- |
| **Access Control** | Resident pre-authorization with QR code/token, concierge check-in/out validation | Turnstile hardware integration, real-time facial recognition |
| **Deliveries/Mail** | Concierge reception logging, resident alerts, pickup sign-off with timestamp | Smart lockers integration, automatic parcel OCR scanning |
| **Common Areas** | Real-time availability, conflict-free booking, cancellation | Payment gateway for fees, automatic condo fee billing |
| **Moving Schedules** | Shift booking (in/out), conflict prevention, admin approval | Insurance integrations, digital video inspection |
| **Incidents/Maintenance** | Ticket opening with photos, assignment, status pipeline, resolution logs | External ERP purchasing, automated vendor quoting |
| **360° Unit View / Audit** | Consolidated dashboard by Unit/Building, chronological audit timeline | AI predictive analytics, BI warehouse data export |
| **Communication** | In-app and email transactional notifications | Full bidirectional chat, official paid WhatsApp Business API |

---

### 3. User Roles (RBAC)
1. **Administrator / Property Manager (`ADMIN`)**:
   - Manages buildings, units, staff, and residents.
   - Sets amenity and moving rules.
   - Assigns and resolves maintenance incidents.
   - Accesses general indicators and full audit logs.
2. **Concierge / Front Desk Operator (`PORTARIA`)**:
   - Quick lookup of units and residents.
   - Validates visitor QR codes and logs entries/exits.
   - Registers package arrivals and marks pickups.
   - Reports immediate operational incidents.
3. **Resident / Property Owner (`MORADOR`)**:
   - Views linked unit data.
   - Issues visitor pre-authorizations with QR codes.
   - Receives delivery notifications and views package history.
   - Books common areas and schedules moving shifts.
   - Opens and tracks maintenance requests.

---

### 4. Functional Requirements (FR)
* **FR-01 (Hierarchical Structure)**: Manage Building $\rightarrow$ Block/Tower (optional) $\rightarrow$ Unit.
* **FR-02 (User-Unit Linking)**: Associate residents to units specifying relationship (Owner Resident, Owner Non-Resident, Tenant).
* **FR-03 (Authentication & RBAC)**: Secure authentication via email/password, password recovery, and role-based access (`ADMIN`, `PORTARIA`, `MORADOR`).
* **FR-04 (Visitor Pre-Authorization)**: Resident generates guest authorization with name, ID, validity window, and unique QR code.
* **FR-05 (Concierge QR Validation)**: Concierge validates QR codes via camera or token input, logging check-in with timestamp and operator.
* **FR-06 (Check-Out & Unscheduled Access)**: Concierge logs visitor exits and handles unscheduled visits after resident confirmation.
* **FR-07 (Package Reception)**: Concierge logs arriving deliveries linked to a unit, specifying carrier, type, and tracking code.
* **FR-08 (Delivery Notification)**: System immediately notifies unit residents when a package arrives.
* **FR-09 (Package Pickup)**: Concierge registers pickup with recipient name, operator ID, and timestamp.
* **FR-10 (Common Area Configuration)**: Admin configures amenities, capacities, opening hours, and booking lead times.
* **FR-11 (Conflict-Free Booking)**: Residents book available amenities; system atomically prevents double-booking.
* **FR-12 (Booking Cancellation)**: Users can cancel bookings according to policy, retaining audit logs.
* **FR-13 (Move Scheduling)**: Residents request move-in/out dates and shifts (Morning/Afternoon).
* **FR-14 (Move Validation)**: System blocks conflicting shifts; admin reviews and approves/rejects requests.
* **FR-15 (Incident Reporting)**: Users open maintenance tickets with title, category, priority, and photo attachment.
* **FR-16 (Incident Lifecycle)**: Admin assigns technician and updates status (`OPEN` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED` $\rightarrow$ `CLOSED`).
* **FR-17 (Resolution Logs)**: Each ticket records updates, actions taken, and final resolution details.
* **FR-18 (360° Unit Overview Dashboard)**: Consolidated view per unit displaying residents, pending packages, recent visits, bookings, moves, and tickets.
* **FR-19 (Immutable Audit Log)**: Append-only log recording timestamp, user ID, unit ID, module, action, and metadata.
* **FR-20 (System Notifications)**: Automated in-app and email notifications for critical operational events.

---

### 5. Non-Functional Requirements (NFR)
* **NFR-01 (Security & Encryption)**: BCrypt password hashing, HTTPS/TLS for all communication, secure JWT.
* **NFR-02 (Data Isolation)**: Residents can only access their own unit's data; tenant privacy is strictly enforced.
* **NFR-03 (Data Privacy)**: Visitor documents and photos are restricted to staff; QR codes expire upon use or time limit.
* **NFR-04 (Concierge Performance)**: QR code validation must complete in $< 1.5$ seconds.
* **NFR-05 (Concurrency & Consistency)**: ACID transactions ensure zero double-booking for amenities and move shifts.
* **NFR-06 (Mobile-First Usability)**: Resident UI optimized for mobile; concierge UI optimized for fast tablet/desktop operation.
* **NFR-07 (Fast Front Desk Operations)**: Minimal-click workflows for package delivery and QR scanning.
* **NFR-08 (Audit Immutability)**: Operational history stored append-only with no hard deletes.

---

### 6. MVP Acceptance Criteria (Definition of Done)
1. **360° Overview Test**: Selecting Unit 101 displays residents, pending parcels, last 5 visitors, upcoming bookings, and open tickets on one screen.
2. **QR Access Test**: Resident creates QR; concierge scans it; access is verified, logged, and updated in $< 1.5$s.
3. **Delivery Lifecycle Test**: Package received logs notification; resident sees it as pending; pickup marks it delivered with operator stamp.
4. **Conflict Prevention Test**: Simultaneous reservations for the same amenity interval result in exactly one confirmation and one rejection.

---

## 2. Español

### 1. Visión General y Objetivo del MVP
#### 1.1 Contexto
**CondoTrack** es una plataforma centralizada orientada a la administración de edificios y condominios. El objetivo del proyecto es resolver la fragmentación de la información operativa —actualmente dispersa en WhatsApp, cuadernos de recepción y planillas paralelas— transformando los procesos cotidianos en un **flujo digital trazable y unificado**.

#### 1.2 Objetivo del MVP
Desarrollar un Producto Mínimo Viable (MVP) enfocado en la **trazabilidad y centralización operativa**, permitiendo que Administración, Recepción y Residentes operen desde una única fuente de verdad estructurada bajo la jerarquía:
$$\text{Edificio} \longrightarrow \text{Unidad} \longrightarrow \text{Residente} \longrightarrow \text{Operaciones (Accesos, Deliveries, Reservas, Mudanzas, Incidentes)}$$

#### 1.3 Criterio de Éxito del MVP
> Un usuario autorizado (Administración o Recepción) puede seleccionar cualquier **Edificio** o **Unidad** y visualizar de inmediato, en una única pantalla ("Vista 360° de la Unidad"), el estado actual y el historial completo de: residentes vinculados, autorizaciones y accesos, encomiendas pendientes y retiradas, reservas de espacios, mudanzas programadas y reclamos de mantenimiento con auditoría.

---

### 2. Alcance del MVP: Dentro vs. Fuera del Alcance
| Módulo / Funcionalidad | En el Alcance del MVP (Indispensable) | Fuera del Alcance del MVP (Fases Futuras) |
| :--- | :--- | :--- |
| **Accesos** | Preautorización con código QR/token, validación y registro de check-in/out en recepción | Integración con molinetes físicos, biometría facial en tiempo real |
| **Deliveries/Correspondencia** | Registro de recepción en portería, alerta al residente, registro de retiro con fecha/hora | Lockers inteligentes integrados, OCR automático de etiquetas |
| **Espacios Comunes** | Calendario de disponibilidad, reserva sin conflictos de horarios, cancelación | Pasarela de pagos integrada, cálculo automático en expensas |
| **Mudanzas** | Programación de ingreso/egreso, control de turnos, aprobación por administración | Integración con aseguradoras, inspección digital por video |
| **Incidentes/Mantenimiento** | Apertura con fotos, asignación de responsable, flujo de estados, resolución | Órdenes de compra con ERP externo, cotizaciones con proveedores |
| **Vista 360° / Auditoría** | Panel unificado por Unidad y Edificio, línea de tiempo cronológica | Reportes predictivos con IA, exportación a data warehouse |
| **Comunicación** | Notificaciones in-app y correo electrónico para eventos críticos | Chat bidireccional en tiempo real, API oficial de WhatsApp |

---

### 3. Perfiles de Usuario (RBAC)
1. **Administrador (`ADMIN`)**: Registra inmuebles, define reglas, gestiona incidentes y audita la operación 360°.
2. **Recepción / Portería (`PORTARIA`)**: Valida códigos QR de visitantes, registra entradas/salidas, recibe paquetes y entrega encomiendas.
3. **Residente / Propietario (`MORADOR`)**: Emite autorizaciones QR, recibe alertas de entrega, reserva áreas comunes y reporta incidentes.

---

### 4. Requisitos Funcionales (RF)
* **RF-01 (Estructura Jerárquica)**: Registro de Edificio $\rightarrow$ Bloque/Torre $\rightarrow$ Unidad.
* **RF-02 (Vinculación de Usuarios)**: Asociación de moradores a unidades con rol de propietario residente, no residente o inquilino.
* **RF-03 (Autenticación Segura)**: Acceso por email/contraseña con control de roles (`ADMIN`, `PORTARIA`, `MORADOR`).
* **RF-04 (Preautorización QR)**: Residente genera autorización de visitante con código QR temporal.
* **RF-05 (Validación en Recepción)**: Lectura de QR o ingreso de código con check-in en menos de 1.5 segundos.
* **RF-06 (Check-Out e Ingreso Manual)**: Registro de salida y de visitas imprevistas tras confirmación con la unidad.
* **RF-07 (Recepción de Paquetes)**: Portería registra paquete indicando unidad, tipo y transportadora.
* **RF-08 (Alerta Inmediata)**: Notificación automática al residente tras el registro de encomienda.
* **RF-09 (Retiro de Encomienda)**: Registro de entrega física al residente con fecha, hora y operador.
* **RF-10 (Gestión de Espacios)**: Configuración de áreas comunes, aforos y franjas horarias.
* **RF-11 (Reserva sin Conflictos)**: Motor de reservas con validación atómica que impide superposiciones.
* **RF-12 (Cancelación de Reserva)**: Cancelación según políticas con registro de trazabilidad.
* **RF-13 (Solicitud de Mudanza)**: Agendamiento de mudanzas por turnos (mañana/tarde).
* **RF-14 (Aprobación de Mudanzas)**: Control de conflictos y aprobación obligatoria por la administración.
* **RF-15 (Apertura de Incidentes)**: Creación de ticket con título, categoría, prioridad y fotografía.
* **RF-16 (Ciclo de Vida de Incidentes)**: Asignación y estados: `Abierto` $\rightarrow$ `En Progreso` $\rightarrow$ `Resuelto` $\rightarrow$ `Cerrado`.
* **RF-17 (Registro de Solución)**: Historial de acciones y detalle de la solución aplicada.
* **RF-18 (Panel 360° de la Unidad)**: Vista única con residentes, paquetes, visitas, reservas, mudanzas y reclamos.
* **RF-19 (Auditoría Inmutable)**: Registro append-only con timestamp, usuario, unidad, módulo y metadata.
* **RF-20 (Notificaciones)**: Disparo in-app y por correo electrónico para eventos clave.

---

### 5. Requisitos No Funcionales (RNF)
* **RNF-01 (Seguridad)**: Hash BCrypt, cifrado TLS/HTTPS en tránsito y tokens JWT firmados.
* **RNF-02 (Aislamiento de Datos)**: Residentes únicamente acceden a la información de su propia unidad.
* **RNF-03 (Privacidad de Visitantes)**: Documentos restringidos a personal autorizado y expiración de QR.
* **RNF-04 (Rendimiento en Portería)**: Validación de autorizaciones completada en $< 1.5$ segundos.
* **RNF-05 (Consistencia Atómica)**: Transacciones ACID para impedir reservas simultáneas del mismo espacio.
* **RNF-06 (Diseño Responsivo)**: Interfaz morador optimizada para móvil; interfaz portería para tablet/desktop.
* **RNF-07 (Flujo Ágil)**: Mínimos clics para despachar paquetes y registrar visitas.
* **RNF-08 (Inmutabilidad)**: Historial operativo append-only sin borrado físico de eventos.

---

### 6. Criterios de Aceptación del MVP (Definition of Done)
1. **Prueba Vista 360°**: Selección de unidad muestra datos consolidados en pantalla única con historial clicable.
2. **Prueba Check-in QR**: Generación de QR, escaneo en recepción y registro de ingreso en menos de 1.5s.
3. **Prueba Paquetería**: Recepción genera alerta inmediata; retiro presencial actualiza a entregado.
4. **Prueba Bloqueo de Conflictos**: Solicitudes coincidentes para el mismo espacio resultan en 1 éxito y 1 rechazo 409.

---

## 3. Português (pt-BR)

### 1. Visão Geral e Objetivo do MVP
#### 1.1 Contexto
O **CondoTrack** é uma plataforma centralizada para administração de condomínios residenciais e comerciais. O objetivo é solucionar a fragmentação das rotinas operacionais — hoje dispersas em grupos de WhatsApp, livros de portaria físicos e planilhas paralelas — transformando os processos cotidianos em um **fluxo digital rastreável e unificado**.

#### 1.2 Objetivo do MVP
Desenvolver um Produto Mínimo Viável (MVP) focado na **rastreabilidade e centralização operacional**, viabilizando que Administração, Portaria e Moradores operem a partir de uma fonte única de verdade sob a hierarquia:
$$\text{Edifício} \longrightarrow \text{Unidade} \longrightarrow \text{Morador} \longrightarrow \text{Operações (Acessos, Entregas, Reservas, Mudanças, Incidentes)}$$

#### 1.3 Critério de Sucesso do MVP
> Um usuário autorizado (Administração ou Portaria) pode selecionar qualquer **Edifício** ou **Unidade** e visualizar imediatamente, em uma única tela ("Visão 360° da Unidade"), o estado atual e o histórico completo de: moradores vinculados, autorizações e acessos, encomendas pendentes e retiradas, reservas de áreas comuns, mudanças agendadas e chamados de manutenção com auditoria.

---

### 2. Escopo do MVP: Dentro vs. Fora do Escopo
| Módulo / Funcionalidade | No Escopo do MVP (Indispensável) | Fora do Escopo do MVP (Fases Futuras) |
| :--- | :--- | :--- |
| **Acessos** | Pré-autorização com QR Code/token, validação e registro de check-in/out na portaria | Integração com catracas físicas, biometria facial em tempo real |
| **Deliveries/Correio** | Registro de recebimento na portaria, alerta ao morador, registro de retirada | Armários inteligentes (Smart Lockers), OCR automático de pacotes |
| **Áreas Comuns** | Calendário de disponibilidade, agendamento sem conflito, cancelamento | Cobrança integrada com gateway de pagamento, lançamento em boleto |
| **Mudanças** | Agendamento por turnos (entrada/saída), controle de conflitos, aprovação do síndico | Integração com seguradoras, vistoria digital por vídeo |
| **Incidentes/Manutenção** | Abertura com fotos, atribuição de responsável, fluxo de status, histórico | Ordens de compra integradas a ERP externo, cotações automáticas |
| **Visão 360° / Auditoria** | Painel unificado por Unidade e Edifício, timeline cronológica | Relatórios preditivos com IA, BI exportável para data warehouse |
| **Comunicação** | Notificações in-app e por e-mail para eventos críticos | Chat bidirecional em tempo real, integração direta com API WhatsApp |

---

### 3. Perfis de Usuário (RBAC)
1. **Administrador / Síndico (`ADMIN`)**: Cadastra edifícios, unidades, usuários, aprova mudanças, gerencia chamados e audita a operação 360°.
2. **Operador de Portaria (`PORTARIA`)**: Valida QR Code de visitantes, registra entradas/saídas, recebe encomendas e efetua baixas presenciais.
3. **Morador / Proprietário (`MORADOR`)**: Gera convites QR, recebe notificações de encomendas, agenda áreas comuns e abre chamados de manutenção.

---

### 4. Requisitos Funcionais (RF)
* **RF-01 (Estrutura Hierárquica)**: Cadastro de Edifício $\rightarrow$ Bloco/Torre $\rightarrow$ Unidade.
* **RF-02 (Vinculação de Moradores)**: Associação de usuários às unidades (proprietário residente, não-residente ou inquilino).
* **RF-03 (Autenticação Segura)**: Login com e-mail/senha, recuperação e controle RBAC (`ADMIN`, `PORTARIA`, `MORADOR`).
* **RF-04 (Pré-autorização QR)**: Emissão de autorização de visita com geração de código QR temporário.
* **RF-05 (Validação na Portaria)**: Leitura de QR Code ou código alfanumérico com liberação em menos de 1.5 segundos.
* **RF-06 (Check-Out e Entrada Manual)**: Registro de saída e de visitas não programadas com validação do morador.
* **RF-07 (Recepção de Encomendas)**: Portaria registra pacotes vinculados à unidade, transportadora e tipo.
* **RF-08 (Alerta Imediato)**: Disparo imediato de notificação aos moradores da unidade ao receber um pacote.
* **RF-09 (Baixa de Encomenda)**: Registro de retirada presencial com identificação de quem retirou, data, hora e operador.
* **RF-10 (Configuração de Espaços)**: Cadastro de áreas comuns, limites de capacidade, regras e horários.
* **RF-11 (Reserva sem Conflito)**: Mecanismo de reservas atômico impedindo sobreposição de horários.
* **RF-12 (Cancelamento de Reserva)**: Cancelamento conforme regras com registro de histórico e motivo.
* **RF-13 (Agendamento de Mudanças)**: Solicitação de turno (manhã/tarde) para entrada ou saída.
* **RF-14 (Aprovação de Mudanças)**: Bloqueio de choques de horário e validação obrigatória pela administração.
* **RF-15 (Abertura de Chamados)**: Criação de chamado de manutenção com fotos, categoria e urgência.
* **RF-16 (Ciclo de Vida de Chamados)**: Atribuição de técnico e pipeline: `Aberto` $\rightarrow$ `Em Andamento` $\rightarrow$ `Resolvido` $\rightarrow$ `Fechado`.
* **RF-17 (Registro de Solução)**: Histórico de apontamentos técnicos e parecer de encerramento.
* **RF-18 (Painel 360° da Unidade)**: Dossiê unificado exibindo moradores, pacotes, acessos, reservas, mudanças e chamados.
* **RF-19 (Log de Auditoria Imutável)**: Gravação append-only com timestamp, usuário, unidade, módulo e snapshot.
* **RF-20 (Notificações do Sistema)**: Avisos in-app e por e-mail para todos os eventos operacionais relevantes.

---

### 5. Requisitos Não-Funcionais (RNF)
* **RNF-01 (Segurança e Criptografia)**: Senhas com hash BCrypt, tráfego com TLS/HTTPS e tokens JWT seguros.
* **RNF-02 (Isolamento de Dados)**: Moradores visualizam estritamente os dados de sua respectiva unidade.
* **RNF-03 (Privacidade de Visitantes)**: Dados restritos a operadores autorizados e expiração automática de QR Codes.
* **RNF-04 (Performance na Portaria)**: Validação de autorizações concluída em $< 1.5$ segundos.
* **RNF-05 (Consistência Atômica)**: Transações ACID para garantir zero tolerância a reservas duplicadas.
* **RNF-06 (Usabilidade Mobile-First)**: Frontend de moradores otimizado para celulares; portaria para tablets/desktop.
* **RNF-07 (Operação Ágil)**: Mínimo de cliques para despachar encomendas e registrar acessos.
* **RNF-08 (Imutabilidade de Auditoria)**: Histórico operacional append-only sem exclusão física de registros.

---

### 6. Critérios de Aceitação do MVP (Definition of Done)
1. **Teste da Visão 360°**: Seleção de unidade exibe o painel consolidado com histórico navegável em clique único.
2. **Teste de Check-in QR**: Emissão de convite pelo morador e validação pela portaria com liberação em menos de 1.5s.
3. **Teste de Encomendas**: Cadastro gera notificação instantânea; baixa presencial atualiza status com carimbo do operador.
4. **Teste de Bloqueio de Conflitos**: Reservas concorrentes para a mesma churrasqueira resultam em 1 confirmação e 1 erro 409.
