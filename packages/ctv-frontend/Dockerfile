# --- Build stage ---
FROM node:24-alpine AS build
WORKDIR /app

# Install deps using the workspace's own manifest (built standalone)
COPY package.json ./
RUN npm install

# Build the app
COPY . .
RUN npm run build

# --- Serve stage ---
FROM nginx:alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
