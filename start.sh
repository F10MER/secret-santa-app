#!/bin/sh
set -e

echo "Starting Secret Santa application..."

# Start the application directly using tsx with production tsconfig
exec pnpm exec tsx --tsconfig tsconfig.prod.json server/_core/index.ts
