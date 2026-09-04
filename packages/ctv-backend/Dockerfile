# --- Build stage ---
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json ./
RUN npm install

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
# RUN apk add --no-cache chromium
# ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV DISABLE_ERD=true
ENV PRISMA_DISABLE_ERD=true

COPY . .
RUN npm run build

# --- Runtime stage ---
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
COPY prisma ./prisma
COPY resources ./resources
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
