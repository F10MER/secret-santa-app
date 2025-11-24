#!/bin/sh
set -e

echo "Starting Secret Santa application..."

# Start the application directly
exec node dist/index.js
