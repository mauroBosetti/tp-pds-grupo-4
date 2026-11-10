#!/usr/bin/env bash
# Ejecuta un escenario k6 y guarda el resumen en k6/resultados/.
# Uso: bash k6/run.sh smoke|load|stress|sobreventa|sobreventa-vuelos
# Usa k6 instalado; si no está, lo corre con Docker (imagen grafana/k6).
set -eo pipefail
export MSYS_NO_PATHCONV=1   # Git Bash en Windows: evita que convierta las rutas de docker -v

escenario="$1"
case "$escenario" in
  smoke|load|stress|sobreventa|sobreventa-vuelos) ;;
  *) echo "Uso: bash k6/run.sh smoke|load|stress|sobreventa|sobreventa-vuelos"; exit 1 ;;
esac

raiz="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$raiz/k6/resultados"
resumen="resultados/${escenario}-$(date +%Y%m%d-%H%M%S).json"

if command -v k6 >/dev/null 2>&1; then
  cd "$raiz/k6"
  k6 run \
    -e BASE_URL="${BASE_URL:-http://localhost:3000}" \
    -e VUELOS_URL="${VUELOS_URL:-http://localhost:4000}" \
    ${VUS:+-e VUS="$VUS"} ${INTENTOS:+-e INTENTOS="$INTENTOS"} \
    ${CLIENTES:+-e CLIENTES="$CLIENTES"} ${PICO:+-e PICO="$PICO"} \
    --summary-export "$resumen" "$escenario.js"
else
  echo "k6 no está instalado: usando Docker (grafana/k6)"
  docker run --rm -i --add-host=host.docker.internal:host-gateway \
    -e BASE_URL="${BASE_URL:-http://host.docker.internal:3000}" \
    -e VUELOS_URL="${VUELOS_URL:-http://host.docker.internal:4000}" \
    ${VUS:+-e VUS="$VUS"} ${INTENTOS:+-e INTENTOS="$INTENTOS"} \
    ${CLIENTES:+-e CLIENTES="$CLIENTES"} ${PICO:+-e PICO="$PICO"} \
    -v "$raiz/k6:/k6" -w /k6 \
    grafana/k6 run --summary-export "$resumen" "$escenario.js"
fi
echo "Resumen guardado en k6/$resumen"
