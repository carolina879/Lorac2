
import os
import json
import re
import logging
from typing import Optional

import cohere
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

COHERE_API_KEY = os.environ.get("COHERE_API_KEY", "CtRMHfhyApjmfsurnj5DMPrdgCPbo5Ya13oU4i7g")
client = cohere.Client(api_key=COHERE_API_KEY)
MODEL = "command-r-08-2024"

router = APIRouter(prefix="/api/ai", tags=["IA"])



class ChatRequest(BaseModel):
    message: str = Field(..., description="Mensagem do usuário")
    context: Optional[str] = Field(None, description="System prompt opcional")


class ChatResponse(BaseModel):
    response: str


class CorrigirRequest(BaseModel):
    enunciado: str = Field(..., description="Texto da questão dissertativa")
    resposta_aluno: str = Field(..., description="Resposta escrita pelo aluno")
    valor_maximo: float = Field(10.0, description="Nota máxima configurada pelo professor")
    criterios: Optional[str] = Field(
        None,
        description="Critérios de correção opcionais definidos pelo professor"
    )


class CorrigirResponse(BaseModel):
    nota_sugerida: float
    feedback: str
    pontos_positivos: list[str]
    pontos_melhorar: list[str]
    aviso_professor: str


class GerarQuestoesRequest(BaseModel):
    tema_ou_texto: str = Field(..., description="Tema, texto-base ou trecho para geração")
    tipo: str = Field("marcar", description="'marcar' (múltipla escolha) ou 'escrever' (dissertativa)")
    quantidade: int = Field(3, ge=1, le=10, description="Número de questões a gerar")
    nivel: Optional[str] = Field(
        "médio",
        description="Nível de dificuldade: 'fácil', 'médio' ou 'difícil'"
    )


class AlternativaGerada(BaseModel):
    texto: str
    correta: bool


class QuestaoGerada(BaseModel):
    enunciado: str
    tipo: str
    alternativas: Optional[list[str]] = None
    correta: Optional[int] = None 
    gabarito_comentado: Optional[str] = None 

class GerarQuestoesResponse(BaseModel):
    questoes: list[QuestaoGerada]


def _extract_json(text: str) -> str:
    """Extrai JSON de forma robusta."""
    try:
        clean = re.sub(r"```(?:json)?", "", text).strip()
        for pattern in (r"\{[\s\S]*\}", r"\[[\s\S]*\]"):
            match = re.search(pattern, clean)
            if match:
                return match.group(0)
        return clean
    except:
        return text


def _call_cohere(system: str, user: str, max_tokens: int = 2048) -> str:
    
    response = client.chat(
        model=MODEL,
        max_tokens=max_tokens,
        preamble=system,
        message=user,
    )
    return response.text




@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
   
    system_prompt = req.context or "Você é um assistente educacional útil e preciso."
    try:
        text = _call_cohere(system_prompt, req.message, max_tokens=1500)
        return ChatResponse(response=text)
    except Exception as e:
        logger.exception("Unexpected error in /chat")
        raise HTTPException(status_code=500, detail=str(e))



CORRIGIR_SYSTEM = """Você é um professor experiente e empático que corrige questões dissertativas.
Sua tarefa é analisar a resposta de um aluno e:
  1. Sugerir uma nota justa (0 até o valor máximo estipulado)
  2. Escrever um feedback detalhado e construtivo
  3. Listar pontos positivos da resposta
  4. Listar pontos que podem ser melhorados

Seja sempre respeitoso, encorajador e pedagógico. O professor revisará e poderá ajustar sua sugestão.

Responda SOMENTE com um objeto JSON válido, sem texto antes ou depois, no seguinte formato:
{
  "nota_sugerida": <número entre 0 e valor_maximo>,
  "feedback": "<parágrafo de feedback geral>",
  "pontos_positivos": ["<ponto 1>", "<ponto 2>"],
  "pontos_melhorar": ["<ponto 1>", "<ponto 2>"],
  "aviso_professor": "<nota interna para o professor revisar, se necessário>"
}"""


