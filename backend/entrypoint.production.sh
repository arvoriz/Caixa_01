#!/usr/bin/env bash
set -e

echo "--> Aplicando migrations pendentes (se houver)..."
bundle exec rails db:migrate 2>/dev/null || true

rm -f /app/tmp/pids/server.pid

echo ""
echo "========================================================"
echo "  Backend pronto em http://0.0.0.0:3000"
echo "========================================================"
echo ""

exec "$@"
