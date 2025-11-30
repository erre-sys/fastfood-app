FROM nginx:alpine

# Borra archivos estáticos previos
RUN rm -rf /usr/share/nginx/html/*

# Copia el build
COPY docker-dist/ /usr/share/nginx/html

# (opcional) agregar config para SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
