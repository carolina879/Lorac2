"""
Teste rápido de conexão com o Neon (Postgres).

Como usar:
    cd Lorac2-main
    pip install -r requirements.txt
    python test_pg_connection.py

Se aparecer "✅ Conexão OK", o schema relacional já foi criado e as 6
salas padrão estão no banco. Depois disso, é só rodar o app normalmente
(uvicorn main:app ou start.sh) que ele vai ler/gravar tudo no Postgres.
"""
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

if not DATABASE_URL:
    print("❌ DATABASE_URL não encontrada no .env")
    raise SystemExit(1)

import psycopg2

try:
    conn = psycopg2.connect(DATABASE_URL, connect_timeout=10)
    cur = conn.cursor()

    # Cria o schema relacional (idempotente)
    with open(os.path.join("backend", "schema.sql"), "r", encoding="utf-8") as f:
        cur.execute(f.read())
    conn.commit()

    cur.execute("SELECT count(*) FROM rooms")
    n_rooms = cur.fetchone()[0]

    cur.execute("""
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' ORDER BY table_name
    """)
    tables = [r[0] for r in cur.fetchall()]

    print("✅ Conexão OK com o Neon!")
    print(f"   Salas cadastradas: {n_rooms}")
    print(f"   Tabelas no banco: {', '.join(tables)}")

    cur.close()
    conn.close()
except Exception as e:
    print("❌ Erro ao conectar:", e)
    raise SystemExit(1)
