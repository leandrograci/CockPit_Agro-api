# ─────────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

# Instala openssl (necessário para o Prisma engine no Alpine)
RUN apk add --no-cache openssl

WORKDIR /app

# Instala dependências (todas, incluindo devDependencies para compilar)
COPY package.json package-lock.json ./
RUN npm ci

# Copia o schema do Prisma e gera o client antes de compilar
COPY prisma ./prisma
RUN npx prisma generate

# Copia o restante do código-fonte e compila TypeScript
# (prisma/ já foi copiado acima — seed.ts será incluído no build)
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Runtime (apenas o necessário)
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner

# Instala openssl (necessário para o Prisma engine no Alpine)
RUN apk add --no-cache openssl

WORKDIR /app

# Instala apenas dependências de produção
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copia o schema do Prisma e regenera o client para produção
COPY prisma ./prisma
RUN npx prisma generate

# Copia o build compilado do stage anterior
COPY --from=builder /app/dist ./dist

# Copia o script de inicialização
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["./docker-entrypoint.sh"]
