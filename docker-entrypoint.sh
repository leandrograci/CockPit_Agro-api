#!/bin/sh
set -e

echo "🔄 Aplicando migrations do Prisma..."
npx prisma migrate deploy

echo "🌱 Executando seed (idempotente)..."
npx prisma db seed

echo "🚀 Iniciando a API..."
exec node dist/server.js
