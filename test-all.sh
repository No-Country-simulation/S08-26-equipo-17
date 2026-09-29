#!/usr/bin/env bash
set -e

BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BOLD}${BLUE}====================================================${NC}"
echo -e "${BOLD}${BLUE}         CondoTrack · Suite de Tests               ${NC}"
echo -e "${BOLD}${BLUE}====================================================${NC}"

echo -e "\n${YELLOW}1/2. Ejecutando tests unitarios y de integración de Backend (Spring Boot)...${NC}"
(
  cd backend
  ./mvnw test -B
)
echo -e "${GREEN}[OK] Todos los tests de backend pasaron exitosamente.${NC}"

echo -e "\n${YELLOW}2/2. Verificando compilación, tipado y bundle de Frontend (Next.js)...${NC}"
(
  cd frontend
  npm run build
)
echo -e "${GREEN}[OK] Build de Frontend completado exitosamente sin errores de TypeScript.${NC}"

echo -e "\n${BOLD}${GREEN}====================================================${NC}"
echo -e "${BOLD}${GREEN}    ¡Todos los checks y tests pasaron con éxito!   ${NC}"
echo -e "${BOLD}${GREEN}====================================================${NC}"
