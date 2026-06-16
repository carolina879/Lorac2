# Dossiê Técnico: Lorac (StudySync)

Este documento centraliza toda a arquitetura da plataforma Lorac, englobando como os módulos funcionam, vulnerabilidades de segurança identificadas e o diagnóstico completo para deploy, com foco nas restrições de hospedagem (ex: Vercel).

---

## 1. Mapa da Arquitetura e Fluxo de Dados

A aplicação opera através da comunicação em tempo real e de serviços web isolados, dividida nas seguintes camadas:

### Backend (`/backend` e `main.py`)
- **`main.py`**: É o núcleo do servidor (via FastAPI). Responsável por servir os arquivos estáticos do frontend, receber as rotas iniciais e criar as conexões WebSocket (`/ws/...`) onde os usuários de uma sala se encontram.
- **`connection_manager.py`**: Padrão Singleton rudimentar usado no `main.py`. Ele mapeia quais usuários (WebSockets) estão conectados a quais salas, para facilitar o envio em massa (broadcasting) do chat, atualizações de desenho, pins e timer de foco.
- **`database.py` e Memória (`MemoryDatabase`)**: Todo o estado da aplicação (usuários cadastrados, turmas, histórico do chat) está salvo numa classe na memória RAM que periodicamente serializa seus dicionários para arquivos `.json` na pasta `/data`.
- **`ai_routes.py`**: Endpoint separado focado em inteligência artificial, que se comunica com provedores externos (ex: Cohere, Anthropic) para corrigir exercícios abertos e interagir no chat.

### Frontend (`/static`)
- O cliente é composto em HTML/JS/CSS puros sem uso de frameworks reativos como React ou Vue.
- **`static/js/app.js`**: O "monólito" do frontend. Gerencia variáveis de estado (`state`), manipulação pesada de DOM, envio de sinais via WebSocket, autenticação e renderização de views como o ranking e salas de foco.
- **Módulos Independentes**: Outros arquivos (como `viagem-tempo.js`, `astronomia-3d.js`, `quimica-visual.js`) acoplam diretamente à janela global para oferecer simulações específicas baseadas em Three.js.

---

## 2. Falhas de Segurança (Críticas)

Durante a auditoria, foram identificados grandes problemas de segurança no sistema atual que o tornam inapto para produção sem refatoração:

> [!CAUTION]
> **Autenticação Inexistente (Falta de JWT)**
> Quando um usuário faz login, a API simplesmente retorna um objeto JSON e o `app.js` o salva no `localStorage` do navegador. Não há token de verificação. **Risco:** Qualquer usuário pode abrir as ferramentas de desenvolvedor do navegador, forjar um objeto no `localStorage` (ex: com um ID de professor) e o frontend aceitará.

> [!CAUTION]
> **Criptografia Simples nas Senhas**
> As senhas estão sendo armazenadas através de um hash primário do tipo `SHA-256` em texto simples (`hashlib.sha256(password.encode()).hexdigest()`).
> **Risco:** Vulnerável a ataques de dicionário e Rainbow Tables. É necessário o uso de bibliotecas de derivação de chaves como o `bcrypt`.

> [!CAUTION]
> **WebSockets Inseguros e Sem Verificação**
> Para conectar na sala, o WebSocket no cliente manda uma requisição no formato `/ws/{room_id}/{user_id}`. O Backend confia na URL sem questionar e sem validar tokens.
> **Risco:** Uma pessoa pode inspecionar o código de outro aluno, copiar o `user_id` dele, e conectar no WebSocket se passando pelo colega, enviando e apagando dados como se fosse ele.

---

## 3. Bugs e Desafios de Design (Operacionais)

- **Gargalo no Front-end (Monólito):** O arquivo `app.js` acumula toda a lógica (UI, Redes, Lousa Mágica, Chats) e ultrapassa os 280kb de Javascript puro. Qualquer adição gera alta chance de bugs interligados (ex: uma falha no chat derruba o timer de foco).
- **Carga de Script Síncrona:** Arquivos no `index.html` estão rodando sequencialmente, atrasando absurdamente o "First Contentful Paint". A solução envolveria um *bundler* moderno como o Vite.
- **Race Condition em Vários Workers:** O backend usa estruturas em memória local (`MemoryDatabase`). Se um serviço hospedar a aplicação dividindo em 2 ou mais núcleos (Workers Gunicorn/Uvicorn), o Usuário A (Worker 1) não verá as mensagens do Usuário B (Worker 2).

---

## 4. Análise de Hospedagem (O Caso da Vercel)

A migração futura para a Vercel foi considerada e, infelizmente, o código atual **NÃO é compatível**. A Vercel opera exclusivamente em um modelo "Serverless" (Funções sem Servidor), causando 3 quebras catastróficas neste código:

1. **Incompatibilidade com WebSockets Nativos:** As funções da Vercel nascem e morrem a cada requisição (max 10 a 60 segundos). É impossível manter a rota `main.py -> @app.websocket` aberta continuamente. A comunicação em tempo real quebrará completamente.
2. **Perda Imediata de Dados (Data Loss):** A Vercel possui um sistema de arquivos *Efêmero* (ReadOnly). A linha que exporta os dicionários para `data/studysync_data.json` tentará gravar num arquivo vazio cada vez que a instância for recriada. Os logins e cadastros durariam apenas alguns minutos antes de sumirem. 
3. **Múltiplas Instâncias Desconectadas:** Mesmo que salvasse os dados (usando `/tmp`), a arquitetura levantaria dezenas de instâncias frias independentes (os workers não se conhecem).

### Como Resolver para Fazer Deploy?

Para que o Lorac funcione plenamente online, você tem dois caminhos estruturais:

**Opção 1: Migrar a Arquitetura para Nuvem Moderna (Vercel-friendly)**
- Substituir a conexão WebSocket interna do `main.py` por serviços terceiros (Pusher, Socket.io com Redis ou Supabase Realtime).
- Substituir os arquivos JSON locais por um banco de dados hospedado gerenciado (PostgreSQL na Supabase, NeonDB, MongoDB Atlas, Firebase).
- Separar totalmente a pasta `/static` para subir na Vercel, e as rotas python (FastAPI) virarem pequenas Vercel Functions.

**Opção 2: Hospedagem Tradicional (VPS) - Mais Rápido para a Atual Arquitetura**
- Se você não quiser refatorar todo o código, pode subí-lo exatamente como está (talvez só adicionando um banco SQLite/Postgres simples ao invés de JSON) hospedando o servidor Python em plataformas como **Render, Railway ou Fly.io**. Elas suportam WebSockets sem restrições de tempo e mantêm o servidor ligado 24h.
