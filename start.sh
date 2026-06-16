

set -e

echo ""
echo "  ⬡  Lorac — Plataforma de Estudo Colaborativo"
echo "  ─────────────────────────────────────────────────"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"


if ! command -v python3 &>/dev/null; then
  echo "  ❌ Python 3 não encontrado. Instale em: https://python.org"
  exit 1
fi
echo "  ✅ Python: $(python3 --version)"


echo "  📦 Instalando dependências..."
cd "$BACKEND_DIR"
pip install -r requirements.txt -q



echo ""
echo "  🚀 Iniciando servidor..."
echo "  ─────────────────────────────────────────────────"
echo "  🌐 Acesse: http://localhost:8000"
echo "  📊 API Docs: http://localhost:8000/docs"
echo "  📁 Dados: $BACKEND_DIR/studysync_data.xlsx"
echo "  ─────────────────────────────────────────────────"
echo "  Para parar: Ctrl+C"
echo ""

cd "$BACKEND_DIR"
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
