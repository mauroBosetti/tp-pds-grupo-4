# TP-PDS-GRUPO-4

## Sonar
```
docker compose up sonarqube
```
* http://localhost:9000/
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
## run full project

### W/ Docker Compose
* ```docker compose up```
* ```localhost:8080```

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
