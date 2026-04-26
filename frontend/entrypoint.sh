#!/usr/bin/env sh
set -e

# ── Inicialização automática do projeto Angular ───────────────────────────────
# Só roda na primeira vez (quando não existir o marker .ng_initialized)
if [ ! -f /app/.ng_initialized ]; then
  echo ""
  echo "========================================================"
  echo "  Primeira execução — inicializando projeto Angular..."
  echo "========================================================"

  # Gera o skeleton do Angular em pasta temporária
  echo "--> Gerando skeleton Angular em /tmp/ng-skeleton..."
  ng new ng-skeleton \
    --directory /tmp/ng-skeleton \
    --standalone \
    --routing \
    --style=scss \
    --skip-git \
    --skip-install \
    --defaults \
    2>/dev/null

  # Copia apenas os arquivos que ainda NÃO existem em /app
  echo "--> Mesclando skeleton com arquivos do projeto..."
  find /tmp/ng-skeleton -type f \
    ! -path '*/node_modules/*' \
    ! -path '*/.angular/*' | while read src; do
    relative="${src#/tmp/ng-skeleton/}"
    dest="/app/$relative"
    if [ ! -f "$dest" ]; then
      mkdir -p "$(dirname "$dest")"
      cp "$src" "$dest"
    fi
  done

  rm -rf /tmp/ng-skeleton
  touch /app/.ng_initialized
  echo "--> Skeleton aplicado!"
fi

# ── Dependências ──────────────────────────────────────────────────────────────
echo "--> Instalando pacotes npm..."
npm install --legacy-peer-deps

echo ""
echo "========================================================"
echo "  Frontend pronto em http://localhost:4200"
echo "========================================================"
echo ""

exec "$@"
