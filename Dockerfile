# Multi-stage build for Secret Santa Telegram Mini App

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and patches
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# Install pnpm and postgresql-client for migrations
RUN npm install -g pnpm && \
    apk add --no-cache postgresql-client bash

# Copy package files and patches
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install all dependencies (including tsx for runtime)
RUN pnpm install --frozen-lockfile

# Explicitly install tsx to ensure it's available
RUN pnpm add tsx

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy source files for tsx runtime
COPY server ./server
COPY shared ./shared
COPY tsconfig.json tsconfig.prod.json ./

# Copy drizzle files for migrations
COPY drizzle ./drizzle
COPY drizzle.config.ts ./

# Copy startup script
COPY start.sh ./
RUN chmod +x start.sh

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application with migrations
CMD ["./start.sh"]
