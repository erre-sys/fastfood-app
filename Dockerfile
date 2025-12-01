FROM nginx:alpine

# Limpiar contenido por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copiar *solo* el contenido build final
COPY dist/webapp/browser/ /usr/share/nginx/html/

EXPOSE 80

# Opcional: si quieres SPA (Angular con router), agrega un nginx.conf
# De lo contrario, Nginx sirve perfectamente el index.html y los assets
