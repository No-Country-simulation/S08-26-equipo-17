#!/usr/bin/env bash
set -e

BOLD='\033[1m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${BOLD}${YELLOW}Deteniendo contenedores de CondoTrack...${NC}"
docker compose down

echo -e "${BOLD}${GREEN}[OK] Todos los servicios han sido detenidos correctamente.${NC}"
