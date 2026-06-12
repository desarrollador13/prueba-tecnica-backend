# ==========================================
# ETAPA 1: Construcción y Compilación (Build)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/


RUN npm run build
RUN npm prune --production


# ==========================================
# ETAPA 2: Imagen Final de Producción
# ==========================================
FROM node:20-alpine AS runner


ENV NODE_ENV=production

WORKDIR /app


COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 3000


CMD ["npm", "run", "start"]