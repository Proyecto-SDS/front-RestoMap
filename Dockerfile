# 1. Imagen base
FROM node:18-alpine AS base

# 2. Instalar dependencias
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# Instalamos dependencias (usando npm ci para ser exactos)
RUN npm ci

# 3. Construir el proyecto (Builder)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# --- VARIABLES DE ENTORNO EN TIEMPO DE BUILD ---
# Next.js "quema" las variables NEXT_PUBLIC_ al momento de construir
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Desactivar telemetría de Next para que sea más rápido
ENV NEXT_TELEMETRY_DISABLED 1

# Construir
RUN npm run build

# 4. Imagen final para producción (Runner)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Crear usuario para no correr como root (seguridad)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar solo lo necesario de la etapa "builder"
# La carpeta public (imágenes, favicon, etc)
COPY --from=builder /app/public ./public

# Copiar la carpeta "standalone" (nuestro servidor optimizado)
# --chown asegura que el usuario nextjs tenga permisos
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambiar al usuario seguro
USER nextjs

# Cloud Run inyectará PORT, y Next.js lo leerá automáticamente.
# Exponemos 3000 por convención
EXPOSE 3000

# Next.js en modo standalone genera un archivo server.js
CMD ["node", "server.js"]