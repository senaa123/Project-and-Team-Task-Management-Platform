# Base image
FROM node:20-slim AS builder

# Install OpenSSL (required for Prisma client generation)
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy the rest of the application code
COPY . .

# Generate Prisma client and build the app
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:20-slim AS production

# Install OpenSSL in the production container as well
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package and node_modules from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose port (Fly.io/Cloud Run defaults to 8080)
EXPOSE 8080

# Environment variables
ENV PORT=8080
ENV NODE_ENV=production

# Startup: run migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
