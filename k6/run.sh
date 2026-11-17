#!/usr/bin/env bash
set -e

ESCENARIO=${1:-smoke}

# Crear directorio de resultados si no existe
mkdir -p "$(dirname "$0")/resultados"

echo "===> Ejecutando escenario de k6: ${ESCENARIO} vía Docker Compose <==="

docker compose run --rm \
  -u "$(id -u):$(id -g)" \
  -e VUS="${VUS}" \
  -e PICO="${PICO}" \
  -e INTENTOS="${INTENTOS}" \
  -e CLIENTES="${CLIENTES}" \
  -e BASE_URL="${BASE_URL:-http://ctv-backend:3000}" \
  -e VUELOS_URL="${VUELOS_URL:-http://api-vuelos:4000}" \
  k6 run \
    --out influxdb=http://influxdb:8086/k6 \
    --summary-export="resultados/${ESCENARIO}-resumen.json" \
    "${ESCENARIO}.js"