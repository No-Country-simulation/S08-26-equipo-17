# CondoTrack — Contributing Guide / Guía de Contribución / Como Contribuir

> **Languages / Idiomas / Idiomas:**  
> [English](#1-english) | [Español](#2-español) | [Português (pt-BR)](#3-português-pt-br) | [Git Commands Cheat Sheet](#4-git-commands-cheat-sheet)

---

## 1. English

### 1.1 Welcome & Philosophy
This guide provides a pragmatic, beginner-friendly workflow for developing **CondoTrack** as a team. If you ever get stuck on any Git command, **reach out to your squad peers or area lead immediately before forcing any destructive commands** (like `git push --force`).

### 1.2 Branching Strategy (Simplified GitHub Flow)
The team uses a simplified Git workflow **without a separate `develop` branch**: everything branches off `main` and merges back into `main` via a peer-reviewed Pull Request (PR).

| Branch | When to Use |
| :--- | :--- |
| `main` | Production & demo branch. **Never commit directly to `main`**. Merge only via reviewed PR. |
| `feature/<area>-<description>` | New functionality. Examples: `feature/backend-auth-jwt`, `feature/frontend-qr-scanner` |
| `bugfix/<area>-<description>` | Fixing an issue during a sprint. Example: `bugfix/backend-reservation-conflict` |
| `hotfix/<description>` | Urgent fix in code already deployed to `main`. Example: `hotfix/cors-origin-fix` |
| `docs/<description>` | Documentation additions or updates. Example: `docs/api-spec-update` |

> Always prefix branch names with the area (`backend`, `frontend`, `infra`, `docs`) so teammates immediately know what code is being touched.

### 1.3 Commit Conventions (Conventional Commits)
| Prefix | Usage | Example |
| :--- | :--- | :--- |
| `feat:` | New feature | `feat(backend): implement QR code validation endpoint` |
| `fix:` | Bug fix | `fix(frontend): adjust camera scanner permissions on mobile` |
| `refactor:` | Code restructuring without behavior changes | `refactor(backend): decouple DTO mappers from service layer` |
| `docs:` | Documentation changes only | `docs(readme): update quickstart local instructions` |
| `test:` | Adding or modifying tests | `test(backend): add unit tests for reservation conflict check` |
| `style:` | Formatting, whitespace, no logic change | `style(frontend): format unit card components with prettier` |
| `chore:` | Build configs, dependencies, toolings | `chore(docker): update postgres compose port mapping` |

**Format:** `prefix(scope): short description in imperative mood`

### 1.4 Pre-Pull Request Checklist
Before opening your Pull Request, ensure:
- [ ] **Backend compiles:** `./mvnw clean compile` passes without errors.
- [ ] **Frontend builds:** `npm run build` succeeds cleanly.
- [ ] **Manual verification:** You tested your feature locally with real scenarios.
- [ ] **No secrets committed:** No real passwords, API keys, or `.env.local` files staged.
- [ ] **Clear PR description:** Summarizes what changed, why, and how to test.
- [ ] **Code review:** At least 1 teammate must review and approve before merging.

### 1.5 Golden Rules of the `main` Branch
1. Never push directly to `main`.
2. All merges happen through a GitHub Pull Request reviewed by at least one peer.
3. If `main` breaks (build failing), fixing it is the entire team's **number one priority**—no new features proceed until `main` builds green again.

---

## 2. Español

### 2.1 Bienvenida y Filosofía de Trabajo
Esta guía práctica orienta el trabajo colaborativo en **CondoTrack**. Si te trabas en algún comando de Git o surge un conflicto, **consulta a tu compañero de equipo o líder técnico antes de ejecutar comandos destructivos** (como `git push --force`).

### 2.2 Estrategia de Ramas (GitHub Flow Simplificado)
Utilizamos un flujo simplificado **sin rama `develop`**: todo nace desde `main` y regresa a `main` a través de un Pull Request revisado por al menos un colega.

| Rama | Cuándo usarla |
| :--- | :--- |
| `main` | Rama principal y estable. **Nunca hacer commit directo**. Merge exclusivo vía PR aprobado. |
| `feature/<area>-<descripcion>` | Funcionalidad nueva. Ej.: `feature/backend-auth-jwt`, `feature/frontend-qr-scanner` |
| `bugfix/<area>-<descripcion>` | Corrección durante la sprint. Ej.: `bugfix/backend-conflito-horario` |
| `hotfix/<descripcion>` | Corrección urgente en producción. Ej.: `hotfix/cors-origin-fix` |
| `docs/<descripcion>` | Mejoras o adiciones de documentación. Ej.: `docs/actualiza-swagger` |

> Prefija siempre la rama con el área (`backend`, `frontend`, `infra`, `docs`) para identificar de inmediato el alcance del cambio.

### 2.3 Padrón de Commits (Conventional Commits)
| Prefijo | Uso | Ejemplo |
| :--- | :--- | :--- |
| `feat:` | Nueva funcionalidad | `feat(backend): agrega endpoint para validar QR en portería` |
| `fix:` | Corrección de error | `fix(frontend): soluciona lectura de cámara en dispositivos móviles` |
| `refactor:` | Refactorización de código | `refactor(backend): separa mappers de la lógica de servicio` |
| `docs:` | Cambios de documentación | `docs(readme): actualiza instrucciones de inicio rápido` |
| `test:` | Creación o ajuste de pruebas | `test(backend): agrega pruebas de sobreposición de reservas` |
| `style:` | Estilo y formato | `style(frontend): alinea espaciado en tarjeta de entregas` |
| `chore:` | Tareas de configuración | `chore(docker): ajusta variables de postgres en compose` |

### 2.4 Checklist Antes de Abrir un Pull Request
- [ ] **Compilación del Backend:** `./mvnw clean compile` ejecuta sin fallas.
- [ ] **Build del Frontend:** `npm run build` finaliza con éxito.
- [ ] **Prueba Manual:** Probé localmente la funcionalidad implementada.
- [ ] **Sin Secretos:** No incluí credenciales reales, tokens ni archivos `.env.local`.
- [ ] **Descripción Clara:** El PR explica qué se modificó y cómo probarlo.
- [ ] **Revisión de Código:** Al menos 1 miembro del equipo debe aprobar el PR antes de mesclar.

### 2.5 Reglas de Oro de `main`
1. Nunca hacer push directo a la rama `main`.
2. Todo merge se realiza mediante Pull Request aprobado por al menos 1 compañero.
3. Si la `main` falla, su corrección se convierte en la prioridad máxima del equipo antes de continuar con nuevas tareas.

---

## 3. Português (pt-BR)

### 3.1 Como Contribuir
Guia prático para o desenvolvimento em equipe no **CondoTrack**. Se travar em algum passo ou encontrar conflitos no Git, **chame um colega do time ou líder técnico antes de forçar comandos destrutivos** (como `git push --force`).

### 3.2 Fluxo de Branches (GitHub Flow Simplificado)
O time utiliza um fluxo simplificado, **sem branch `develop`**: tudo nasce da `main` e volta para a `main` via Pull Request revisado.

| Branch | Quando usar |
| :--- | :--- |
| `main` | Código estável de demo e produção. **Nunca commitar direto aqui**. Merge sempre via PR revisado. |
| `feature/<area>-<descricao>` | Uma funcionalidade nova. Ex.: `feature/backend-auth-jwt`, `feature/frontend-qr-scanner` |
| `bugfix/<area>-<descricao>` | Correção de bug encontrado na sprint. Ex.: `bugfix/backend-conflito-horario` |
| `hotfix/<descricao>` | Correção urgente em algo já publicado na `main`. Ex.: `hotfix/cors-origin-fix` |
| `docs/<descricao>` | Criação ou ajuste de documentação. Ex.: `docs/guia-contribuicao` |

> Sempre prefixe a branch com a área (`backend`, `frontend`, `infra`, `docs`) para ficar claro do que se trata logo pelo nome.

### 3.3 Padrão de Commits (Conventional Commits)
| Prefixo | Quando usar | Exemplo |
| :--- | :--- | :--- |
| `feat:` | Nova funcionalidade | `feat(backend): implementa endpoint de validacao de QR Code` |
| `fix:` | Correção de bug | `fix(frontend): ajusta permissao da camera do scanner no celular` |
| `refactor:` | Mudança de código sem alterar regra externa | `refactor(backend): desacopla mappers de entidades JPA` |
| `docs:` | Mudanças apenas em documentação | `docs(readme): adiciona instruções de quickstart local` |
| `test:` | Adição ou ajuste de testes | `test(backend): adiciona teste unitario para conflito de reserva` |
| `style:` | Formatação, sem mudança de lógica | `style(frontend): formata cards de encomendas com tailwind` |
| `chore:` | Manutenção de build, configs e dependências | `chore(docker): atualiza versao da imagem do postgres` |

**Formato:** `prefixo(escopo): descrição curta no imperativo`

### 3.4 Checklist Antes de Abrir o Pull Request
- [ ] **Backend compila:** `./mvnw clean compile` executa sem erros.
- [ ] **Frontend builda:** `npm run build` conclui com sucesso.
- [ ] **Teste manual realizado:** Testei localmente o cenário com a massa do seed.
- [ ] **Sem segredos expostos:** Nenhuma senha real, token JWT ou `.env.local` versionado.
- [ ] **Descrição informativa:** O PR explica o que mudou, o porquê e como testar.
- [ ] **Revisão por pares:** Ao menos 1 colega de equipe deve aprovar o PR antes do merge.

### 3.5 Regras de Ouro da `main`
1. Nunca dar push direto na `main`.
2. Todo merge acontece via Pull Request revisado por pelo menos 1 colega.
3. Se a `main` quebrar (build falhando), a prioridade número 1 do time vira consertá-la — nenhuma feature nova avança até a `main` voltar a buildar verde.

---

## 4. Git Commands Cheat Sheet

### Passo a passo para criar e enviar uma funcionalidade:

```bash
# 1. Atualize sua main local com o repositório remoto
git checkout main
git pull origin main

# 2. Crie sua branch a partir da main atualizada
# Exemplo Backend:
git checkout -b feature/backend-validacao-qr
# Exemplo Frontend:
# git checkout -b feature/frontend-scanner-camera

# 3. Desenvolva sua tarefa, commitando em passos pequenos
git add <arquivos-alterados>
git commit -m "feat(backend): implementa validacao atomica do token QR"

# 4. Antes de subir, certifique-se de que a main não recebeu alterações
git checkout main
git pull origin main
git checkout feature/backend-validacao-qr
git merge main  # Resolva conflitos localmente se existirem

# 5. Valide que o projeto compila sem erros
# No backend: ./mvnw clean compile
# No frontend: npm run build

# 6. Envie sua branch para o GitHub
git push -u origin feature/backend-validacao-qr

# 7. Abra o Pull Request na interface do GitHub apontando para a branch 'main'
# 8. Notifique no grupo e solicite a revisão de pelo menos 1 colega do time
```

### O que fazer se encontrar conflitos de merge?
* **Nunca use `git push --force` na branch `main`.**
* Atualize sua branch local mesclando a `main` mais recente (`git merge main`), resolva os conflitos nos arquivos indicados pelo VS Code, execute os testes de compilação e finalize o merge com um commit explicativo.
