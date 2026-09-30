#!/usr/bin/env bash
# Script para geração de certificados SSL autoassinados para ambiente local (RNF-01)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
  -keyout "${SCRIPT_DIR}/localhost.key" \
  -out "${SCRIPT_DIR}/localhost.crt" \
  -subj "/C=BR/ST=SP/L=SaoPaulo/O=CondoTrack/OU=Development/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1"

echo "Certificados SSL para localhost gerados com sucesso em ${SCRIPT_DIR}."
