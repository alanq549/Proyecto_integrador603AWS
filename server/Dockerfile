FROM node:20 AS builder

WORKDIR /app

# Copiamos config y deps
COPY package*.json tsconfig*.json ./
RUN npm install

# Copiamos el resto
COPY . .

# ✅ Generamos clientes Prisma:
# 1. Cliente por defecto para @prisma/client
RUN npx prisma generate --schema=prisma/schema.prisma

# 2. Cliente personalizado local
RUN npx prisma generate --schema=prisma/local/schema.prisma

# 3. Cliente personalizado AWS
RUN npx prisma generate --schema=prisma/aws/schema.prisma

# Compilamos el proyecto
RUN npm run build

# -----------------------------

FROM node:20 AS runtime

WORKDIR /app

# Solo deps necesarias para producción
COPY package*.json ./
RUN npm install --production

# Copiamos lo generado
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma/generated ./prisma/generated
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "dist/server.js"]
