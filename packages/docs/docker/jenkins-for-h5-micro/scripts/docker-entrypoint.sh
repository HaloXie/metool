#!/bin/bash
set -e
/usr/bin/confd -onetime -backend env
chmod +x /init.sh
sh /init.sh

exec "$@"
