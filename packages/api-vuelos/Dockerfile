# --- Build stage ---
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json ./
RUN npm install
COPY . .


# --- Runtime stage ---
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src

EXPOSE 4000
CMD ["sh", "-c", "node src/index.js"]
