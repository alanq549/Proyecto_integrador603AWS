# Etapa 1: build
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Etapa 2: servidor Nginx
FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Copia la configuración personalizada de nginx
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
