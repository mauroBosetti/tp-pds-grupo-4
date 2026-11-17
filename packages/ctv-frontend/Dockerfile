# --- Build stage ---
FROM node:24-alpine AS build
WORKDIR /app

# Install deps using the workspace's own manifest (built standalone)
COPY package.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install

# Build the app
COPY . .
RUN npm run build

# --- Serve stage ---
FROM docker.io/library/nginx:alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
