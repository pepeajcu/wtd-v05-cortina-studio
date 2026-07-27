# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Imagen de produccion para Next.js 14 (App Router, output: standalone).
# Pensada para Dokploy: Build Type = Dockerfile, puerto expuesto 3000.
#
# IMPORTANTE (build args): las variables NEXT_PUBLIC_* se inlinean en el bundle
# durante `next build`. Definirlas en Dokploy solo como "Environment" NO tiene
# efecto: hay que pasarlas tambien como Build Args.
# Las variables sin prefijo NEXT_PUBLIC_ (WORDPRESS_REVALIDATION_SECRET, etc.)
# se leen en runtime y van solo en "Environment".
#
# El build prerenderiza la home y /productos/[slug] con datos de WordPress:
# el endpoint GraphQL debe ser alcanzable desde el servidor de build.
# ---------------------------------------------------------------------------

# ----------------------------- base ----------------------------------------
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
# El package-lock.json se genera con npm 11; npm 10 (el que trae la imagen)
# resuelve los peerDeps distinto y hace fallar `npm ci`. Se fija la misma major.
RUN npm install -g npm@11.16.0 --no-audit --no-fund
ENV NEXT_TELEMETRY_DISABLED=1

# ----------------------------- deps ----------------------------------------
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ----------------------------- sharp ---------------------------------------
# Next 14 exige `sharp` en modo standalone para optimizar imagenes.
# Se instala aislado (no toca package.json) y se enlaza via NEXT_SHARP_PATH.
FROM base AS sharp
WORKDIR /opt/sharp
RUN npm init -y > /dev/null \
 && npm install --omit=dev --no-audit --no-fund sharp@0.33.5

# ----------------------------- builder -------------------------------------
FROM base AS builder
WORKDIR /app

ARG NEXT_PUBLIC_WORDPRESS_API_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_WORDPRESS_API_URL=$NEXT_PUBLIC_WORDPRESS_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ----------------------------- runner --------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_SHARP_PATH=/opt/sharp/node_modules/sharp

RUN addgroup -g 1001 -S nodejs \
 && adduser -u 1001 -S nextjs -G nodejs

COPY --from=sharp /opt/sharp/node_modules /opt/sharp/node_modules

# standalone no incluye public/ ni .next/static: se copian a mano.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cache ISR escribible por el usuario no-root.
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
