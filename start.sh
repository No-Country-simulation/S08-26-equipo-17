#!/usr/bin/env bash
set -e

# CondoTrack Local Startup Script
# Automatically starts all containers (Postgres, Mailpit, Spring Boot Backend, Next.js Frontend)
# and validates healthchecks.

BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BOLD}${BLUE}====================================================${NC}"
echo -e "${BOLD}${BLUE}      CondoTrack · Inicializando Entorno Local     ${NC}"
echo -e "${BOLD}${BLUE}====================================================${NC}"

# Check Docker daemon
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}[ERROR] Docker daemon no está corriendo. Iniciá Docker Desktop e intentá nuevamente.${NC}"
  exit 1
fi

# Pre-build local jar if maven wrapper is available to optimize build speed
if [ ! -f "backend/target/condotrack-api-0.0.1-SNAPSHOT.jar" ]; then
  echo -e "${YELLOW}[INFO] Compilando artefacto backend JAR antes de empaquetar en contenedor...${NC}"
  (cd backend && ./mvnw clean package -DskipTests -B)
fi

echo -e "${YELLOW}[INFO] Levantando contenedores con Docker Compose...${NC}"
docker compose up -d --build

echo -e "\n${YELLOW}[INFO] Esperando a que PostgreSQL esté listo...${NC}"
until docker compose exec -T postgres pg_isready -U condotrack_user -d condotrack_db > /dev/null 2>&1; do
  sleep 2
  echo -n "."
done
echo -e "\n${GREEN}[OK] PostgreSQL saludable.${NC}"

echo -e "${YELLOW}[INFO] Esperando a que Spring Boot Backend esté listo (http://localhost:8080/api/v1/health)...${NC}"
BACKEND_READY=false
for i in {1..30}; do
  if curl -s http://localhost:8080/api/v1/health | grep -q "UP"; then
    BACKEND_READY=true
    break
  fi
  sleep 2
  echo -n "."
done

echo ""
if [ "$BACKEND_READY" = true ]; then
  echo -e "${GREEN}[OK] Backend Spring Boot inicializado y saludable.${NC}"
else
  echo -e "${YELLOW}[ADVERTENCIA] El backend aún está inicializando Flyway migrations. Podés verificar logs con: docker compose logs -f backend${NC}"
fi

echo -e "${YELLOW}[INFO] Verificando Frontend Next.js (http://localhost:3000)...${NC}"
FRONTEND_READY=false
for i in {1..20}; do
  if curl -s http://localhost:3000 > /dev/null 2>&1; then
    FRONTEND_READY=true
    break
  fi
  sleep 2
  echo -n "."
done

echo ""
if [ "$FRONTEND_READY" = true ]; then
  echo -e "${GREEN}[OK] Frontend Next.js disponible.${NC}"
fi

echo -e "\n${BOLD}${GREEN}====================================================${NC}"
echo -e "${BOLD}${GREEN}   ¡CondoTrack está corriendo exitosamente!        ${NC}"
echo -e "${BOLD}${GREEN}====================================================${NC}"
echo -e "${BOLD}Acceso a las aplicaciones:${NC}"
echo -e "  🌐 ${BOLD}Frontend Web:${NC}       http://localhost:3000"
echo -e "  ⚙️  ${BOLD}API Backend:${NC}        http://localhost:8080/api/v1"
echo -e "  📚 ${BOLD}Swagger / OpenAPI:${NC}  http://localhost:8080/swagger-ui.html"
echo -e "  📧 ${BOLD}Mailpit (Mails):${NC}    http://localhost:8025"
echo -e "\n${BOLD}Cuentas de Demostración:${NC}"
echo -e "  👤 ${BOLD}Residente (7D):${NC}     felipe@araoz1280.com.ar      /  condo1234"
echo -e "  🛡️  ${BOLD}Portería / Guardia:${NC} recepcion@araoz1280.com.ar   /  condo1234"
echo -e "  🏢 ${BOLD}Administración:${NC}     admin@araoz1280.com.ar       /  condo1234"
echo -e "----------------------------------------------------"
echo -e "Para detener los servicios ejecutá: ${BOLD}./stop.sh${NC}"
echo -e "Para ver los logs en vivo ejecutá:   ${BOLD}docker compose logs -f${NC}\n"
