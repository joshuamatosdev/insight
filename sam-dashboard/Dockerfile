# =============================================================================
# Insight Contract Intelligence Platform - Frontend Docker Build
# =============================================================================
# This Dockerfile uses multi-stage builds to create a minimal, secure
# production image serving the React application via nginx.
#
# Stages:
#   1. build   - Build the React application
#   2. runtime - Serve with nginx
#
# Build args:
#   BUILD_ENV - production or development (affects optimizations)
#   VITE_API_URL - Backend API URL for build-time injection
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build Stage
# -----------------------------------------------------------------------------
FROM node:20-alpine AS build

# Build arguments
ARG BUILD_ENV=production
ARG VITE_API_URL=/

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Copy package files for dependency caching
COPY package.json package-lock.json ./

# Install dependencies
# - For production: clean install with exact versions
# - For development: faster install
RUN if [ "$BUILD_ENV" = "production" ]; then \
        npm ci --only=production=false; \
    else \
        npm install; \
    fi

# Copy source files
COPY . .

# Set build-time environment variables
ENV VITE_API_URL=${VITE_API_URL}
ENV NODE_ENV=production

# Build application
RUN npm run build

# Verify build output
RUN ls -la dist/ && \
    test -f dist/index.html

# -----------------------------------------------------------------------------
# Stage 2: Runtime Stage (nginx)
# -----------------------------------------------------------------------------
FROM nginx:1.25-alpine AS runtime

# Labels
LABEL maintainer="Insight Team <support@doctrineone.us>"
LABEL version="1.0.0"
LABEL description="Insight Contract Intelligence Platform - Frontend"

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# Remove default nginx configuration
RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

# Copy custom nginx configuration
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create non-root user for nginx
RUN addgroup -g 1001 -S nginx-group && \
    adduser -u 1001 -S nginx-user -G nginx-group && \
    chown -R nginx-user:nginx-group /usr/share/nginx/html && \
    chown -R nginx-user:nginx-group /var/cache/nginx && \
    chown -R nginx-user:nginx-group /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-group /var/run/nginx.pid

# Create health check endpoint
RUN echo "OK" > /usr/share/nginx/html/health

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Run as non-root user
USER nginx-user

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
