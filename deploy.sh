#!/usr/bin/env bash
set -e

cd /home/portais-do-improviso/client

npm run build

sudo rm -rf /var/www/arcadestudio.games/*
sudo cp -r dist/* /var/www/arcadestudio.games/
sudo chown -R www-data:www-data /var/www/arcadestudio.games

echo "✅ Deploy finalizado: https://arcadestudio.games"
