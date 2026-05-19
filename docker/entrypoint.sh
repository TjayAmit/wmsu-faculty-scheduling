#!/bin/sh
set -e

echo "==> Running Laravel boot optimizations..."

# Cache configuration, routes, and views for production performance.
# These commands read the injected environment variables at container start
# time rather than at image build time — which is why they live here rather
# than in the Dockerfile RUN layer.
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> Starting Laravel Octane (FrankenPHP)..."

exec php artisan octane:start \
    --server=frankenphp \
    --host=0.0.0.0 \
    --port=8000 \
    --workers="${OCTANE_WORKERS:-auto}"
