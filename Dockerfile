FROM nginx:alpine

# Borra archivos estáticos previos
RUN rm -rf /usr/share/nginx/html/*

# Copia el build
COPY docker-dist/ /usr/share/nginx/html

EXPOSE 80
