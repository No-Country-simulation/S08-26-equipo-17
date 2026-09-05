# CondoTrack — Problem Statement & Business Context

> **Languages / Idiomas / Idiomas:**  
> [English](#1-english) | [Español](#2-español) | [Português (pt-BR)](#3-português-pt-br)

---

## 1. English

### 1.1 Overview & Problem Statement
**Centralized management platform for residential and commercial buildings and condominiums**, integrating in a single system the management of residents, access authorizations, common area reservations, package deliveries, move schedules, incidents, and maintenance, ensuring complete operational traceability.

### 1.2 Business Context
Property management companies handle the daily operation of one or multiple buildings and condominiums, coordinating units, residents, property owners, reception/concierge personnel, third-party service providers, and common areas.

Everyday operations involve multiple stakeholders:
* **Administration:** Manages buildings, units, operational rules, and residents.
* **Front Desk / Concierge (Portaria):** Controls entry and exit, receives mail and deliveries, and registers urgent incidents.
* **Residents & Owners:** Submit access authorizations, book common areas, schedule moving shifts, and report maintenance issues.

During these operations, diverse streams of information are generated:
* Building and unit data.
* Owner and resident directory.
* Staff and security personnel records.
* Visitor lists and access authorizations.
* QR codes and entry/exit timestamped logs.
* Deliveries and postal correspondence.
* Common area reservations (barbecue areas, party halls, gyms).
* Move-in and move-out schedule requests.
* Incident reports and maintenance requests.
* Internal communications and urgent alerts.

Currently, most of this information is fragmented across reception notebooks, WhatsApp chats, disjointed spreadsheets, independent access systems, and external service providers. This fragmentation makes it nearly impossible to maintain a real-time, consolidated overview of building operations.

The root issue is not merely the volume of data, but the **complete absence of centralized and auditable traceability**. When an inquiry, incident, or resident request arises, property managers must be able to immediately answer:
> *What happened, in which unit, who is involved, what authorization existed, who handled the request, and what actions were performed?*

**CondoTrack** addresses this challenge by providing a centralized operations, communication, and traceability platform for residential and commercial properties.

### 1.3 Operational Pain Points
1. **Scattered Information:** Resident, access, delivery, and booking data are dispersed across informal tools, creating blind spots for management.
2. **Lack of Traceability:** An incident may start on WhatsApp, move to a phone call to the front desk, and conclude with maintenance, leaving zero unified audit records.
3. **Manual Access Control:** Visitor check-in relying on paper logbooks creates delays at reception, difficulty validating permissions, and incomplete security records.
4. **Fragmented Delivery Management:** Unrecorded packages lead to delayed pickups, lost deliveries, and tenant complaints.
5. **Common Area Booking Conflicts:** Booking amenities via chat causes double-bookings, conflicting schedules, and outdated availability.
6. **Untracked Incidents:** Maintenance issues reported casually get lost with no accountability, status updates, or resolution logs.
7. **Absence of Operational Metrics:** Lack of structured data prevents property managers from identifying operational bottlenecks.

### 1.4 Business Opportunity
Transforming manual building operations into a **centralized, digital, and auditable flow**:
$$\text{Building} \longrightarrow \text{Unit} \longrightarrow \text{Resident} \longrightarrow \text{Operations (Access, Deliveries, Bookings, Moves, Maintenance)}$$
The goal is not simply replacing paper with screens, but establishing a **Single Source of Truth** with complete event traceability.

### 1.5 Project Success Criteria
The project is successful if an authorized user (Management or Concierge) can select any building or unit and immediately view—without consulting external spreadsheets, chats, or logbooks—a consolidated **"360° Unit Overview"** with all active residents, access history, pending deliveries, bookings, moves, and maintenance tickets, backed by an immutable audit timeline.

---

## 2. Español

### 2.1 Descripción General y Declaración del Problema
**Plataforma centralizada para administrar edificios y condominios residenciales y comerciales**, integrando en un único sistema la gestión de residentes, accesos, reservas de áreas comunes, entregas de correspondencia/deliveries, mudanzas, incidentes y mantenimiento, con trazabilidad de toda la operación.

### 2.2 Contexto del Negocio
La empresa administradora se dedica a la gestión cotidiana de uno o varios edificios y condominios, coordinando unidades, residentes, propietarios, personal de recepción/portería, proveedores y espacios comunes.

La operación cotidiana involucra diferentes áreas y personas:
* **Administración:** Gestiona edificios, unidades, reglamentos y residentes.
* **Recepción / Portería:** Controla el ingreso y egreso de personas, recibe correspondencia y deliveries, y registra incidentes operativos.
* **Residentes y Propietarios:** Realizan autorizaciones de visita, reservan espacios comunes, programan mudanzas y reportan incidentes de mantenimiento.

Durante este proceso se generan y utilizan diferentes tipos de información:
* Datos de edificios y unidades.
* Información de propietarios y residentes.
* Registro de personal y empleados.
* Visitantes y autorizaciones de acceso.
* Códigos QR y registros de ingreso/egreso.
* Deliveries y correspondencia.
* Reservas de espacios comunes (parrillas, salones, canchas).
* Solicitudes de mudanza (ingreso/egreso).
* Incidentes y reportes de mantenimiento.
* Comunicaciones y notificaciones internas.

Actualmente, gran parte de esta información se encuentra distribuida entre cuadernos de portería, WhatsApp, planillas de cálculo, proveedores y sistemas de acceso independientes, dificultando mantener una visión completa y actualizada de la operación.

El problema radica en la **falta de una gestión centralizada y trazable**. Ante una consulta, reclamo o auditoría, la administración necesita responder rápidamente:
> *¿Qué ocurrió, en qué unidad, quién está involucrado, qué autorización existe, quién gestionó la solicitud y qué acciones se realizaron?*

**CondoTrack** resuelve esta problemática proporcionando una plataforma centralizada de gestión, comunicación y trazabilidad para la operación de edificios y condominios.

### 2.3 Dolores del Negocio
1. **Información Dispersa:** Datos dispersos en chats y planillas impiden una visión global de la operación.
2. **Falta de Trazabilidad:** Solicitudes sin historial unificado impiden auditar quién autorizó, cuándo se realizó y cuál fue el resultado.
3. **Gestión Manual de Accesos:** Registros en papel causan demoras en recepción, fallas de validación y vulnerabilidades de seguridad.
4. **Gestión Fragmentada de Deliveries:** Paquetes recibidos sin aviso inmediato generan demoras y reclamos de extravío.
5. **Conflictos en Espacios Comunes:** Reservas por mensaje causan superposición de turnos y falta de disponibilidad en tiempo real.
6. **Falta de Seguimiento de Incidentes:** Reclamos informales quedan sin responsable asignado ni registro de resolución.
7. **Falta de Indicadores Operativos:** Ausencia de datos consolidados para evaluar la eficiencia operativa de cada edificio.

### 2.4 Oportunidad
Transformar la gestión operativa en un **flujo digital centralizado y trazable**:
$$\text{Edificio} \longrightarrow \text{Unidad} \longrightarrow \text{Residente} \longrightarrow \text{Operaciones (Accesos, Deliveries, Reservas, Mudanzas, Incidentes)}$$
El objetivo es construir una **fuente única de verdad** donde administración, recepción y residentes consulten y gestionen la información que les corresponde con un registro histórico inmutable.

### 2.5 Criterio de Éxito del Proyecto
El proyecto será exitoso si un usuario autorizado (Administración o Recepción) puede seleccionar un edificio o unidad y consultar de inmediato, en una única pantalla ("Vista 360° de la Unidad"), el estado actual y el historial completo de residentes, accesos, deliveries, reservas, mudanzas e incidentes de mantenimiento, junto con la línea de tiempo de auditoría.

---

## 3. Português (pt-BR)

### 3.1 Visão Geral e Definição do Problema
**Plataforma centralizada para administração de edifícios e condomínios residenciais e comerciais**, integrando em um único sistema a gestão de moradores, controle de acessos, reservas de áreas comuns, entregas de correspondência/deliveries, mudanças, incidentes e manutenção, com rastreabilidade total de toda a operação.

### 3.2 Contexto do Negócio
A administradora é responsável pela operação diária de um ou múltiplos condomínios e edifícios, coordenando unidades autônomas, moradores, proprietários, equipe de portaria/recepção, prestadores de serviço e áreas de uso comum.

A rotina operacional envolve múltiplos atores:
* **Administração / Síndico:** Gerencia condomínios, unidades, normas de convivência e moradores.
* **Portaria / Recepção:** Controla a entrada e saída de pessoas, recebe encomendas e correspondências, e registra ocorrências imediatas.
* **Moradores e Proprietários:** Emitem pré-autorizações de visita, reservam áreas comuns, agendam mudanças e abrem chamados de manutenção.

Durante esses processos, diversos fluxos de informação são gerados:
* Dados cadastrais de edifícios, blocos e unidades.
* Cadastro de proprietários, moradores e dependentes.
* Registro de funcionários e colaboradores.
* Visitantes e pré-autorizações de acesso.
* Códigos QR e registros com carimbo de data/hora de check-in e check-out.
* Encomendas, pacotes e correspondências.
* Reservas de áreas comuns (churrasqueiras, salões de festas, academias).
* Agendamentos de mudanças (entrada e saída).
* Chamados e ordens de manutenção preventiva e corretiva.
* Comunicados, alertas e notificações internas.

Atualmente, a maior parte dessas informações encontra-se dispersa em cadernos de portaria físicos, grupos de WhatsApp, planilhas paralelas e controles manuais independentes. Essa fragmentação inviabiliza a manutenção de uma visão holística e em tempo real da operação.

A raiz do problema é a **ausência de centralização e rastreabilidade confiável**. Diante de qualquer ocorrência, a administração precisa responder prontamente:
> *O que aconteceu, em qual unidade, quem estava envolvido, qual autorização existia, quem atendeu à solicitação e quais providências foram registradas?*

O **CondoTrack** foi concebido para resolver esse desafio por meio de uma plataforma centralizada de operação, comunicação e auditoria para edifícios e condomínios.

### 3.3 Dores do Negócio
1. **Informações Dispersas:** Dados espalhados em ferramentas informais impedem que a gestão tenha visão completa do edifício.
2. **Falta de Rastreabilidade:** Processos iniciados no WhatsApp e finalizados na portaria ficam sem histórico consolidado.
3. **Controle Manual de Acessos:** Cadernos de papel geram filas na recepção, lentidão na identificação e riscos à segurança física.
4. **Gestão Fragmentada de Deliveries:** Encomendas recebidas sem aviso instantâneo causam acúmulo na portaria e reclamações.
5. **Conflitos de Espaços Comuns:** Agendamentos manuais provocam duplicidade de reservas e choque de horários.
6. **Chamados Extraviados:** Problemas de manutenção relatados informalmente ficam sem responsável, prazo ou comprovação de conserto.
7. **Ausência de Indicadores Operacionais:** Falta de dados estruturados para tomada de decisão preventiva e gestão de custos.

### 3.4 Oportunidade
Converter rotinas operacionais manuais em um **fluxo digital estruturado e rastreável**:
$$\text{Edifício} \longrightarrow \text{Unidade} \longrightarrow \text{Morador} \longrightarrow \text{Operações (Acessos, Entregas, Reservas, Mudanças, Incidentes)}$$
O objetivo é consolidar uma **Fonte Única de Verdade** em que administração, portaria e moradores acessem os dados necessários com histórico imutável de eventos.

### 3.5 Critério de Sucesso do Projeto
O projeto será considerado um sucesso se um usuário autorizado (Administração ou Portaria) puder selecionar qualquer edifício ou unidade e visualizar imediatamente, em uma única tela ("Visão 360° da Unidade"), o estado e o histórico completo de moradores vinculados, autorizações de acesso, encomendas pendentes/retiradas, reservas de áreas sociais, mudanças programadas e chamados de manutenção, acompanhados da trilha cronológica de auditoria.