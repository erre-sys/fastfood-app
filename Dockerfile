# ====== STAGE 1: Build Angular ======
FROM node:18-alpine AS build
WORKDIR /app

# Copiamos package.json para aprovechar la cache de Docker
COPY package*.json ./
RUN npm install

# Copiamos todo el proyecto
COPY . .

# Build Angular (ajusta la config si usas otra)
RUN npm run build --configuration production

# ====== STAGE 2: Nginx server ======
FROM nginx:alpine

# Limpiamos el html de ejemplo
RUN rm -rf /usr/share/nginx/html/*

# Copiamos SOLO los archivos de Angular ya construidos
COPY --from=build /app/dist/webapp/browser /usr/share/nginx/html

# Tu config de nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
