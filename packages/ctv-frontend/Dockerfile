# --- Build stage ---
FROM node:24-alpine AS build
WORKDIR /app

# 1. Copiar archivos de configuración global del monorepo
COPY package.json package-lock.json ./

# 2. Copiar los package.json de los workspaces necesarios
COPY packages/ctv-frontend/package.json ./packages/ctv-frontend/

# (Opcional) Si ctv-frontend depende de otro paquete interno del monorepo, descomenta y ajusta:
# COPY packages/shared/package.json ./packages/shared/

ARG INSTALL_MODE=precache

# 3. Instalación de dependencias con caché de Mount
RUN --mount=type=cache,target=/root/.npm \
    if [ "$INSTALL_MODE" = "precache" ]; then \
      echo "--> Modo PRECACHE: Instalando dependencias del monorepo"; \
      npm ci --workspace=ctv-frontend --include-workspace-root --prefer-offline; \
    else \
      echo "--> Modo FULL: Instalación limpia desde registro"; \
      npm ci --workspace=ctv-frontend --include-workspace-root; \
    fi

# 4. Inyectar variables de entorno para Vite (antes del código para evitar re-instalaciones)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# 5. Copiar el código fuente completo e iniciar la compilación
COPY . .
RUN npm run build --workspace=ctv-frontend

# --- Serve stage ---
FROM nginx:alpine AS serve
COPY packages/ctv-frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/ctv-frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]