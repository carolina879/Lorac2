#!/usr/bin/env python3
"""
🧪 SCRIPT DE TESTES: Validar sincronização de exercícios
"""

import requests
import json
import sys

API = "http://localhost:8000"

# ============================================
# CORES PARA OUTPUT
# ============================================
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def test(name, fn):
    """Decorator para testes"""
    try:
        fn()
        print(f"{Colors.GREEN}✅ {name}{Colors.RESET}")
        return True
    except AssertionError as e:
        print(f"{Colors.RED}❌ {name}: {e}{Colors.RESET}")
        return False
    except Exception as e:
        print(f"{Colors.RED}❌ {name}: {type(e).__name__}: {e}{Colors.RESET}")
        return False

# ============================================
# TESTES
# ============================================

def teste_backend_online():
    """Verificar se backend está rodando"""
    response = requests.get(f"{API}/")
    assert response.status_code == 200, f"Status: {response.status_code}"

def teste_criar_turma():
    """Criar uma turma para testes"""
    global turma_id, professor_id
    
    # Registrar professor
    prof_response = requests.post(f"{API}/api/auth/register", json={
        "username": f"prof_teste_{int(time.time())}",
        "password": "senha123",
        "role": "professor",
    })
    assert prof_response.status_code == 200, f"Não conseguiu criar professor"
    professor_id = prof_response.json()["user"]["id"]
    
    # Criar turma
    turma_response = requests.post(f"{API}/api/turmas", json={
        "professor_id": professor_id,
        "professor_name": "Prof Teste",
        "name": "Turma de Testes",
        "description": "Turma para validar exercícios",
        "icon": "🧪",
    })
    assert turma_response.status_code == 200, f"Não conseguiu criar turma"
    turma_id = turma_response.json()["turma"]["id"]
    print(f"  → Turma criada: {turma_id}")

def teste_listar_exercicios_vazio():
    """GET lista vazia quando nenhum exercício existe"""
    response = requests.get(f"{API}/api/turmas/{turma_id}/exercicios")
    assert response.status_code == 200, f"Status: {response.status_code}"
    data = response.json()
    assert "exercicios" in data, "Response sem campo 'exercicios'"
    assert isinstance(data["exercicios"], list), "exercicios não é lista"
    assert len(data["exercicios"]) == 0, "Lista deveria estar vazia"

def teste_criar_exercicio():
    """POST criar novo exercício"""
    global exercicio_id
    
    exercicio = {
        "title": "Teste de Múltipla Escolha",
        "description": "Exercício de teste",
        "questions": [
            {
                "tipo": "marcar",
                "enunciado": "Qual é a capital do Brasil?",
                "alternativas": ["São Paulo", "Brasília", "Rio de Janeiro"],
                "correta": 1,
            },
            {
                "tipo": "escrever",
                "enunciado": "Descreva a história do Brasil",
            }
        ]
    }
    
    response = requests.post(
        f"{API}/api/turmas/{turma_id}/exercicios",
        json=exercicio
    )
    assert response.status_code == 200, f"Status: {response.status_code}, Body: {response.text}"
    data = response.json()
    assert data["status"] == "created", f"Status retornado: {data.get('status')}"
    assert "exercicio" in data, "Response sem 'exercicio'"
    exercicio_id = data["exercicio"]["id"]
    print(f"  → Exercício criado: {exercicio_id}")

def teste_listar_exercicios_um():
    """GET retorna exercício recém criado"""
    response = requests.get(f"{API}/api/turmas/{turma_id}/exercicios")
    assert response.status_code == 200
    data = response.json()
    assert len(data["exercicios"]) == 1, f"Esperado 1 exercício, encontrado {len(data['exercicios'])}"
    ex = data["exercicios"][0]
    assert ex["id"] == exercicio_id, f"ID não corresponde"
    assert ex["title"] == "Teste de Múltipla Escolha"

def teste_exercicio_tem_questoes():
    """Verificar estrutura das questões"""
    response = requests.get(f"{API}/api/turmas/{turma_id}/exercicios")
    data = response.json()
    ex = data["exercicios"][0]
    
    assert "questions" in ex or "questoes" in ex, "Sem campo de questões"
    questoes = ex.get("questions") or ex.get("questoes")
    assert len(questoes) == 2, f"Esperado 2 questões, encontrado {len(questoes)}"
    
    # Verificar primeira questão
    q1 = questoes[0]
    assert q1["tipo"] == "marcar", f"Tipo não é 'marcar': {q1.get('tipo')}"
    assert "alternativas" in q1, "Sem alternativas"
    assert q1["correta"] == 1, f"Resposta correta: {q1.get('correta')}"
    
    # Verificar segunda questão
    q2 = questoes[1]
    assert q2["tipo"] == "escrever", f"Tipo não é 'escrever': {q2.get('tipo')}"

def teste_multiplos_exercicios():
    """Criar múltiplos exercícios e verificar listagem"""
    # Criar segundo exercício
    ex2 = {
        "title": "Lista 2",
        "description": "",
        "questions": [{
            "tipo": "marcar",
            "enunciado": "Test",
            "alternativas": ["A", "B"],
            "correta": 0,
        }]
    }
    
    response = requests.post(f"{API}/api/turmas/{turma_id}/exercicios", json=ex2)
    assert response.status_code == 200
    
    # Listar
    response = requests.get(f"{API}/api/turmas/{turma_id}/exercicios")
    data = response.json()
    assert len(data["exercicios"]) >= 2, f"Esperado 2+, encontrado {len(data['exercicios'])}"

def teste_turma_inexistente():
    """GET com turma inválida retorna 404"""
    response = requests.get(f"{API}/api/turmas/turma-inexistente/exercicios")
    assert response.status_code == 404, f"Status: {response.status_code}"

def teste_exercicio_sem_titulo():
    """POST sem título retorna erro"""
    response = requests.post(
        f"{API}/api/turmas/{turma_id}/exercicios",
        json={"title": "", "description": "", "questions": []}
    )
    assert response.status_code == 400, f"Status: {response.status_code}"

# ============================================
# EXECUTAR TESTES
# ============================================

import time

if __name__ == "__main__":
    print(f"{Colors.BLUE}🧪 INICIANDO TESTES DO SISTEMA DE EXERCÍCIOS{Colors.RESET}\n")
    
    turma_id = None
    professor_id = None
    exercicio_id = None
    
    tests = [
        ("Backend está online", teste_backend_online),
        ("Criar turma de teste", teste_criar_turma),
        ("GET lista vazia (initial)", teste_listar_exercicios_vazio),
        ("POST criar exercício", teste_criar_exercicio),
        ("GET retorna exercício criado", teste_listar_exercicios_um),
        ("Exercício tem questões corretas", teste_exercicio_tem_questoes),
        ("Criar múltiplos exercícios", teste_multiplos_exercicios),
        ("GET com turma inexistente = 404", teste_turma_inexistente),
        ("POST sem título = 400", teste_exercicio_sem_titulo),
    ]
    
    passed = 0
    failed = 0
    
    for name, fn in tests:
        if test(name, fn):
            passed += 1
        else:
            failed += 1
    
    print(f"\n{Colors.BLUE}{'='*50}{Colors.RESET}")
    print(f"📊 Resultado: {Colors.GREEN}{passed} aprovado{Colors.RESET}, {Colors.RED}{failed} falhado{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*50}{Colors.RESET}")
    
    sys.exit(0 if failed == 0 else 1)
