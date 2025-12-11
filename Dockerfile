# Dockerfile for a Next.js application

# 1. Builder Stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Set build-time environment variables from .env if they are needed for the build process
# Note: These are not the runtime variables.
ARG DB_HOST
ARG DB_USER
ARG DB_PASSWORD
ARG DB_DATABASE
ARG JWT_SECRET

ENV DB_HOST=${DB_HOST}
ENV DB_USER=${DB_USER}
ENV DB_PASSWORD=${DB_PASSWORD}
ENV DB_DATABASE=${DB_DATABASE}
ENV JWT_SECRET=${JWT_SECRET}

# Build the Next.js application
RUN npm run build

# 2. Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment variables
# These should be provided by the docker-compose.yml file at runtime
ENV NODE_ENV=production
# You don't need to set the database variables here as they will be injected by Docker Compose

# Copy the standalone output from the builder stage
COPY --from=builder /app/.next/standalone ./
# Copy the public assets and static build assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static


# Expose the port the app runs on
EXPOSE 3000

# The command to start the app
CMD ["node", "server.js"]