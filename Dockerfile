# 1. Imagen Base (CAMBIADO DE 18 A 20)
# Next.js moderno requiere Node 20+
FROM node:20-alpine AS base

# 2. Instalar Dependencias
FROM base AS deps
# Instalar libc6-compat necesario para algunas librerías en Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./

# Usamos 'npm ci' para instalar exactamente las versiones del lockfile
RUN npm ci

# 3. Construir (Builder)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# --- VARIABLES DE ENTORNO ---
# Recibimos la URL del backend durante el build
ARG NEXT_PUBLIC_API_URL
# (Corregido warning: se agrega el signo =)
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Desactivar telemetría
ENV NEXT_TELEMETRY_DISABLED=1

# Compilar el proyecto
RUN npm run build

# 4. Imagen Final (Runner)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario para seguridad (no usar root)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios para el modo Standalone
COPY --from=builder /app/public ./public

# Configurar permisos correctos para la cache de Next.js
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiar el build standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Usar el usuario seguro
USER nextjs

# Exponer el puerto 3000
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Arrancar el servidor
CMD ["node", "server.js"]