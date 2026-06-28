#!/bin/sh
set -e

envsubst < /usr/share/nginx/html/assets/config.template.json \
  > /usr/share/nginx/html/assets/config.json

echo "config.json generado:"
cat /usr/share/nginx/html/assets/config.json

exec "$@"