@router.post("/corrigir", response_model=CorrigirResponse)
async def corrigir_dissertativa(req: CorrigirRequest):

    criterios_txt = f"\nCritérios de correção definidos pelo professor:\n{req.criterios}" \
        if req.criterios else ""

    user_msg = f"""Questão: {req.enunciado}

Resposta do aluno:
\"\"\"{req.resposta_aluno}\"\"\"

Valor máximo da questão: {req.valor_maximo} pontos{criterios_txt}

Analise a resposta e retorne o JSON de correção."""

    try:
        raw = _call_cohere(CORRIGIR_SYSTEM, user_msg, max_tokens=1200)
        data = json.loads(_extract_json(raw))

       
        nota = float(data.get("nota_sugerida", 0))
        nota = max(0.0, min(nota, req.valor_maximo))

        return CorrigirResponse(
            nota_sugerida=round(nota, 1),
            feedback=data.get("feedback", ""),
            pontos_positivos=data.get("pontos_positivos", []),
            pontos_melhorar=data.get("pontos_melhorar", []),
            aviso_professor=data.get("aviso_professor", "Verifique a sugestão antes de publicar."),
        )
    except json.JSONDecodeError as e:
        logger.error("JSON parse error in /corrigir: %s — raw: %s", e, raw)
        raise HTTPException(status_code=502, detail="A IA retornou um formato inesperado. Tente novamente.")
    except Exception as e:
        logger.exception("Unexpected error in /corrigir")
        raise HTTPException(status_code=500, detail=str(e))


GERAR_SYSTEM = """Você é um professor experiente que cria questões de qualidade para exercícios escolares.
Crie questões claras, precisas, pedagogicamente relevantes e bem formuladas.

Responda SOMENTE com um array JSON válido, sem texto antes ou depois, seguindo este formato:

Para questões de múltipla escolha (tipo "marcar"):
[
  {
    "enunciado": "<texto da questão>",
    "tipo": "marcar",
    "alternativas": ["<opção A>", "<opção B>", "<opção C>", "<opção D>"],
    "correta": <índice 0-3 da alternativa correta>,
    "gabarito_comentado": "<breve explicação do por quê a alternativa está correta>"
  }
]

Para questões dissertativas (tipo "escrever"):
[
  {
    "enunciado": "<texto da questão>",
    "tipo": "escrever",
    "gabarito_comentado": "<elementos esperados em uma resposta completa>"
  }
]"""


@router.post("/gerar-questoes", response_model=GerarQuestoesResponse)
async def gerar_questoes(req: GerarQuestoesRequest):
    """
    Gera questões automaticamente com base em tema ou texto fornecido pelo professor.
    """
    tipo_desc = (
        "múltipla escolha com 4 alternativas, indicando a correta (índice 0-3)"
        if req.tipo == "marcar"
        else "dissertativas abertas com gabarito comentado"
    )

    user_msg = f"""Gere {req.quantidade} questões {tipo_desc} sobre o seguinte tema/texto:

---
{req.tema_ou_texto}
---

Nível de dificuldade: {req.nivel}
Tipo das questões: {req.tipo}

Gere exatamente {req.quantidade} questões no formato JSON solicitado."""

    try:
        raw = _call_cohere(GERAR_SYSTEM, user_msg, max_tokens=2500)
        data = json.loads(_extract_json(raw))

        if not isinstance(data, list):
            raise ValueError("Resposta não é uma lista de questões.")

        questoes = []
        for item in data:
            q = QuestaoGerada(
                enunciado=item.get("enunciado", ""),
                tipo=item.get("tipo", req.tipo),
                alternativas=item.get("alternativas"),
                correta=item.get("correta"),
                gabarito_comentado=item.get("gabarito_comentado"),
            )
            questoes.append(q)

        return GerarQuestoesResponse(questoes=questoes)

    except (json.JSONDecodeError, ValueError) as e:
        logger.error("Parse error in /gerar-questoes: %s — raw: %s", e, raw)
        raise HTTPException(status_code=502, detail="A IA retornou um formato inesperado. Tente novamente.")
    except Exception as e:
        logger.exception("Unexpected error in /gerar-questoes")
        raise HTTPException(status_code=500, detail=str(e))
