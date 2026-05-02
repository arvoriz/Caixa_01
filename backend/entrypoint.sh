#!/usr/bin/env bash
set -e

# ── Inicialização automática do projeto Rails ─────────────────────────────────
# Só roda na primeira vez (quando não existir o marker .rails_initialized)
if [ ! -f /app/.rails_initialized ]; then
  echo ""
  echo "========================================================"
  echo "  Primeira execução — inicializando projeto Rails..."
  echo "========================================================"

  # Gera o skeleton do Rails em pasta temporária para não sobrescrever
  # os arquivos customizados que já existem em /app
  echo "--> Gerando skeleton Rails em /tmp/skeleton..."
  rails new /tmp/skeleton \
    --api \
    --database=postgresql \
    --skip-git \
    --skip-bundle \
    --skip-test \
    --skip-action-mailer \
    --skip-action-mailbox \
    --skip-action-text \
    --skip-active-storage \
    --skip-action-cable \
    --quiet

  # Copia apenas os arquivos que ainda NÃO existem em /app
  # (preserva tudo que já foi customizado)
  echo "--> Mesclando skeleton com arquivos do projeto..."
  find /tmp/skeleton -type f | while read src; do
    relative="${src#/tmp/skeleton/}"
    dest="/app/$relative"
    if [ ! -f "$dest" ]; then
      mkdir -p "$(dirname "$dest")"
      cp "$src" "$dest"
    fi
  done

  rm -rf /tmp/skeleton
  touch /app/.rails_initialized
  echo "--> Skeleton aplicado!"
fi

# ── Dependências ──────────────────────────────────────────────────────────────
echo "--> Instalando gems..."
bundle install --jobs 4 --retry 3

# ── Banco de dados ────────────────────────────────────────────────────────────
# O schema é gerenciado pelo Supabase (SQL aplicado diretamente no painel).
# Rails apenas conecta ao banco existente.
echo "--> Aplicando migrations pendentes (se houver)..."
bundle exec rails db:migrate 2>/dev/null || true
bundle exec rails db:seed 2>/dev/null || true

# ── Remove PID travado (evita erro de restart) ────────────────────────────────
rm -f /app/tmp/pids/server.pid

echo ""
echo "========================================================"
echo "  Backend pronto em http://localhost:3000"
echo "========================================================"
echo ""

exec "$@"
