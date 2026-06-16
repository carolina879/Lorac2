# StudySync — Integração de IA: Guia de Implementação

## Visão Geral

Dois arquivos novos implementam a integração completa com a API da Anthropic:

| Arquivo | Onde vai | Função |
|---|---|---|
| `ai_routes.py` | Backend (FastAPI) | 3 endpoints de IA |
| `ferramentas-ia-correcao.js` | Frontend (static/) | Lógica JS de correção e geração |

---

## 1. Backend — `ai_routes.py`

### Configuração

**Instalar dependência:**
```bash
pip install anthropic>=0.30.0
```

**Variável de ambiente obrigatória:**
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

**Registrar no `main.py`:**
```python
from ai_routes import router as ai_router
app.include_router(ai_router)
```

### Endpoints

#### `POST /api/ai/corrigir`
Correção automática de questão dissertativa.

**Request:**
```json
{
  "enunciado": "Explique as causas da Primeira Guerra Mundial.",
  "resposta_aluno": "A guerra começou por causa do assassinato...",
  "valor_maximo": 10.0,
  "criterios": "Espera-se mencionar o nacionalismo, imperialismo e a corrida armamentista."
}
```

**Response:**
```json
{
  "nota_sugerida": 7.5,
  "feedback": "Sua resposta demonstra compreensão...",
  "pontos_positivos": ["Mencionou o estopim do assassinato", "Conectou à tensão europeia"],
  "pontos_melhorar": ["Não abordou o imperialismo", "Faltou mencionar as alianças"],
  "aviso_professor": "Resposta parcialmente correta. Verifique se o aluno precisa de reforço em geopolítica."
}
```

#### `POST /api/ai/gerar-questoes`
Geração de questões por tema ou texto.

**Request:**
```json
{
  "tema_ou_texto": "Leis de Newton e aplicações no cotidiano",
  "tipo": "marcar",
  "quantidade": 3,
  "nivel": "médio"
}
```

**Response:**
```json
{
  "questoes": [
    {
      "enunciado": "Um carro freia bruscamente. Os passageiros...",
      "tipo": "marcar",
      "alternativas": ["São lançados para frente", "São lançados para trás", "Não se movem", "Saem pela janela"],
      "correta": 0,
      "gabarito_comentado": "Pela 1ª Lei de Newton (inércia), os corpos tendem a manter seu estado de movimento..."
    }
  ]
}
```

#### `POST /api/ai/chat`
Mantido para compatibilidade com o código legado do `exercicio-system.js`.

---

## 2. Frontend — `ferramentas-ia-correcao.js`

### Adicionar ao `index.html`
```html
<!-- Adicionar APÓS o exercicio-system.js -->
<script src="/static/ferramentas-ia-correcao.js?v=1"></script>
```

### Correção IA na tela do professor

No `exercicio-system.js`, dentro da função que renderiza o formulário de correção de cada questão dissertativa, adicione o container e chame o render:

```javascript
// Dentro do HTML do formulário de correção (na questão dissertativa):
// 1. Adicionar um container para o botão IA:
`<div id="ex-ia-btn-${safeId}-${qi}"></div>`

// 2. Após inserir o HTML no DOM:
AICorrecao.renderBotaoCorrecaoIA(turmaId, exId, userId, qi);
```

**O fluxo completo para o professor:**
1. Abre a lista de resultados de um exercício
2. Ao ver uma questão dissertativa, clica em **"Sugestão IA"**
3. A IA analisa enunciado + resposta e preenche nota e feedback automaticamente
4. Um aviso amarelo aparece: *"Esta é uma sugestão — você tem a palavra final"*
5. O professor revisa/edita e clica em **"Salvar Correção"** para confirmar

### Gerador de questões aprimorado

O arquivo sobrescreve automaticamente `window._gerarQuestoesIA` com a versão aprimorada. Para ativar o seletor de dificuldade, chame após o modal estar no DOM:

```javascript
// No openCreateExercicio(), após o modal ser inserido:
AICorrecao.injetarSeletorNivel();
```

---

## 3. Critérios de Correção por Questão (opcional)

Para questões dissertativas onde o professor quer guiar a IA, adicione um campo `criterios` ao criar a questão. No `exercicio-system.js`, na renderização do editor de questão dissertativa, adicione:

```html
<div class="ex-field" style="margin-top:8px;">
  <label style="font-size:11px;color:var(--text-2);">
    Critérios de correção para a IA (opcional)
  </label>
  <textarea class="ex-textarea" rows="2" placeholder="Ex: Espera-se que o aluno mencione X, Y e Z..."
    oninput="ExSys._updateCriterios(${idx}, this.value)"></textarea>
</div>
```

E adicionar a função no `ExSys`:
```javascript
function _updateCriterios(idx, val) {
  if (window._exQuestoes?.[idx]) window._exQuestoes[idx].criterios = val;
}
```

---

## 4. Diagrama de Fluxo

```
PROFESSOR                     FRONTEND                    BACKEND (FastAPI)          ANTHROPIC
    │                             │                              │                        │
    │ Clica "Sugestão IA"         │                              │                        │
    │────────────────────────────>│                              │                        │
    │                             │ POST /api/ai/corrigir        │                        │
    │                             │─────────────────────────────>│                        │
    │                             │                              │ client.messages.create │
    │                             │                              │───────────────────────>│
    │                             │                              │    claude-sonnet-4     │
    │                             │                              │<───────────────────────│
    │                             │ { nota, feedback, ... }      │                        │
    │                             │<─────────────────────────────│                        │
    │ Nota e feedback preenchidos │                              │                        │
    │<────────────────────────────│                              │                        │
    │ Revisa e clica "Salvar"     │                              │                        │
    │────────────────────────────>│                              │                        │
    │                             │ (salva localmente/backend)   │                        │
```

---

## 5. Considerações de Segurança e Custo

- **Rate limiting:** Considere adicionar um limite por usuário (ex: 20 chamadas/hora) para controlar custos. Use Redis ou um contador em memória no FastAPI.
- **A IA nunca salva sozinha:** A nota sugerida só é persistida quando o professor confirma. Isso é intencional — o professor tem sempre a palavra final.
- **Logs:** As chamadas à API são logadas com `logger.error` em caso de falha. Adicione um logger de auditoria para rastrear uso por turma/professor se necessário.
- **Prompt injection:** As respostas dos alunos são inseridas entre aspas triplas nos prompts, mitigando ataques de injeção de prompt.
