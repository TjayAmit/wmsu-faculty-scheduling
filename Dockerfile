# ============================================================
# Stage 1: Node — compile frontend assets
# ============================================================
FROM node:22-alpine AS node-builder

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY package.json package-lock.json ./

RUN npm ci

# Copy the full source so Vite can resolve app paths
COPY . .

RUN npm run build

# ============================================================
# Stage 2: Composer — install production PHP dependencies
# ============================================================
FROM composer:2 AS composer-builder

WORKDIR /app

COPY composer.json composer.lock ./

# Install production deps only; skip scripts that need artisan
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader

# ============================================================
# Stage 3: Runtime — FrankenPHP (Octane)
# ============================================================
FROM dunglas/frankenphp:latest-php8.3-alpine AS runtime

# Install required PHP extensions
RUN install-php-extensions \
    pdo_mysql \
    redis \
    pcntl \
    opcache \
    intl \
    zip \
    bcmath

# Create a non-root user for the application
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# Copy PHP production dependencies from composer stage
COPY --from=composer-builder /app/vendor ./vendor

# Copy compiled frontend assets from node stage
COPY --from=node-builder /app/public/build ./public/build

# Copy application source (no .env — injected at runtime)
COPY --chown=appuser:appgroup . .

# Entrypoint script
COPY --chown=appuser:appgroup docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Storage and cache directories must be writable
RUN mkdir -p storage/framework/{cache,sessions,views} \
             storage/logs \
             bootstrap/cache && \
    chown -R appuser:appgroup storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

USER appuser

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
