# =============================================================================
# Insight Contract Intelligence Platform - Backend Docker Build
# =============================================================================
# This Dockerfile uses multi-stage builds to create a minimal, secure
# production image for the Spring Boot application.
#
# Stages:
#   1. build  - Compile and package the application
#   2. runtime - Minimal production image
#
# Build args:
#   BUILD_ENV - production or development (affects optimizations)
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build Stage
# -----------------------------------------------------------------------------
FROM eclipse-temurin:21-jdk-alpine AS build

# Build arguments
ARG BUILD_ENV=production

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    bash \
    curl \
    && rm -rf /var/cache/apk/*

# Copy Gradle wrapper and configuration
COPY gradlew ./
COPY gradle gradle
COPY build.gradle settings.gradle ./

# Make gradlew executable
RUN chmod +x ./gradlew

# Download dependencies (cached layer)
RUN ./gradlew dependencies --no-daemon --refresh-dependencies || true

# Copy source code
COPY src src

# Build application
# - For production: full optimization
# - For development: faster builds
RUN if [ "$BUILD_ENV" = "production" ]; then \
        ./gradlew bootJar --no-daemon -x test; \
    else \
        ./gradlew bootJar --no-daemon -x test --parallel; \
    fi

# Verify JAR was created
RUN ls -la build/libs/ && \
    test -f build/libs/*.jar

# -----------------------------------------------------------------------------
# Stage 2: Runtime Stage
# -----------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS runtime

# Build arguments
ARG BUILD_ENV=production

# Labels
LABEL maintainer="Insight Team <support@doctrineone.us>"
LABEL version="1.0.0"
LABEL description="Insight Contract Intelligence Platform - Backend API"

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    wget \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Create necessary directories
RUN mkdir -p /app/logs /app/config /app/temp && \
    chown -R appuser:appgroup /app

# Copy JAR from build stage
COPY --from=build --chown=appuser:appgroup /app/build/libs/*.jar app.jar

# Environment variables
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
ENV SPRING_PROFILES_ACTIVE="docker"
ENV SERVER_PORT=8080

# Expose port
EXPOSE 8080

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

# Use dumb-init to properly handle signals
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Run application with JAVA_OPTS
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
