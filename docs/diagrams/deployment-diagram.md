# CondoTrack — Deployment & Infrastructure Diagrams / Diagrama de Despliegue / Diagrama de Implantação

> **Languages / Idiomas / Idiomas:**  
> [English](#1-english) | [Español](#2-español) | [Português (pt-BR)](#3-português-pt-br) | [Mermaid Visual Deployment Diagrams](#4-mermaid-visual-deployment-diagrams)

---

## 1. English

### 1.1 Overview
This document models the physical and containerized deployment topology of the **CondoTrack** platform across two environments:
1. **Local Development Environment:** Powered by Docker Compose, running PostgreSQL 16 and Mailpit locally alongside the Spring Boot and Next.js developer instances.
2. **Production / Cloud Demo Environment:** Multi-cloud modern PaaS architecture leveraging **Vercel** (Frontend), **Render / Railway** (Backend container), **Supabase / Neon** (Managed PostgreSQL), and **Cloudinary / S3** (photo storage).

---

## 2. Español

### 2.1 Visión General
Este documento ilustra la topología de despliegue físico y en contenedores de la plataforma **CondoTrack** en dos entornos:
1. **Entorno de Desarrollo Local:** Orquestado con Docker Compose, ejecutando PostgreSQL 16 y Mailpit localmente junto a las instancias de desarrollo de Spring Boot y Next.js.
2. **Entorno de Producción / Demostración en la Nube:** Arquitectura PaaS moderna utilizando **Vercel** (Frontend), **Render / Railway** (Backend en contenedor Docker), **Supabase / Neon** (PostgreSQL administrado) y almacenamiento multimedia.

---

## 3. Português (pt-BR)

### 3.1 Visão Geral
Este documento apresenta a topologia de implantação e infraestrutura da plataforma **CondoTrack** dividida em dois cenários:
1. **Ambiente de Desenvolvimento Local:** Orquestrado via Docker Compose, com contêineres para PostgreSQL 16 e Mailpit, integrados ao Spring Boot e Next.js executando no host.
2. **Ambiente de Demonstração / Produção Cloud:** Arquitetura PaaS moderna com **Vercel** (Frontend), **Render / Railway** (Backend Spring Boot em contêiner), **Supabase / Neon** (PostgreSQL Gerenciado com SSL) e disparo de e-mails transacionais.

---

## 4. Mermaid Visual Deployment Diagrams

### 4.1 Local Development Environment Topology (Docker Compose)
```mermaid
flowchart TB
    subgraph DeveloperWorkstation ["Developer Host Machine (Localhost)"]
        subgraph DevBrowser ["Web Browser"]
            Browser["Browser (Chrome / Firefox / Edge)<br>http://localhost:3000"]
            MailpitWeb["Mailpit Web Client<br>http://localhost:8025"]
        end

        subgraph LocalFrontend ["Frontend Process"]
            NextDev["Next.js Dev Server (Node.js 20)<br>Port: 3000"]
        end

        subgraph LocalBackend ["Backend Process"]
            SpringDev["Spring Boot 3 (JVM 17/21)<br>Port: 8080"]
        end

        subgraph DockerComposeEngine ["Docker Compose Network (condotrack-net)"]
            PostgresContainer["Container: condotrack-postgres<br>Image: postgres:16-alpine<br>Port: 5432"]
            MailpitContainer["Container: condotrack-mailpit<br>Image: axllent/mailpit<br>Ports: 1025 (SMTP), 8025 (Web)"]
            PostgresVolume[("Docker Volume<br>postgres_data")]
        end
    end

    Browser -->|HTTP / Localhost| NextDev
    NextDev -->|REST / JSON| SpringDev
    SpringDev -->|JDBC / Port 5432| PostgresContainer
    SpringDev -->|SMTP / Port 1025| MailpitContainer
    PostgresContainer --- PostgresVolume
    MailpitWeb -->|HTTP / Port 8025| MailpitContainer
```

### 4.2 Production / Cloud Demo Topology
```mermaid
flowchart TB
    Users(("End Users (Desktop / Mobile)"))

    subgraph CloudInfrastructure ["Cloud Production Topology (Demo)"]
        subgraph VercelEdge ["Vercel Cloud Platform"]
            EdgeCdn["Global Edge Network (HTTPS)"]
            NextJsApp["Next.js SSR / Static App<br>https://condotrack.vercel.app"]
        end

        subgraph BackendHost ["Render / Railway Cloud Platform"]
            SpringContainer["Docker Container: Spring Boot 3 API<br>JDK 21 / Spring Security / Flyway<br>https://api.condotrack.com"]
        end

        subgraph ManagedDatabase ["Supabase / Neon Database"]
            PostgresDb[("PostgreSQL 16 Managed DB<br>Encrypted Storage (SSL / TLS)<br>Flyway Migrations V1 & V2")]
        end

        subgraph ExternalServices ["External Cloud Services"]
            EmailProvider["Transactional Email (Resend / SendGrid)"]
            CloudMedia["Media Storage (Cloudinary / Supabase Storage)<br>Incident Photos"]
        end
    end

    Users -->|HTTPS| EdgeCdn
    EdgeCdn --> NextJsApp
    NextJsApp -->|REST / HTTPS / JSON| SpringContainer
    SpringContainer -->|JDBC over TLS / SSL| PostgresDb
    SpringContainer -->|HTTPS API / SMTP| EmailProvider
    NextJsApp -->|Direct Image Upload| CloudMedia
    SpringContainer -->|Persists Photo URL| PostgresDb
```
