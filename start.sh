#!/bin/sh
set -e

echo "Starting Secret Santa application..."

# Give database a few seconds to be ready
echo "Waiting for database to initialize..."
sleep 5

echo "Running database migrations..."
pnpm db:push

echo "Starting application..."
exec node dist/server/_core/index.js
