# YouConnext Backend - Dockerfile
# Multi-stage build para optimizar el tamaño de la imagen

# Stage 1: Dependencias
FROM node:20-alpine AS deps
WORKDIR /app

# Prisma engine (musl) puede requerir libssl.so.1.1 en Alpine
RUN apk add --no-cache openssl

# Copiar package files
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci --only=production

# Stage 2: Build de Prisma
FROM node:20-alpine AS builder
WORKDIR /app

# Prisma engine (musl) puede requerir libssl.so.1.1 en Alpine
RUN apk add --no-cache openssl

# Copiar package files
COPY package.json package-lock.json ./

# Instalar todas las dependencias (incluye devDependencies para Prisma)
RUN npm ci

# Copiar código fuente
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Stage 3: Producción
FROM node:20-alpine AS production
WORKDIR /app

# Prisma engine (runtime) requiere libssl.so.1.1
RUN apk add --no-cache openssl

# Crear grupo y usuario para seguridad
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copiar package files y dependencias instaladas
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules

# Copiar Prisma Client generado (evita error "@prisma/client did not initialize yet")
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copiar código fuente y Prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma

# Cambiar ownership
RUN chown -R nodejs:nodejs /app

# Asegurar permisos de ejecución para prisma CLI
RUN chmod +x ./node_modules/.bin/prisma || true

# Cambiar a usuario no root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Comando de inicio (usa el entry point que ejecuta migrations)
CMD ["node", "src/docker-entry.js"]