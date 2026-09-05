# CondoTrack — Environment Setup & Git Workflow / Guía de Configuración / Guia de Setup

> **Languages / Idiomas / Idiomas:**  
> [English](#1-english) | [Español](#2-español) | [Português (pt-BR)](#3-português-pt-br) | [Configuration Files & Commands](#4-configuration-files-and-commands)

---

## 1. English

### 1.1 Prerequisites
* **Java Development Kit (JDK):** Version 17 or 21 (Eclipse Temurin or OpenJDK).
* **Node.js:** Version 20+ LTS with **npm** or **pnpm**.
* **Docker & Docker Compose:** Latest version for PostgreSQL 16 and local Mailpit SMTP server.
* **Git:** Version 2.30+.

### 1.2 Quick Start Summary
1. **Database & Mail Services:** Run `docker compose up -d` in project root.
2. **Backend (Spring Boot):** Run `./mvnw clean spring-boot:run` in `backend/`. Flyway automatically runs schema migrations and seed data.
3. **Frontend (Next.js):** Run `npm install` and `npm run dev` in `frontend/`. Access app at `http://localhost:3000`.

### 1.3 Git Workflow & Team Conventions
* **Branch Strategy:**
  * `main`: Production and stable demo releases.
  * `develop`: Continuous integration branch.
  * `feat/<module>-<description>` (e.g., `feat/concierge-qr-scanner`).
  * `fix/<module>-<description>` (e.g., `fix/reservation-timezone`).
* **Conventional Commits:** `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`.
* **PR Requirement:** Minimum 1 peer code review approval prior to merging into `develop`.

---

## 2. Español

### 2.1 Requisitos Previos
* **Java Development Kit (JDK):** Versión 17 o 21 (Eclipse Temurin u OpenJDK).
* **Node.js:** Versión 20+ LTS con **npm** o **pnpm**.
* **Docker y Docker Compose:** Para PostgreSQL 16 y servidor de correos local Mailpit.
* **Git:** Versión 2.30+.

### 2.2 Guía Rápida de Ejecución
1. **Servicios de Base de Datos y Correo:** Ejecutar `docker compose up -d` en la raíz.
2. **Backend (Spring Boot):** Ejecutar `./mvnw clean spring-boot:run` en `backend/`. Flyway aplica automáticamente las migraciones y datos de prueba.
3. **Frontend (Next.js):** Ejecutar `npm install` y `npm run dev` en `frontend/`. Ingresar a `http://localhost:3000`.

### 2.3 Flujo de Trabajo en Git
* **Estrategia de Ramas:**
  * `main`: Código estable de producción/demo.
  * `develop`: Integración continua.
  * `feat/<modulo>-<funcionalidad>` (ej: `feat/morador-qr-code`).
  * `fix/<modulo>-<correccion>` (ej: `fix/solapamiento-reservas`).
* **Commits Convencionales:** `feat:`, `fix:`, `docs:`, `style:`, `refactor:`.
* **Aprobación de PR:** Obligatoria la revisión de al menos 1 compañero antes del merge a `develop`.

---

## 3. Português (pt-BR)

### 3.1 Pré-requisitos
* **Java Development Kit (JDK):** Versão 17 ou 21 (Eclipse Temurin ou OpenJDK).
* **Node.js:** Versão 20+ LTS com gerenciador **npm** ou **pnpm**.
* **Docker & Docker Compose:** Para execução do PostgreSQL 16 e Mailpit local.
* **Git:** Versão 2.30+.

### 3.2 Guia Rápido de Execução
1. **Banco de Dados e E-mails:** Executar `docker compose up -d` na raiz do projeto.
2. **Backend (Spring Boot):** Executar `./mvnw clean spring-boot:run` na pasta `backend/`. O Flyway aplica automaticamente as migrations e a massa de seed.
3. **Frontend (Next.js):** Executar `npm install` e `npm run dev` na pasta `frontend/`. Acesse `http://localhost:3000`.

### 3.3 Fluxo de Trabalho no Git (GitFlow Simplificado)
* **Padrão de Branches:**
  * `main`: Código estável de demonstração e produção.
  * `develop`: Branch de integração contínua do time.
  * `feat/<modulo>-<funcionalidade>` (ex: `feat/portaria-baixa-pacote`).
  * `fix/<modulo>-<correcao>` (ex: `fix/fuso-horario-reserva`).
* **Conventional Commits:** `feat:`, `fix:`, `docs:`, `style:`, `refactor:`.
* **Regra de Pull Request:** Exigida aprovação de pelo menos 1 membro da equipe antes do merge na `develop`.

---

## 4. Configuration Files and Commands

### 4.1 `docker-compose.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: condotrack-postgres
    restart: always
    environment:
      POSTGRES_DB: condotrack_db
      POSTGRES_USER: condotrack_user
      POSTGRES_PASSWORD: condotrack_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mailpit:
    image: axllent/mailpit:latest
    container_name: condotrack-mailpit
    restart: always
    ports:
      - "1025:1025" # SMTP Port
      - "8025:8025" # Web UI: http://localhost:8025

volumes:
  postgres_data:
```

### 4.2 Backend `application.yml` (Spring Boot)
```yaml
server:
  port: 8080

spring:
  application:
    name: condotrack-api
  datasource:
    url: jdbc:postgresql://localhost:5432/condotrack_db
    username: condotrack_user
    password: condotrack_pass
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
  flyway:
    enabled: true
    locations: classpath:db/migration
  mail:
    host: localhost
    port: 1025

app:
  security:
    jwt:
      secret: 404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
      expiration-ms: 86400000 # 24h
  cors:
    allowed-origins: http://localhost:3000
```

### 4.3 Frontend `.env.local` (Next.js)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### 4.4 Default Test Accounts in Seed (Password: `password123`)
| Role / Perfil | Email | Unit / Unidade | Testing Focus / Objetivo de Teste |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@condotrack.com` | Global (Solar Building) | Full management, moving approvals, 360° overview |
| **PORTARIA** | `portaria@condotrack.com` | Concierge / Reception | QR scanning, package arrival, handover sign-off |
| **MORADOR 1** | `mariana@condotrack.com` | Unit 101 (Tower A) | Generates guest QR passes, receives delivery alerts |
| **MORADOR 2** | `lucas@condotrack.com` | Unit 102 (Tower A) | Amenity booking, move-in shift scheduling |
