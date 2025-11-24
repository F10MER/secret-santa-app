#!/bin/bash
set -e

echo "Starting Secret Santa application..."

# Wait for database to be ready
echo "Waiting for database..."
until PGPASSWORD=$DB_PASSWORD psql -h "$(echo $DATABASE_URL | sed -n 's/.*@\(.*\):.*/\1/p')" -U "$(echo $DATABASE_URL | sed -n 's/.*\/\/\(.*\):.*/\1/p')" -c '\q' 2>/dev/null; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is up - running migrations..."
pnpm db:push

echo "Starting application..."
node dist/server/_core/index.js
