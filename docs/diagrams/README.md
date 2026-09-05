# CondoTrack — Technical Diagrams Index / Índice de Diagramas / Índice de Diagramas

> **Languages / Idiomas / Idiomas:**  
> [English](#1-english) | [Español](#2-español) | [Português (pt-BR)](#3-português-pt-br)

---

## 1. English

### 1.1 Architecture & Diagrams Directory
This directory contains dedicated, high-resolution visual models rendered natively in **Mermaid** markdown. They are separated into domain-specific documents to maximize readability, maintainability, and clarity for different development roles:

| Diagram Document | Primary Audience | Description |
| :--- | :--- | :--- |
| [**`use-case-diagrams.md`**](./use-case-diagrams.md) | Frontend, QA, PM | UML Use Case models defining boundaries and actions for `ADMIN`, `PORTARIA`, and `MORADOR`. |
| [**`entity-relationship-diagram.md`**](./entity-relationship-diagram.md) | Backend, DBA | Full physical/logical ERD with all 12 tables, attributes, primary/foreign keys, and cardinalities. |
| [**`class-diagram.md`**](./class-diagram.md) | Backend (Spring Boot) | Domain model UML class diagram mapping JPA `@Entity` classes, enums, relationships, and attributes. |
| [**`component-diagrams.md`**](./component-diagrams.md) | Full Stack | Internal package architecture for Spring Boot 3.x and component hierarchy for Next.js 14+. |
| [**`sequence-diagrams.md`**](./sequence-diagrams.md) | Full Stack, QA | Sequence flows for JWT authentication, concurrency conflict prevention (`409 Conflict`), and photo incident reporting. |
| [**`deployment-diagram.md`**](./deployment-diagram.md) | DevOps, Full Stack | Local development setup (Docker Compose) vs. Cloud production demo topology (Vercel, Render/Railway, Supabase). |

---

## 2. Español

### 2.1 Índice de Diagramas Técnicos
Este directorio reúne los modelos visuales en **Mermaid** modularizados por especialidad técnica para facilitar la comprensión y evitar documentos monolíticos:

| Documento de Diagramas | Audiencia Principal | Descripción |
| :--- | :--- | :--- |
| [**`use-case-diagrams.md`**](./use-case-diagrams.md) | Frontend, QA, PM | Diagramas de Casos de Uso UML con las acciones permitidas para `ADMIN`, `PORTARIA` y `MORADOR`. |
| [**`entity-relationship-diagram.md`**](./entity-relationship-diagram.md) | Backend, DBA | Modelo Entidad-Relación detallado con las 12 tablas, columnas, tipos de datos, PK/FK y cardinalidades. |
| [**`class-diagram.md`**](./class-diagram.md) | Backend (Spring Boot) | Diagrama de Clases UML mapeando entidades JPA, enums, tipos y anotaciones de relación. |
| [**`component-diagrams.md`**](./component-diagrams.md) | Full Stack | Arquitectura de paquetes de Spring Boot y componentes modulares de Next.js. |
| [**`sequence-diagrams.md`**](./sequence-diagrams.md) | Full Stack, QA | Flujos de secuencia de autenticación JWT, prevención de conflictos en reservas (`409 Conflict`) y reportes con foto. |
| [**`deployment-diagram.md`**](./deployment-diagram.md) | DevOps, Full Stack | Topología de despliegue local (Docker Compose) vs. Producción en la nube (Vercel, Render/Railway, Supabase). |

---

## 3. Português (pt-BR)

### 3.1 Índice de Diagramas Técnicos
Este diretório organiza todos os modelos visuais da arquitetura do **CondoTrack** em arquivos modulares com sintaxe nativa **Mermaid**, separando as visões de acordo com o perfil técnico do time:

| Documento | Público Principal | Descrição |
| :--- | :--- | :--- |
| [**`use-case-diagrams.md`**](./use-case-diagrams.md) | Frontend, QA, PM | Diagramas de Casos de Uso UML definindo as fronteiras de ação de `ADMIN`, `PORTARIA` e `MORADOR`. |
| [**`entity-relationship-diagram.md`**](./entity-relationship-diagram.md) | Backend, DBA | DER físico/lógico completo com as 12 tabelas, colunas com tipos, chaves PK/FK e cardinalidades. |
| [**`class-diagram.md`**](./class-diagram.md) | Backend (Spring Boot) | Diagrama de Classes UML de domínio mapeando as entidades JPA, enums e relacionamentos. |
| [**`component-diagrams.md`**](./component-diagrams.md) | Full Stack | Diagrama de pacotes do Spring Boot 3.x e hierarquia de componentes do Next.js 14+. |
| [**`sequence-diagrams.md`**](./sequence-diagrams.md) | Full Stack, QA | Diagramas de sequência para login JWT, bloqueio de concorrência em reservas (`409 Conflict`) e chamados com upload. |
| [**`deployment-diagram.md`**](./deployment-diagram.md) | DevOps, Full Stack | Diagrama de implantação local com Docker Compose vs. Topologia Cloud de Produção (Vercel, Render, Supabase). |
