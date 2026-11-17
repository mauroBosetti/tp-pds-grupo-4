#!/usr/bin/env bash
# Carga o limpia los datos de prueba (k6) en las bases del docker compose.
# Uso (desde cualquier carpeta del repo):
#   bash seeds/seed.sh cargar    # limpia y vuelve a insertar
#   bash seeds/seed.sh limpiar   # solo borra
set -eo pipefail
cd "$(dirname "$0")/.."

sql() { # servicio usuario base archivo
  docker compose exec -T "$1" psql -v ON_ERROR_STOP=1 -q -U "$2" -d "$3" < "$4"
}

limpiar() {
  echo "Limpiando datos k6..."
  sql db-ctv    ctv    ctv    seeds/ctv/k6-limpiar.sql
  sql db-vuelos vuelos vuelos seeds/vuelos/k6-limpiar.sql
}

cargar() {
  limpiar
  echo "Insertando vuelos..."
  sql db-vuelos vuelos vuelos seeds/vuelos/k6.sql
  echo "Insertando paquetes y opiniones..."
  sql db-ctv    ctv    ctv    seeds/ctv/k6.sql
  echo "Listo."
}

case "$1" in
  cargar)  cargar ;;
  limpiar) limpiar ;;
  *) echo "Uso: bash seeds/seed.sh cargar|limpiar"; exit 1 ;;
esac
