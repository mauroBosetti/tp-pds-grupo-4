# CLAUDE.md

Guía para trabajar en este repositorio. Es un Trabajo Práctico de la materia (Grupo 4),
así que el código lo van a leer, corregir y defender personas: priorizamos claridad y
código que se explica solo por encima de la velocidad.

## Principio central: el código se explica solo, no con comentarios

En este proyecto **mantenemos los comentarios generados por IA al mínimo**. Un comentario
suele ser la señal de que el código todavía no es lo suficientemente claro.

Antes de escribir un comentario, hacete esta pregunta y actuá en consecuencia:

> **¿Qué función o qué variable necesita un nombre más expresivo, en lugar de un comentario que lo aclare?**

La respuesta casi siempre es refactorizar, no comentar:

- Si un bloque necesita un comentario que diga *qué hace* → extraelo a una función con
  un nombre que diga qué hace.
- Si una variable necesita un comentario que aclare *qué es* → renombrala para que se
  entienda sin el comentario (`d` → `diasHastaVuelo`).
- Si una condición necesita un comentario → extraela a una variable o función booleana
  con nombre (`if (esVueloInternacional)` en vez de `if (origen.pais !== destino.pais) // internacional`).

**Comentarios que sí valen la pena** (los pocos que quedan):

- El *por qué* de una decisión no obvia: un workaround, una restricción del negocio, un
  bug conocido de una librería. Documentan lo que el código no puede expresar.
- `TODO`/`FIXME` con contexto real.
- Documentación de una API pública si el equipo la consume desde otro paquete.

**Nunca** agregues comentarios que repiten lo que el código ya dice
(`// incrementa el contador` sobre `contador++`), ni comentarios que narran el diff
(`// agrego cors`), ni JSDoc autogenerado sin información nueva.

Regla práctica para Claude: si vas a agregar un comentario, primero proponé el rename o
la extracción. Comentá solo si después de eso el *por qué* sigue sin quedar claro.

## Qué es este proyecto

Monorepo con **npm workspaces**. Tres paquetes en `packages/`:

| Paquete | Qué es | Stack |
|---|---|---|
| `ctv-frontend` | Interfaz web | React 19 + Vite + TypeScript |
| `ctv-backend` | API HTTP | Express 5 + TypeScript (ESM) |
| `api-vuelos` | Módulo de vuelos | Node + TypeScript (CommonJS) |

El frontend consume al backend vía `VITE_API_URL` (por defecto `http://localhost:3000`).
Ambos servicios se levantan juntos con Docker Compose.

## Comandos

Desde la raíz, apuntando a cada workspace:

```bash
# Frontend (dev server de Vite)
npm run dev -w ctv-frontend

# Backend (tsx watch, recarga en caliente)
npm run dev -w ctv-backend

# Build de cada paquete
npm run build -w ctv-frontend
npm run build -w ctv-backend
```

Levantar todo con Docker:

```bash
docker compose up --build
```

- Frontend en `http://localhost:8080`
- Backend en `http://localhost:3000`

## Convenciones de código

- **TypeScript en todo lo nuevo.** Evitá `any`; si un tipo cuesta, es señal de que el
  diseño necesita pensarse, no de que haga falta escapar del tipado.
- **Nombres en español**, coherentes con el código y los commits existentes
  (`mensaje`, `esVueloInternacional`). No mezclar idiomas en la misma capa.
- **Funciones chicas y con un solo propósito.** Si una función necesita subtítulos
  (comentarios que separan secciones), probablemente son varias funciones.
- **El backend usa ESM** (`"type": "module"`), `api-vuelos` usa CommonJS. Respetá el
  sistema de módulos de cada paquete al importar.
- Mensajes de commit en español, en imperativo, describiendo el *qué* y el *por qué*
  (seguí el estilo del historial).

## Al terminar un cambio

- Verificá que compila: `npm run build -w <paquete>`.
- Si tocaste frontend y backend juntos, probá el flujo real (levantá ambos y confirmá que
  se comunican), no solo que cada uno compila por separado.
- Revisá tu propio diff con la pregunta del principio central: ¿algún comentario que
  agregaste se puede reemplazar por un mejor nombre?
