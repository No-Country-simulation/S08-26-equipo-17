# CondoTrack — Centralized Condominium Operations & 360° Traceability Platform

> **Languages / Idiomas / Idiomas:**  
> [English](#1-english) | [Español](#2-español) | [Português (pt-BR)](#3-português-pt-br) | [Quick Start & Demo](#4-quick-start--execucao-rapida)

---

## Badges & Tech Stack

![Java 21](https://img.shields.io/badge/Java-21-orange?logo=openjdk&logoColor=white)
![Spring Boot 3](https://img.shields.io/badge/Spring_Boot-3.x-brightgreen?logo=springboot&logoColor=white)
![Next.js 14](https://img.shields.io/badge/Next.js-14_App_Router-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white)
![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)
![No Country](https://img.shields.io/badge/Simulation-No_Country_S08--26--equipo--17-blueviolet)

---

## 1. English

### 1.1 About CondoTrack
**CondoTrack** is a centralized operations, communication, and traceability platform for residential and commercial condominiums. It solves the everyday operational chaos—where data is fragmented across paper concierge notebooks, WhatsApp group chats, and disconnected spreadsheets—by transforming building routines into an **auditable, unified digital workflow**.

### 1.2 Key MVP Features
* **360° Unit Overview (Core Metric):** In a single screen, property managers and concierge operators view residents, active visitor authorizations, pending packages, upcoming amenity bookings, scheduled moves, and maintenance tickets with a full audit timeline.
* **Visitor Access & QR Passes:** Residents issue guest passes with temporary QR codes; concierge validates and checks in visitors in $< 1.5$ seconds via camera scanner.
* **Package Reception & Delivery:** Front desk logs arriving parcels; residents receive immediate notifications; pickups are signed off with timestamps and operator accountability.
* **Conflict-Free Amenity Bookings:** Atomic database transactions prevent double-booking for barbecue grills, party halls, and sports courts.
* **Moving Shift Coordination:** Morning/Afternoon shift requests with admin approval to prevent freight elevator congestion.
* **Maintenance Tickets:** Issues reported with photo attachments, urgency ratings, technician assignment, and resolution tracking.

### 1.3 Documentation & Architecture Map
* **Core Requirements:** [`docs/problem.md`](./docs/problem.md) | [`docs/requisitos.md`](./docs/requisitos.md)
* **Architecture & API:** [`docs/architecture.md`](./docs/architecture.md) | [`docs/api-spec.md`](./docs/api-spec.md)
* **Database & Workflows:** [`docs/database-design.md`](./docs/database-design.md) | [`docs/state-machines-and-flows.md`](./docs/state-machines-and-flows.md)
* **Frontend & Setup:** [`docs/frontend-routes.md`](./docs/frontend-routes.md) | [`docs/setup-guide.md`](./docs/setup-guide.md) | [`docs/backlog.md`](./docs/backlog.md)
* **Visual Diagrams Directory:** [`docs/diagrams/README.md`](./docs/diagrams/README.md) (ERD, Classes, Components, Use Cases, Sequence, Deployment)
* **Contributing:** [`CONTRIBUTING.md`](./CONTRIBUTING.md)

---

## 2. Español

### 2.1 Acerca de CondoTrack
**CondoTrack** es una plataforma centralizada de gestión operativa, comunicación y trazabilidad para edificios y condominios. Resuelve la fragmentación de la información —dispersa en cuadernos de portería, chats de WhatsApp y planillas paralelas— transformando las actividades cotidianas en un **flujo digital auditable y unificado**.

### 2.2 Funcionalidades Clave del MVP
* **Vista 360° de la Unidad (Criterio Principal):** En una sola pantalla consolidada, administración y portería consultan residentes, autorizaciones vigentes, paquetes pendientes, reservas, mudanzas y reclamos de mantenimiento con historial de auditoría.
* **Control de Accesos con Código QR:** El residente emite pases temporales con código QR; la portería valida el ingreso en $< 1.5$ segundos mediante escáner de cámara.
* **Recepción y Entrega de Paquetes:** Registro ágil en portería, alerta instantánea al residente y registro de entrega presencial con firma de operador.
* **Reservas sin Conflictos:** Transacciones atómicas que impiden la superposición de horarios en áreas comunes (quinchos, salones, canchas).
* **Control de Mudanzas:** Coordinación por turnos (mañana/tarde) con aprobación obligatoria para reservar el montacargas.
* **Tickets de Mantenimiento:** Reportes con fotografía adjunta, categoría, prioridad y seguimiento de solución.

### 2.3 Mapa de Documentación y Diagramas
Consulte el índice técnico completo en [`docs/diagrams/README.md`](./docs/diagrams/README.md) y las especificaciones en [`docs/`](./docs/).

---

## 3. Português (pt-BR)

### 3.1 Sobre o CondoTrack
O **CondoTrack** é uma plataforma centralizada de gestão operacional, comunicação e rastreabilidade para condomínios e edifícios residenciais/comerciais. O sistema resolve a perda de informações do dia a dia — hoje dispersas em cadernos físicos de portaria, grupos de WhatsApp e planilhas desconexas — unificando todas as rotinas em um **fluxo digital seguro, ágil e auditável**.

### 3.2 Funcionalidades Chave do MVP
* **Visão 360° da Unidade (Critério Chave):** Painel unificado exibindo moradores vinculados, convites ativos, encomendas pendentes, reservas de áreas sociais, mudanças e chamados de manutenção com linha do tempo de auditoria.
* **Acessos Rápidos com QR Code:** Morador gera convites temporários; portaria valida e registra a entrada em $< 1.5$ segundos pelo leitor de câmera.
* **Recepção e Baixa de Encomendas:** Registro ágil de pacotes, disparo imediato de alerta aos moradores e baixa física assinada.
* **Reserva de Espaços sem Conflito:** Validação atômica de horários impedindo sobreposição em churrasqueiras e salões de festa.
* **Programação de Mudanças:** Agendamento por turnos (manhã/tarde) com aprovação do síndico para uso do elevador de serviço.
* **Chamados de Manutenção:** Abertura com foto, categorização, atribuição técnica e acompanhamento de conserto.

### 3.3 Mapa de Documentação Completo
Acesse o diretório visual [`docs/diagrams/README.md`](./docs/diagrams/README.md) e as especificações técnicas em [`docs/`](./docs/).

---

## 4. Quick Start / Execução Rápida

### 4.1 Rodando o Ambiente Local em 3 Passos:

```bash
# 1. Subir Banco PostgreSQL 16 e Servidor de E-mails Local (Mailpit)
docker compose up -d

# 2. Executar o Backend Spring Boot 3 (porta 8080)
cd backend
./mvnw clean spring-boot:run

# 3. Em outro terminal, executar o Frontend Next.js 14 (porta 3000)
cd frontend
npm install
npm run dev
```

* **Frontend Web:** `http://localhost:3000`
* **Swagger API Docs:** `http://localhost:8080/swagger-ui.html`
* **Caixa de E-mails de Teste (Mailpit):** `http://localhost:8025`

### 4.2 Usuários Padrão para Testes (Seed Local)
Todos os usuários de teste cadastrados possuem a senha: **`password123`**

| Perfil / Role | E-mail | Unidade Associada | Finalidade de Teste |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@condotrack.com` | Global (Edifício Solar) | Gestão geral, aprovação de mudanças, painel 360° |
| **PORTARIA** | `portaria@condotrack.com` | Recepção / Portaria | Scanner de QR Code, recebimento e baixa de pacotes |
| **MORADOR 1** | `mariana@condotrack.com` | Unidade 101 (Torre A) | Emissão de convites QR, recebimento de alertas |
| **MORADOR 2** | `lucas@condotrack.com` | Unidade 102 (Torre A) | Reserva de churrasqueira, agendamento de mudança |

---

## 5. Equipe e Contexto

Projeto desenvolvido durante a **Simulação No Country — Turma S08-26 (Equipe 17)**.  
Consulte o guia de colaboração da equipe em [**`CONTRIBUTING.md`**](./CONTRIBUTING.md).
