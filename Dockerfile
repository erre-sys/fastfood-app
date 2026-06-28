FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --prod

FROM nginx:alpine

RUN apk add --no-cache gettext

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/webapp/browser/* /usr/share/nginx/html/
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY ./config.template.json /usr/share/nginx/html/assets/config.template.json
COPY ./docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]