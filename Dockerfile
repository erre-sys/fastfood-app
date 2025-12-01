FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY docker-dist/ /usr/share/nginx/html/

EXPOSE 80
