# TP-PDS-GRUPO-4

## run full project

### W/ Docker Compose
```
   * docker compose up
   * http://localhost:8080/admin
   * http://localhost:8080/login
```

### W/ Kubernetes (kind + Helm)
   * requisitos: docker, kubectl, kind y helm (`brew install kind helm`)
   * docker build -t ctv-backend:dev packages/ctv-backend
   * docker build -t api-vuelos:dev packages/api-vuelos
   * docker build -t ctv-frontend:dev packages/ctv-frontend
   * kind create cluster --name tp-pds --config k8s/kind-config.yaml
   * kind load docker-image ctv-backend:dev api-vuelos:dev ctv-frontend:dev --name tp-pds
   * kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
   * kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=240s
   * cp k8s/valores-locales.example.yaml k8s/valores-locales.yaml (completar las contraseñas; el archivo no se versiona)
   * helm install tp-pds k8s/tp-pds -n tp-pds --create-namespace -f k8s/valores-locales.yaml --wait
   * http://localhost:8081/login

   Para aplicar cambios: `helm upgrade tp-pds k8s/tp-pds -n tp-pds -f k8s/valores-locales.yaml`.
   Para borrar el cluster: `kind delete cluster --name tp-pds`.

### imagenes docker
   * grafana
   * influxdb
   * sonarqube
   * api-vuelos
   * ctv-backend
   * ctv-frontend
   * k6
   * loki
   * prometheus
   * cAdvisor
   * alloy

## Logs
```docker compose logs -f --no-log-prefix ctv-backend api-vuelos | npx pino-pretty```
### LOG_LEVEL
* **info** : Eventos normales: compra registrada, login exitoso, petición terminada con 2xx
* **warn** : Algo rechazado o inesperado, pero el sistema funciona: venta rechazada por falta de  cupo, login fallido, respuestas 4xx
* **error** : Fallas del sistema: errores 5xx, api-vuelos inaccesible, compra inconsistente
* **fatal** : El proceso no puede seguir y se cierra
* **silence** : No escribe nada
### Loki + Grafana
* http://localhost:3001  admin:admin > skip
> configuracion db y dashboard en compose.
* Data sources > Loki > explore > label filter > app > ctv-backend | api-vuelos > Run query
* loki-dashboard.json con paneles de "Errores y advertencias" y Trazabilidad: todos los logs (filtrar con la variable requestId) entre otros.

## Prometheus + cAdvisor
* prometheus http://localhost:9090
* http://localhost:3001  admin:admin > skip
> configuracion db y dashboard en compose.

## K6
   * npm run dev
   * npm run seed:k6

   * npm run test:k6:smoke
   * npm run test:k6:load (VUS=30)
   * npm run test:k6:stress (PICO=200)
   * npm run test:k6:sobreventa (VUS=50, INTENTOS=200)
   * npm run test:k6:sobreventa-vuelos (VUS=50, INTENTOS=200)

   * npm run seed:k6:clean

   > se recomienda:
   > * LOG_LEVEL=error docker compose up -d
   > * docker compose down sonarqube
   ### influx + graphana

   * http://localhost:3001
   * admin | admin > skip
   > configuracion db y dashboard en compose.
   * Connections > Add new > (search) InfluxDB (Data Sources) > Add new data source
   
   #### configuracion de plugin
      * http:url: http://influxdb:8086
      * InfluxDB:Details > Database : k6 
      * Save & test

   * Dashboards > View as list 
   * Dashboards > New > Import
   * Upload dashboard JSON file | Import via dashboard JSON model 
      * .\dashboards\dashboard-influx.json > Load
      * DS_INFLUXDB (seleccionar) > Import

   ### parametros bash
      * VUS       cantidad de usuarios simultaneos (load, sobreventas, sobreventas-vuelos)
      * PICO      cantidad maxima de usuarios virtuales (stress)
      * INTENTOS  cantidad total de peticiones (sobreventas, sobreventas-vuelos)
      * CLIENTES  pool de usuarios, por default 20. (todos)

      > EX. VUS=100 bash k6/run.sh load

## Sonar
```
docker compose up sonarqube
```
* http://localhost:9001/
* usr and pass: admin admin
* projects -> create local project
* project display name: tp-pds-grupo-4
* branch: dev -> next
* follow instance default -> create project
* locally -> generate -> continue
* para generar coverage
``` 
docker compose up db-vuelos-test
npm run test:coverage
``` 

``` 
bash
> npm run sonar -- -Dsonar.token=TOKEN_GENERADO
```
``` 
powershell
> $env:SONAR_TOKEN="TU_TOKEN"
> npm run sonar
```
## api-vuelos

```npm run db:reset -w api-vuelos```

```npm run db:reset:test -w api-vuelos```

#### cucumber test

```docker compose up -d db-vuelos-test```

```export TEST_DATABASE_URL=postgresql://vuelos_test:vuelos_test@localhost:5434/vuelos_test```

```npm run test -w api-vuelos```

   * para obtener IP local
```podman machine ssh -- ip -4 addr show eth0```
 
## ctv-backend

#### ORM prisma 7

Para correr prisma generate configurar variables de entorno:

```npm run db:generate -w ctv-backend```

   * Copiar el archivo `packages/ctv-backend/.env.example` y renombralo a `.env` en la misma carpeta.
   * Modificar la variable `DATABASE_URL` con credenciales de PostgreSQL locales. (no necesario)
El grafico de los modelos se guarda en `packages/ctv-backend/ERD.svg`

Para correr prisma migrate

```npm run db:migrate -w ctv-backend```

   * docker-compose up db
   * resultado en packages\ctv-backend\prisma\migrations\
   * ```npm run db:migrate:reset -w ctv-backend``` para borrar datos y aplicar un migrate limpio.

Datos de prueba

```npm run db:seed -w ctv-backend```

UI web

```npm run db:studio -w ctv-backend```

## ctv-frontend
