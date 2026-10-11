#!/bin/sh
set -eu

RESOLVER="$(awk '/^nameserver/ && $2 !~ /:/ { print $2; exit }' /etc/resolv.conf)"
if [ -z "${RESOLVER}" ]; then
  RESOLVER=127.0.0.11
fi

sed "s/__RESOLVER__/${RESOLVER}/" /etc/nginx/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
