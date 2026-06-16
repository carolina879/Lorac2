

const DebateIA = (() => {
    const MODAL_ID = 'modal-debate-ia';

   
    let _state = {
        fase: 'escolha',         
        tema: null,               
        ladoAluno: null,          
        ladoIA: null,          
        turno: 'aluno',           
        rodada: 0,
        maxRodadas: 4,
        historico: [],          
        pontuacao: {
            clareza: 0, evidencias: 0, logica: 0, rebatimento: 0, total: 0
        },
        enviando: false,
        timerEval: null
    };

   
    const TEMAS = [
        {
            id: 'energia-nuclear',
            titulo: 'Energia Nuclear',
            emoji: '⚛️',
            categoria: 'Ciências / Meio Ambiente',
            cor: '#60a5fa',
            descricao: 'O Brasil deve expandir sua matriz energética com usinas nucleares?',
            argPro: ['Baixíssima emissão de carbono', 'Alta densidade energética', 'Geração contínua (independe do clima)', 'Reduz dependência de hidrelétricas'],
            argContra: ['Risco de acidentes catastróficos (Chernobyl, Fukushima)', 'Resíduos radioativos sem solução definitiva', 'Custo elevado de construção', 'Proliferação nuclear e riscos geopolíticos'],
            dados: ['A França gera ~70% de sua eletricidade via energia nuclear.', 'Angra 1 e 2 respondem por ~3% da energia elétrica do Brasil.', 'Um acidente como Chernobyl gerou área de exclusão de 2.600 km².']
        },
        {
            id: 'aborto',
            titulo: 'Legalização do Aborto',
            emoji: '⚖️',
            categoria: 'Ética / Direitos Humanos',
            cor: '#f472b6',
            descricao: 'O aborto deve ser legalizado e descriminalizado no Brasil?',
            argPro: ['Direito sobre o próprio corpo', 'Reduz abortos clandestinos inseguros', 'Casos de estupro e risco de vida já são permitidos', 'Questão de saúde pública'],
            argContra: ['Vida começa na concepção (ético/religioso)', 'Adoção como alternativa', 'Possível banalização', 'Proteção ao ser mais vulnerável'],
            dados: ['Estima-se 1 milhão de abortos clandestinos por ano no Brasil.', 'Países com aborto legal não necessariamente têm taxas mais altas.', 'O STF discute a descriminalização até 12 semanas de gestação.']
        },
        {
            id: 'reforma-agraria',
            titulo: 'Reforma Agrária',
            emoji: '🌾',
            categoria: 'Política / Economia',
            cor: '#4ade80',
            descricao: 'O Brasil precisa de uma ampla reforma agrária redistributiva?',
            argPro: ['Redução da concentração fundiária histórica (Gini 0,87)', 'Segurança alimentar e produção familiar', 'Redução das desigualdades regionais', 'Função social da terra prevista na Constituição'],
            argContra: ['O agronegócio é motor do PIB (25%) e das exportações', 'Insegurança jurídica afasta investimentos', 'Assentamentos têm baixa produtividade', 'Foco deve ser em crédito e tecnologia, não redistribuição'],
            dados: ['1% dos proprietários detêm ~50% das terras agrícolas no Brasil.', 'O agro representou 24,8% do PIB brasileiro em 2023.', 'Existem mais de 5 mil conflitos agrários registrados por ano.']
        },
        {
            id: 'renda-basica',
            titulo: 'Renda Básica Universal',
            emoji: '💵',
            categoria: 'Economia / Política Social',
            cor: '#fbbf24',
            descricao: 'O governo deve implementar uma Renda Básica Universal para todos os cidadãos?',
            argPro: ['Elimina a pobreza extrema de forma direta', 'Reduz burocracia de programas assistenciais', 'Dá liberdade para escolhas educacionais e profissionais', 'Experimentos (Finlândia, Quênia) mostram resultados positivos'],
            argContra: ['Custo fiscal insustentável sem reformas tributárias profundas', 'Pode desincentivar o trabalho', 'Inflação se não houver contrapartida produtiva', 'Recursos deveriam ir a quem mais precisa (focalização)'],
            dados: ['O Bolsa Família atende ~21 milhões de famílias com custo de ~0,5% do PIB.', 'Uma RBU de R$1.000/mês para 215 mi de brasileiros custaria R$2,58 trilhões/ano.', 'O experimento finlandês não reduziu a empregabilidade, mas aumentou bem-estar.']
        },
        {
            id: 'pena-morte',
            titulo: 'Pena de Morte',
            emoji: '⚰️',
            categoria: 'Ética / Segurança Pública',
            cor: '#f87171',
            descricao: 'A pena de morte deveria ser adotada para crimes hediondos no Brasil?',
            argPro: ['Caráter dissuasório para crimes graves', 'Elimina risco de reincidência', 'Reduz custo do sistema penitenciário', 'Retribuição justa às vítimas'],
            argContra: ['Risco de execução de inocentes é irreversível', 'Estudos mostram que não reduz a criminalidade', 'Viola direitos humanos fundamentais', 'Constituição de 1988 a proíbe exceto em guerra declarada'],
            dados: ['Desde 1973, mais de 190 pessoas foram exoneradas no corredor da morte nos EUA.', 'O homicídio doloso não diminuiu nos EUA após retomada da pena capital.', 'O custo de um processo até pena de morte nos EUA é 3x maior que prisão perpétua.']
        },
        {
            id: 'privatizacao',
            titulo: 'Privatização de Estatais',
            emoji: '🏭',
            categoria: 'Economia',
            cor: '#a78bfa',
            descricao: 'O Estado brasileiro deve privatizar empresas como Petrobras, Correios e bancos públicos?',
            argPro: ['Maior eficiência e competitividade', 'Reduz déficit público e dívida', 'Atrai investimento privado e tecnologia', 'Evita interferência política nas empresas'],
            argContra: ['Perda de controle sobre setores estratégicos', 'Empresas rentáveis financiam políticas públicas', 'Risco de monopólio privado em serviços essenciais', 'Prejuízo ao trabalhador e ao consumidor'],
            dados: ['A Petrobras lucrou R$124 bilhões em 2022, repassando dividendos ao governo.', 'A Eletrobras foi privatizada em 2022 arrecadando R$33,7 bilhões.', 'Países com alto IDH têm tanto modelos privatizados quanto estatizados.']
        },
        {
            id: 'maconha',
            titulo: 'Legalização da Maconha',
            emoji: '🌿',
            categoria: 'Saúde Pública / Política Criminal',
            cor: '#34d399',
            descricao: 'O Brasil deve legalizar a maconha para uso recreativo e medicinal?',
            argPro: ['Reduz poder do tráfico de drogas', 'Arrecadação de impostos (US$10 bi/ano nos EUA)', 'Desafoga o sistema penal', 'Uso medicinal já comprovado (epilepsia, dor crônica)'],
            argContra: ['Uso recreativo amplia acesso, especialmente entre jovens', 'Potencial de dependência e danos cognitivos', 'Pode ser porta de entrada para outras drogas', 'Legislação internacional e pressão social contrária'],
            dados: ['30 estados americanos legalizaram uso medicinal; 21 estados o uso recreativo.', 'O Uruguay foi o 1º país a legalizar integralmente a maconha (2013).', 'Estudos indicam uso regular antes dos 18 anos associado a danos cognitivos.']
        },
        {
            id: 'cotas-raciais',
            titulo: 'Cotas Raciais',
            emoji: '🎓',
            categoria: 'Educação / Políticas Afirmativas',
            cor: '#fb923c',
            descricao: 'As cotas raciais em universidades e concursos públicos são necessárias e justas?',
            argPro: ['Corrigem séculos de exclusão histórica', 'Aumentaram em 465% o número de negros nas universidades federais', 'Diversidade melhora o ambiente acadêmico', 'Aprovadas pelo STF como constitucionais'],
            argContra: ['Critério deve ser socioeconômico, não racial', 'Dificuldade de classificação racial no Brasil', 'Meritocracia é base do acesso ao ensino superior', 'Podem gerar estigma e divisão racial'],
            dados: ['Negros são 56% da população mas apenas 28% dos universitários.', 'A lei de cotas (12.711/2012) reserva 50% das vagas federais a escolas públicas.', 'STF reafirmou a constitucionalidade das cotas em 2012 e 2023.']
        }
    ];

    function abrir() {
        document.getElementById(MODAL_ID)?.remove();
        _injectStyles();
        _resetState();

        const modal = document.createElement('div');
        modal.id = MODAL_ID;
        modal.className = 'dbt-overlay';
        modal.innerHTML = `
            <div class="dbt-box" id="dbt-box">
                <div class="dbt-header">
                    <div class="dbt-header-left">
                        <div class="dbt-header-icon">⚔️</div>
                        <div>
                            <h2 class="dbt-header-title">Debate com IA</h2>
                            <p class="dbt-header-sub">Desenvolva argumentação crítica · Seja avaliado pela qualidade, não pela opinião</p>
                        </div>
                    </div>
                    <div class="dbt-header-right">
                        <div class="dbt-phase-badge" id="dbt-phase-badge">Escolha o Tema</div>
                        <button class="dbt-close-btn" onclick="DebateIA.fechar()" title="Fechar">✕</button>
                    </div>
                </div>
                <div class="dbt-body" id="dbt-body"></div>
            </div>
        `;
        document.body.appendChild(modal);
        _renderEscolha();
    }

    function fechar() {
        clearTimeout(_state.timerEval);
        document.getElementById(MODAL_ID)?.remove();
    }

    function _resetState() {
        _state = {
            fase: 'escolha',
            tema: null,
            ladoAluno: null,
            ladoIA: null,
            turno: 'aluno',
            rodada: 0,
            maxRodadas: 4,
            historico: [],
            pontuacao: { clareza: 0, evidencias: 0, logica: 0, rebatimento: 0, total: 0 },
            enviando: false,
            timerEval: null
        };
    }

   
    function _renderEscolha() {
        _state.fase = 'escolha';
        _setPhaseBadge('Escolha o Tema');
        const body = document.getElementById('dbt-body');
        if (!body) return;

        body.innerHTML = `
            <div class="dbt-escolha-wrap">
                <div class="dbt-escolha-intro">
                    <div class="dbt-intro-icon">🧠</div>
                    <h3>Como funciona o Debate com IA?</h3>
                    <p>Você escolhe um tema, define sua posição, e a IA assume o lado oposto. Após ${_state.maxRodadas} rodadas de debate, você recebe uma avaliação detalhada da <strong>qualidade dos seus argumentos</strong> — independente da sua opinião.</p>
                    <div class="dbt-intro-steps">
                        <div class="dbt-step"><span class="dbt-step-num">1</span><span>Escolha um tema controverso</span></div>
                        <div class="dbt-step"><span class="dbt-step-num">2</span><span>Defina sua posição (Favor ou Contra)</span></div>
                        <div class="dbt-step"><span class="dbt-step-num">3</span><span>Debate em ${_state.maxRodadas} rodadas com a IA</span></div>
                        <div class="dbt-step"><span class="dbt-step-num">4</span><span>Receba avaliação: Clareza · Evidências · Lógica · Rebatimento</span></div>
                    </div>
                </div>

                <div class="dbt-temas-header">
                    <h4>Escolha um tema para debater:</h4>
                    <div class="dbt-temas-filtro">
                        <input type="text" id="dbt-search-tema" placeholder="🔍 Buscar tema..." oninput="DebateIA._filtrarTemas(this.value)" />
                    </div>
                </div>

                <div class="dbt-temas-grid" id="dbt-temas-grid">
                    ${TEMAS.map(t => `
                        <button class="dbt-tema-card" onclick="DebateIA._selecionarTema('${t.id}')" style="--tema-cor:${t.cor}">
                            <div class="dbt-tema-emoji">${t.emoji}</div>
                            <div class="dbt-tema-info">
                                <div class="dbt-tema-cat">${t.categoria}</div>
                                <div class="dbt-tema-titulo">${t.titulo}</div>
                                <div class="dbt-tema-desc">${t.descricao}</div>
                            </div>
                            <div class="dbt-tema-arrow">→</div>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    function _filtrarTemas(q) {
        const grid = document.getElementById('dbt-temas-grid');
        if (!grid) return;
        const lower = q.toLowerCase();
        const filtrados = TEMAS.filter(t =>
            t.titulo.toLowerCase().includes(lower) ||
            t.categoria.toLowerCase().includes(lower) ||
            t.descricao.toLowerCase().includes(lower)
        );
        grid.innerHTML = filtrados.length
            ? filtrados.map(t => `
                <button class="dbt-tema-card" onclick="DebateIA._selecionarTema('${t.id}')" style="--tema-cor:${t.cor}">
                    <div class="dbt-tema-emoji">${t.emoji}</div>
                    <div class="dbt-tema-info">
                        <div class="dbt-tema-cat">${t.categoria}</div>
                        <div class="dbt-tema-titulo">${t.titulo}</div>
                        <div class="dbt-tema-desc">${t.descricao}</div>
                    </div>
                    <div class="dbt-tema-arrow">→</div>
                </button>
            `).join('')
            : '<div class="dbt-empty">Nenhum tema encontrado. <button onclick="DebateIA._renderEscolha()">Ver todos</button></div>';
    }


    function _selecionarTema(id) {
        const tema = TEMAS.find(t => t.id === id);
        if (!tema) return;
        _state.tema = tema;
        _state.fase = 'preparacao';
        _setPhaseBadge('Escolha seu Lado');
        const body = document.getElementById('dbt-body');
        if (!body) return;

        body.innerHTML = `
            <div class="dbt-prep-wrap">
                <button class="dbt-back-btn" onclick="DebateIA._renderEscolha()">← Voltar aos temas</button>

                <div class="dbt-tema-banner" style="--tema-cor:${tema.cor}">
                    <div class="dbt-banner-emoji">${tema.emoji}</div>
                    <div>
                        <div class="dbt-banner-cat">${tema.categoria}</div>
                        <h3 class="dbt-banner-titulo">${tema.titulo}</h3>
                        <p class="dbt-banner-desc">${tema.descricao}</p>
                    </div>
                </div>

                <div class="dbt-dados-section">
                    <div class="dbt-dados-label">📊 Dados e contexto relevantes</div>
                    <div class="dbt-dados-list">
                        ${tema.dados.map(d => `<div class="dbt-dado-item">📌 ${d}</div>`).join('')}
                    </div>
                </div>

                <div class="dbt-lado-section">
                    <h4>Qual posição você defende?</h4>
                    <p class="dbt-lado-hint">A IA assumirá automaticamente o lado oposto e debaterá com argumentos sólidos e dados reais.</p>

                    <div class="dbt-lados-grid">
                        <button class="dbt-lado-card dbt-lado-pro" onclick="DebateIA._confirmarLado('pro')" style="--tema-cor:${tema.cor}">
                            <div class="dbt-lado-icon">👍</div>
                            <div class="dbt-lado-label">A FAVOR</div>
                            <div class="dbt-lado-titulo">"${tema.titulo} — Sim"</div>
                            <div class="dbt-lado-args">
                                ${tema.argPro.slice(0,3).map(a => `<div class="dbt-lado-arg">✓ ${a}</div>`).join('')}
                                <div class="dbt-lado-more">+${tema.argPro.length - 3} mais argumentos</div>
                            </div>
                        </button>

                        <div class="dbt-vs-badge">VS</div>

                        <button class="dbt-lado-card dbt-lado-contra" onclick="DebateIA._confirmarLado('contra')">
                            <div class="dbt-lado-icon">👎</div>
                            <div class="dbt-lado-label">CONTRA</div>
                            <div class="dbt-lado-titulo">"${tema.titulo} — Não"</div>
                            <div class="dbt-lado-args">
                                ${tema.argContra.slice(0,3).map(a => `<div class="dbt-lado-arg">✓ ${a}</div>`).join('')}
                                <div class="dbt-lado-more">+${tema.argContra.length - 3} mais argumentos</div>
                            </div>
                        </button>
                    </div>
                </div>

                <div class="dbt-regras">
                    <span class="dbt-regras-icon">📋</span>
                    <span>Serão <strong>${_state.maxRodadas} rodadas</strong>. Apresente argumentos claros, use dados quando possível, e contra-argumente os pontos da IA. Você será avaliado pela qualidade argumentativa, não pela sua posição.</span>
                </div>
            </div>
        `;
    }

    function _confirmarLado(lado) {
        _state.ladoAluno = lado;
        _state.ladoIA    = lado === 'pro' ? 'contra' : 'pro';
        _iniciarDebate();
    }


    async function _iniciarDebate() {
        _state.fase  = 'debate';
        _state.rodada = 0;
        _state.historico = [];
        _setPhaseBadge(`Debate: Rodada 1/${_state.maxRodadas}`);

        const body = document.getElementById('dbt-body');
        if (!body) return;

        const ladoAlunoBadge   = _state.ladoAluno === 'pro'    ? '👍 A Favor' : '👎 Contra';
        const ladoIABadge      = _state.ladoIA    === 'pro'    ? '👍 A Favor' : '👎 Contra';
        const corAluno         = _state.ladoAluno === 'pro'    ? '#4ade80' : '#f87171';
        const corIA            = _state.ladoAluno === 'pro'    ? '#f87171' : '#4ade80';
        const tema             = _state.tema;

        body.innerHTML = `
            <div class="dbt-arena">
                <!-- Cabeçalho do debate -->
                <div class="dbt-arena-header">
                    <div class="dbt-combatente dbt-combatente-aluno" style="--lado-cor:${corAluno}">
                        <div class="dbt-comb-avatar">🧑‍🎓</div>
                        <div class="dbt-comb-info">
                            <div class="dbt-comb-nome">Você</div>
                            <div class="dbt-comb-lado" style="color:${corAluno}">${ladoAlunoBadge}</div>
                        </div>
                    </div>

                    <div class="dbt-arena-center">
                        <div class="dbt-tema-chip">${tema.emoji} ${tema.titulo}</div>
                        <div class="dbt-rodada-badge" id="dbt-rodada-badge">Rodada <span id="dbt-rodada-num">1</span> / ${_state.maxRodadas}</div>
                        <div class="dbt-progress-bar">
                            <div class="dbt-progress-fill" id="dbt-progress-fill" style="width:${100/_state.maxRodadas}%"></div>
                        </div>
                    </div>

                    <div class="dbt-combatente dbt-combatente-ia" style="--lado-cor:${corIA}">
                        <div class="dbt-comb-avatar">🤖</div>
                        <div class="dbt-comb-info">
                            <div class="dbt-comb-nome">IA Adversária</div>
                            <div class="dbt-comb-lado" style="color:${corIA}">${ladoIABadge}</div>
                        </div>
                    </div>
                </div>

                <!-- Feed de mensagens -->
                <div class="dbt-chat" id="dbt-chat">
                    <div class="dbt-chat-start">
                        <span>⚔️ Debate iniciado! Apresente seu argumento inicial para <strong>${tema.titulo}</strong>.</span>
                    </div>
                </div>

                <!-- Dicas de argumentação -->
                <div class="dbt-dicas-strip" id="dbt-dicas-strip">
                    <span class="dbt-dica-label">💡 Dica:</span>
                    <span id="dbt-dica-texto">Use dados concretos para fortalecer seus argumentos. Ex: cite estudos, estatísticas ou exemplos históricos.</span>
                </div>

                <!-- Input do aluno -->
                <div class="dbt-input-area" id="dbt-input-area">
                    <div class="dbt-input-wrap">
                        <textarea
                            id="dbt-input"
                            class="dbt-textarea"
                            placeholder="Digite seu argumento... (Shift+Enter para nova linha, Enter para enviar)"
                            rows="3"
                            onkeydown="DebateIA._handleKey(event)"
                        ></textarea>
                        <div class="dbt-input-actions">
                            <div class="dbt-char-count" id="dbt-char-count">0 / 500 caracteres</div>
                            <button class="dbt-send-btn" id="dbt-send-btn" onclick="DebateIA._enviarArgumento()">
                                <span>Enviar Argumento</span>
                                <span class="dbt-send-icon">→</span>
                            </button>
                        </div>
                    </div>
                    <div class="dbt-starter-chips" id="dbt-starters">
                        <div class="dbt-starters-label">Iniciar com:</div>
                        ${_getStarterChips().map(c => `<button class="dbt-chip" onclick="DebateIA._usarChip('${c.replace(/'/g,"\\'")}')"> ${c}</button>`).join('')}
                    </div>
                </div>
            </div>
        `;

      
        const inp = document.getElementById('dbt-input');
        if (inp) {
            inp.addEventListener('input', () => {
                const n = inp.value.length;
                const el = document.getElementById('dbt-char-count');
                if (el) {
                    el.textContent = `${n} / 500 caracteres`;
                    el.style.color = n > 450 ? '#f87171' : 'rgba(255,255,255,0.3)';
                }
            });
        }

        await _iaAbreDebate();
    }

    async function _iaAbreDebate() {
        const tema = _state.tema;
        const ladoIA = _state.ladoIA;
        const sistema = _buildSystemPrompt(true);

        const abertura = `Estamos iniciando um debate sobre "${tema.titulo}". Você está defendendo a posição ${ladoIA === 'pro' ? 'A FAVOR' : 'CONTRA'}. Faça uma breve saudação ao debatedor adversário (o aluno) e apresente seu argumento de abertura mais forte, com dados. Seja contundente, mas respeitoso. Máximo 3 parágrafos curtos.`;

        _mostrarTypingIA();

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: abertura, context: sistema })
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            const reply = (data.response || '').trim();

            _state.historico.push({ role: 'ia', content: reply });
            _removerTypingIA();
            _adicionarMensagemIA(reply);
            _updateDica('abertura');
        } catch {
            _removerTypingIA();
            _adicionarMensagemIA('Estou pronto para debater. Apresente seu argumento inicial!');
        }
    }

    function _handleKey(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            _enviarArgumento();
        }
    }

    async function _enviarArgumento() {
        if (_state.enviando) return;
        const inp = document.getElementById('dbt-input');
        if (!inp) return;
        const texto = inp.value.trim();
        if (!texto || texto.length < 10) {
            _shakeElement('dbt-input');
            return;
        }
        if (texto.length > 500) {
            _shakeElement('dbt-input');
            return;
        }

        _state.enviando = true;
        _state.rodada++;
        inp.value = '';
        document.getElementById('dbt-char-count').textContent = '0 / 500 caracteres';

      
        const starters = document.getElementById('dbt-starters');
        if (starters) starters.style.display = 'none';

    
        _adicionarMensagemAluno(texto);
        _state.historico.push({ role: 'aluno', content: texto });

        
        _updateProgress();

      
        _setInputEnabled(false);

       
        if (_state.rodada >= _state.maxRodadas) {
           
            await _iaRespondeUltima(texto);
            await _iniciarAvaliacao();
            return;
        }

        _mostrarTypingIA();
        try {
            const sistemaPrompt = _buildSystemPrompt(false);
            const historicoTexto = _buildHistoricoTexto();
            const mensagem = `${historicoTexto}\n\nNovo argumento do aluno (Rodada ${_state.rodada}): "${texto}"\n\nResponda com um contra-argumento forte e apresente seu argumento para a rodada ${_state.rodada}. Use dados. Máximo 3 parágrafos curtos. Seja direto.`;

            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: mensagem, context: sistemaPrompt })
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            const reply = (data.response || '').trim();

            _state.historico.push({ role: 'ia', content: reply });
            _removerTypingIA();
            _adicionarMensagemIA(reply);
            _updateDica('meio');
        } catch {
            _removerTypingIA();
            _adicionarMensagemIA('Bom argumento! Vou pensar na minha resposta... Tente enviar novamente.');
            _state.historico.pop();
            _state.rodada--;
        }

        _setInputEnabled(true);
        _state.enviando = false;
        _setPhaseBadge(`Debate: Rodada ${Math.min(_state.rodada + 1, _state.maxRodadas)}/${_state.maxRodadas}`);
    }

    async function _iaRespondeUltima(ultimoArg) {
        _mostrarTypingIA();
        try {
            const sistemaPrompt = _buildSystemPrompt(false);
            const historicoTexto = _buildHistoricoTexto();
            const mensagem = `${historicoTexto}\n\nÚltimo argumento do aluno: "${ultimoArg}"\n\nEsta é a última rodada do debate. Faça uma resposta final forte, rebatendo o argumento do aluno e apresentando sua conclusão mais poderosa. Encerre de forma clara e assertiva. Máximo 3 parágrafos.`;

            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: mensagem, context: sistemaPrompt })
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            const reply = (data.response || '').trim();

            _state.historico.push({ role: 'ia', content: reply });
            _removerTypingIA();
            _adicionarMensagemIA(reply);
        } catch {
            _removerTypingIA();
            _adicionarMensagemIA('Foram ótimos argumentos! Vamos ver a avaliação.');
        }
    }

   
    async function _iniciarAvaliacao() {
        _setPhaseBadge('Avaliando...');
        const body = document.getElementById('dbt-body');
        if (!body) return;

    
        body.innerHTML = `
            <div class="dbt-eval-loading">
                <div class="dbt-eval-spinner"></div>
                <div class="dbt-eval-loading-text">
                    <h3>Analisando seus argumentos...</h3>
                    <p>A IA está avaliando clareza, uso de evidências, coerência lógica e capacidade de rebatimento.</p>
                </div>
                <div class="dbt-eval-bars">
                    <div class="dbt-eval-bar-item"><span>Clareza</span><div class="dbt-eval-bar-bg"><div class="dbt-eval-bar-anim" style="animation-delay:0s"></div></div></div>
                    <div class="dbt-eval-bar-item"><span>Evidências</span><div class="dbt-eval-bar-bg"><div class="dbt-eval-bar-anim" style="animation-delay:0.3s"></div></div></div>
                    <div class="dbt-eval-bar-item"><span>Lógica</span><div class="dbt-eval-bar-bg"><div class="dbt-eval-bar-anim" style="animation-delay:0.6s"></div></div></div>
                    <div class="dbt-eval-bar-item"><span>Rebatimento</span><div class="dbt-eval-bar-bg"><div class="dbt-eval-bar-anim" style="animation-delay:0.9s"></div></div></div>
                </div>
            </div>
        `;

        try {
            const avalPrompt = _buildAvaliationPrompt();
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: avalPrompt,
                    context: `Você é um avaliador especialista em retórica e argumentação. Avalie com rigor mas de forma didática. Responda APENAS em JSON válido, sem markdown, sem código, sem explicações fora do JSON.`
                })
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            let raw = (data.response || '').trim();

           
            raw = raw.replace(/```json|```/g, '').trim();
            const avaliacao = JSON.parse(raw);
            _renderAvaliacao(avaliacao);
        } catch (e) {
            
            _renderAvaliacao({
                nota_clareza: 7,
                nota_evidencias: 6,
                nota_logica: 7,
                nota_rebatimento: 6,
                nota_total: 65,
                feedback_geral: 'Você apresentou argumentos com boa base. Continue desenvolvendo o hábito de citar fontes e dados específicos para reforçar sua argumentação.',
                pontos_fortes: ['Manteve o foco no tema', 'Argumentação coerente', 'Boa capacidade de resposta'],
                pontos_melhorar: ['Usar mais dados e estatísticas', 'Antecipar contra-argumentos', 'Estruturar melhor a conclusão'],
                dica_final: 'Leia mais sobre o tema e pratique construir argumentos com a estrutura: Afirmação → Evidência → Raciocínio (método AER).',
                nivel: 'Intermediário'
            });
        }
    }

    function _renderAvaliacao(aval) {
        _state.fase = 'avaliacao';
        _setPhaseBadge('Resultado do Debate');
        const body = document.getElementById('dbt-body');
        if (!body) return;

        const nota = aval.nota_total || 0;
        const nivel = aval.nivel || 'Intermediário';
        const medalha = nota >= 85 ? '🥇' : nota >= 70 ? '🥈' : nota >= 55 ? '🥉' : '📚';
        const corNota = nota >= 85 ? '#4ade80' : nota >= 70 ? '#fbbf24' : nota >= 55 ? '#fb923c' : '#f87171';

        const criterios = [
            { key: 'nota_clareza',      label: 'Clareza & Coesão',        icon: '💬', desc: 'Quão claro e bem estruturado foi o argumento' },
            { key: 'nota_evidencias',   label: 'Uso de Evidências',        icon: '📊', desc: 'Uso de dados, estatísticas e exemplos reais' },
            { key: 'nota_logica',       label: 'Coerência Lógica',         icon: '🧠', desc: 'Validade do raciocínio e ausência de falácias' },
            { key: 'nota_rebatimento',  label: 'Capacidade de Rebatimento', icon: '⚔️', desc: 'Como respondeu aos argumentos adversários' }
        ];

        body.innerHTML = `
            <div class="dbt-result-wrap">
                <div class="dbt-result-hero" style="--nota-cor:${corNota}">
                    <div class="dbt-result-medalha">${medalha}</div>
                    <div class="dbt-result-info">
                        <div class="dbt-result-nivel">Nível: <strong>${nivel}</strong></div>
                        <div class="dbt-result-nota" style="color:${corNota}">${nota}<span>/100</span></div>
                        <div class="dbt-result-tema">${_state.tema.emoji} ${_state.tema.titulo} · ${_state.ladoAluno === 'pro' ? '👍 A Favor' : '👎 Contra'}</div>
                    </div>
                </div>

                <div class="dbt-result-criterios">
                    ${criterios.map(c => {
                        const val = aval[c.key] || 0;
                        const cor = val >= 8 ? '#4ade80' : val >= 6 ? '#fbbf24' : '#f87171';
                        return `
                            <div class="dbt-criterio-card">
                                <div class="dbt-criterio-header">
                                    <span class="dbt-criterio-icon">${c.icon}</span>
                                    <div>
                                        <div class="dbt-criterio-label">${c.label}</div>
                                        <div class="dbt-criterio-desc">${c.desc}</div>
                                    </div>
                                    <div class="dbt-criterio-nota" style="color:${cor}">${val}<span>/10</span></div>
                                </div>
                                <div class="dbt-criterio-bar-bg">
                                    <div class="dbt-criterio-bar-fill" style="width:${val*10}%;background:${cor}"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="dbt-result-feedback">
                    <div class="dbt-feedback-section">
                        <h4>💬 Feedback Geral</h4>
                        <p>${aval.feedback_geral || ''}</p>
                    </div>

                    <div class="dbt-feedback-cols">
                        <div class="dbt-feedback-col dbt-col-bom">
                            <h5>✅ Pontos Fortes</h5>
                            <ul>
                                ${(aval.pontos_fortes || []).map(p => `<li>${p}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="dbt-feedback-col dbt-col-melhorar">
                            <h5>📈 Pontos a Melhorar</h5>
                            <ul>
                                ${(aval.pontos_melhorar || []).map(p => `<li>${p}</li>`).join('')}
                            </ul>
                        </div>
                    </div>

                    <div class="dbt-dica-final">
                        <span class="dbt-dica-final-icon">💡</span>
                        <div>
                            <strong>Dica do avaliador:</strong>
                            <p>${aval.dica_final || ''}</p>
                        </div>
                    </div>
                </div>

                <div class="dbt-result-actions">
                    <button class="dbt-btn-secondary" onclick="DebateIA._verTranscricao()">📜 Ver Transcrição</button>
                    <button class="dbt-btn-primary" onclick="DebateIA._novoDebate()">⚔️ Novo Debate</button>
                </div>
            </div>
        `;
    }

    function _verTranscricao() {
        const tema = _state.tema;
        const ladoAluno = _state.ladoAluno === 'pro' ? '👍 A Favor' : '👎 Contra';
        const ladoIA    = _state.ladoIA    === 'pro' ? '👍 A Favor' : '👎 Contra';

        let html = `<div class="dbt-transcricao-overlay" id="dbt-transcricao-overlay" onclick="if(event.target===this)this.remove()">
            <div class="dbt-transcricao-box">
                <div class="dbt-transcricao-header">
                    <h3>📜 Transcrição do Debate</h3>
                    <div style="font-size:13px;color:rgba(255,255,255,0.5);">${tema.emoji} ${tema.titulo}</div>
                    <button onclick="document.getElementById('dbt-transcricao-overlay').remove()" style="background:none;border:none;color:rgba(255,255,255,0.5);font-size:20px;cursor:pointer;position:absolute;top:16px;right:20px">✕</button>
                </div>
                <div class="dbt-transcricao-body">
                    ${_state.historico.map((m, i) => `
                        <div class="dbt-tr-msg dbt-tr-${m.role}">
                            <div class="dbt-tr-who">${m.role === 'ia' ? `🤖 IA Adversária · ${ladoIA}` : `🧑‍🎓 Você · ${ladoAluno}`} · Turno ${i+1}</div>
                            <div class="dbt-tr-text">${_formatMd(m.content)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>`;

        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div.firstElementChild);
    }

    function _novoDebate() {
        _resetState();
        _renderEscolha();
        _setPhaseBadge('Escolha o Tema');
    }


    function _adicionarMensagemAluno(texto) {
        const chat = document.getElementById('dbt-chat');
        if (!chat) return;
        const div = document.createElement('div');
        div.className = 'dbt-msg dbt-msg-aluno';
        div.innerHTML = `
            <div class="dbt-msg-avatar">🧑‍🎓</div>
            <div class="dbt-msg-bubble dbt-bubble-aluno">
                <div class="dbt-msg-who">Você · Rodada ${_state.rodada}</div>
                <div class="dbt-msg-text">${_formatMd(texto)}</div>
            </div>
        `;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }

    function _adicionarMensagemIA(texto) {
        const chat = document.getElementById('dbt-chat');
        if (!chat) return;
        const div = document.createElement('div');
        div.className = 'dbt-msg dbt-msg-ia';
        div.innerHTML = `
            <div class="dbt-msg-avatar">🤖</div>
            <div class="dbt-msg-bubble dbt-bubble-ia">
                <div class="dbt-msg-who">IA Adversária · ${_state.ladoIA === 'pro' ? '👍 A Favor' : '👎 Contra'}</div>
                <div class="dbt-msg-text">${_formatMd(texto)}</div>
            </div>
        `;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }

    function _mostrarTypingIA() {
        const chat = document.getElementById('dbt-chat');
        if (!chat) return;
        const div = document.createElement('div');
        div.className = 'dbt-msg dbt-msg-ia';
        div.id = 'dbt-typing-ia';
        div.innerHTML = `
            <div class="dbt-msg-avatar">🤖</div>
            <div class="dbt-msg-bubble dbt-bubble-ia dbt-typing-bubble">
                <span></span><span></span><span></span>
            </div>
        `;
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }

    function _removerTypingIA() {
        document.getElementById('dbt-typing-ia')?.remove();
    }

    function _setInputEnabled(enabled) {
        const inp = document.getElementById('dbt-input');
        const btn = document.getElementById('dbt-send-btn');
        if (inp) inp.disabled = !enabled;
        if (btn) btn.disabled = !enabled;
    }

    function _updateProgress() {
        const fill = document.getElementById('dbt-progress-fill');
        const num  = document.getElementById('dbt-rodada-num');
        if (fill) fill.style.width = `${(_state.rodada / _state.maxRodadas) * 100}%`;
        if (num)  num.textContent = Math.min(_state.rodada + 1, _state.maxRodadas);
    }

    function _setPhaseBadge(txt) {
        const el = document.getElementById('dbt-phase-badge');
        if (el) el.textContent = txt;
    }

    function _usarChip(texto) {
        const inp = document.getElementById('dbt-input');
        if (inp) {
            inp.value = texto;
            inp.focus();
            inp.dispatchEvent(new Event('input'));
        }
    }

    function _shakeElement(id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.animation = 'dbt-shake 0.3s ease';
        setTimeout(() => el.style.animation = '', 300);
    }

    const DICAS = {
        abertura: 'Abra com um argumento forte e emocional. Use dados para impactar desde o início.',
        meio: 'Rebata o argumento anterior antes de apresentar o seu. Mostre que você ouviu.',
        final: 'Finalize recapitulando seus melhores pontos e mostrando por que sua posição prevalece.'
    };

    const DICAS_EXTRA = [
        'Use a estrutura: Afirmação → Evidência → Raciocínio (método AER).',
        'Evite falácias: ataque os argumentos, não a pessoa.',
        'Exemplos históricos e comparações internacionais fortalecem muito o argumento.',
        'Reconhecer pontos válidos do adversário aumenta sua credibilidade.',
        'Perguntas retóricas podem ser poderosas quando usadas com moderação.'
    ];

    function _updateDica(tipo) {
        const el = document.getElementById('dbt-dica-texto');
        if (!el) return;
        if (tipo === 'final' || _state.rodada >= _state.maxRodadas - 1) {
            el.textContent = DICAS.final;
        } else if (_state.rodada === 0) {
            el.textContent = DICAS.abertura;
        } else {
            el.textContent = DICAS_EXTRA[_state.rodada % DICAS_EXTRA.length];
        }
    }

    function _getStarterChips() {
        const tema = _state.tema;
        const lado = _state.ladoAluno;
        const args = lado === 'pro' ? tema.argPro : tema.argContra;
        return args.slice(0, 3).map(a => `${a}...`);
    }

    function _buildSystemPrompt(isAbertura) {
        const tema = _state.tema;
        const ladoIA    = _state.ladoIA    === 'pro' ? 'A FAVOR' : 'CONTRA';
        const ladoAluno = _state.ladoAluno === 'pro' ? 'A FAVOR' : 'CONTRA';

        const argsSeuLado = _state.ladoIA === 'pro' ? tema.argPro : tema.argContra;
        const argsOpostos = _state.ladoIA === 'pro' ? tema.argContra : tema.argPro;

        return `Você é um debatedor especialista e experiente em um debate formal sobre "${tema.titulo}".
Tema/questão central: "${tema.descricao}"

SEU PAPEL: Você está FIRMEMENTE ${ladoIA} dessa questão. Você NUNCA muda de lado ou admite que o lado oposto tem razão geral — pode reconhecer pontos específicos, mas sempre retoma sua posição.

O ALUNO está ${ladoAluno} da questão.

SEUS ARGUMENTOS PRINCIPAIS:
${argsSeuLado.map((a, i) => `${i+1}. ${a}`).join('\n')}

ARGUMENTOS QUE VOCÊ DEVE REBATER (do lado do aluno):
${argsOpostos.map((a, i) => `${i+1}. ${a}`).join('\n')}

DADOS CONTEXTUAIS QUE VOCÊ PODE USAR:
${tema.dados.map((d, i) => `• ${d}`).join('\n')}

REGRAS DO DEBATE:
1. Seja contundente, direto e use dados quando possível.
2. Rebata os argumentos do aluno antes de apresentar os seus.
3. Nunca use linguagem ofensiva ou desrespeitosa.
4. Suas respostas devem ter no máximo 3 parágrafos curtos.
5. Use linguagem clara e acessível para estudantes brasileiros.
6. Responda SEMPRE em português do Brasil.
7. Não quebre personagem: você é um debatedor, não uma IA assistente.`;
    }

    function _buildHistoricoTexto() {
        return _state.historico.slice(-6).map(m =>
            `[${m.role === 'ia' ? 'IA' : 'ALUNO'}]: ${m.content}`
        ).join('\n\n');
    }

    function _buildAvaliationPrompt() {
        const tema = _state.tema;
        const ladoAluno = _state.ladoAluno === 'pro' ? 'A FAVOR' : 'CONTRA';
        const argsMensagensAluno = _state.historico
            .filter(m => m.role === 'aluno')
            .map((m, i) => `Rodada ${i+1}: "${m.content}"`)
            .join('\n\n');

        return `Avalie a qualidade argumentativa do aluno neste debate sobre "${tema.titulo}".

O ALUNO estava ${ladoAluno} da questão.

ARGUMENTOS DO ALUNO (em ordem):
${argsMensagensAluno}

CONTEXTO DO DEBATE:
${_buildHistoricoTexto()}

Avalie com base em 4 critérios (notas de 0 a 10 cada) e retorne APENAS o seguinte JSON (sem markdown, sem texto antes ou depois):
{
  "nota_clareza": <0-10>,
  "nota_evidencias": <0-10>,
  "nota_logica": <0-10>,
  "nota_rebatimento": <0-10>,
  "nota_total": <0-100>,
  "nivel": "<Iniciante|Intermediário|Avançado|Expert>",
  "feedback_geral": "<2-3 frases sobre a performance geral>",
  "pontos_fortes": ["<ponto 1>", "<ponto 2>", "<ponto 3>"],
  "pontos_melhorar": ["<ponto 1>", "<ponto 2>", "<ponto 3>"],
  "dica_final": "<1 dica prática específica para melhorar>"
}

CRITÉRIOS:
- nota_clareza: Clareza, coesão e estrutura dos argumentos (0-10)
- nota_evidencias: Uso de dados, estatísticas, exemplos e referências (0-10)
- nota_logica: Validade lógica, ausência de falácias, consistência (0-10)
- nota_rebatimento: Capacidade de responder e desconstruir argumentos adversários (0-10)
- nota_total: Média ponderada (clareza 25% + evidências 25% + lógica 30% + rebatimento 20%) × 10

IMPORTANTE: Avalie a QUALIDADE dos argumentos, não a posição. Um aluno que defende bem uma posição impopular deve receber nota alta.`;
    }


    function _formatMd(text) {
        return String(text)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

 
    function _injectStyles() {
        if (document.getElementById('dbt-styles')) return;
        const style = document.createElement('style');
        style.id = 'dbt-styles';
        style.textContent = `

.dbt-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.82);
    backdrop-filter: blur(8px);
    z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: dbt-fade 0.2s ease;
}
@keyframes dbt-fade { from { opacity: 0; } to { opacity: 1; } }

.dbt-box {
    width: min(1000px, 96vw);
    height: min(780px, 94vh);
    background: linear-gradient(145deg, #0a0c14 0%, #0d0f1a 50%, #080a12 100%);
    border-radius: 24px;
    display: flex; flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03) inset;
    animation: dbt-rise 0.3s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes dbt-rise { from { opacity:0; transform:translateY(30px) scale(0.96); } to { opacity:1; transform:none; } }


.dbt-header {
    padding: 18px 28px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex; justify-content: space-between; align-items: center;
    flex-shrink: 0;
    background: rgba(255,255,255,0.015);
}
.dbt-header-left { display: flex; align-items: center; gap: 14px; }
.dbt-header-icon { font-size: 28px; }
.dbt-header-title { margin: 0; font-size: 20px; color: #fff; font-family: 'DM Serif Display', serif; letter-spacing: -0.3px; }
.dbt-header-sub { margin: 2px 0 0; font-size: 11px; color: rgba(255,255,255,0.3); letter-spacing: 0.04em; }
.dbt-header-right { display: flex; align-items: center; gap: 12px; }
.dbt-phase-badge {
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px; padding: 5px 14px; font-size: 12px; font-weight: 600;
    color: rgba(255,255,255,0.6); letter-spacing: 0.03em;
}
.dbt-close-btn {
    background: rgba(255,255,255,0.07); border: none; color: rgba(255,255,255,0.5);
    font-size: 18px; cursor: pointer; width: 36px; height: 36px;
    border-radius: 10px; display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
}
.dbt-close-btn:hover { background: rgba(248,113,113,0.15); color: #f87171; }


.dbt-body { flex: 1; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.06) transparent; }


.dbt-escolha-wrap { padding: 32px; display: flex; flex-direction: column; gap: 28px; }
.dbt-escolha-intro {
    background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05));
    border: 1px solid rgba(99,102,241,0.2);
    border-radius: 18px; padding: 28px; text-align: center;
}
.dbt-intro-icon { font-size: 40px; margin-bottom: 12px; }
.dbt-escolha-intro h3 { margin: 0 0 10px; color: #fff; font-family: 'DM Serif Display', serif; font-size: 22px; }
.dbt-escolha-intro p { margin: 0 0 20px; color: rgba(255,255,255,0.55); font-size: 14px; line-height: 1.6; }
.dbt-intro-steps { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.dbt-step {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px; padding: 6px 14px; font-size: 12px; color: rgba(255,255,255,0.6);
}
.dbt-step-num {
    width: 20px; height: 20px; background: rgba(99,102,241,0.3);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: #818cf8; flex-shrink: 0;
}

.dbt-temas-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.dbt-temas-header h4 { margin: 0; color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 600; letter-spacing: 0.03em; }
.dbt-temas-filtro input {
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; padding: 8px 14px; color: #fff; outline: none;
    font-size: 13px; width: 220px;
}
.dbt-temas-filtro input:focus { border-color: rgba(99,102,241,0.4); }

.dbt-temas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.dbt-tema-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; padding: 18px 20px;
    display: flex; align-items: center; gap: 14px;
    cursor: pointer; text-align: left;
    transition: all 0.2s; position: relative; overflow: hidden;
    color: inherit;
}
.dbt-tema-card::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px; background: var(--tema-cor, #6366f1);
    border-radius: 3px 0 0 3px; opacity: 0; transition: opacity 0.2s;
}
.dbt-tema-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15); transform: translateX(4px); }
.dbt-tema-card:hover::before { opacity: 1; }
.dbt-tema-emoji { font-size: 28px; flex-shrink: 0; }
.dbt-tema-info { flex: 1; min-width: 0; }
.dbt-tema-cat { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--tema-cor); opacity: 0.8; margin-bottom: 3px; }
.dbt-tema-titulo { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 4px; }
.dbt-tema-desc { font-size: 11px; color: rgba(255,255,255,0.4); line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dbt-tema-arrow { color: rgba(255,255,255,0.2); font-size: 18px; flex-shrink: 0; transition: transform 0.2s; }
.dbt-tema-card:hover .dbt-tema-arrow { transform: translateX(4px); color: var(--tema-cor); }
.dbt-empty { grid-column: 1/-1; text-align: center; padding: 40px; color: rgba(255,255,255,0.3); font-size: 14px; }
.dbt-empty button { background: none; border: none; color: #6366f1; cursor: pointer; text-decoration: underline; }


.dbt-prep-wrap { padding: 28px 32px; display: flex; flex-direction: column; gap: 22px; }
.dbt-back-btn {
    background: none; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.4);
    border-radius: 10px; padding: 7px 14px; font-size: 12px; cursor: pointer;
    align-self: flex-start; transition: all 0.2s;
}
.dbt-back-btn:hover { color: #fff; border-color: rgba(255,255,255,0.3); }

.dbt-tema-banner {
    background: linear-gradient(135deg, rgba(var(--tema-rgb,99,102,241),0.1), rgba(0,0,0,0));
    border: 1px solid color-mix(in srgb, var(--tema-cor, #6366f1) 30%, transparent);
    border-radius: 18px; padding: 22px; display: flex; gap: 18px; align-items: flex-start;
    background-color: rgba(255,255,255,0.02);
}
.dbt-banner-emoji { font-size: 36px; flex-shrink: 0; }
.dbt-banner-cat { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--tema-cor); margin-bottom: 5px; }
.dbt-banner-titulo { margin: 0 0 6px; font-family: 'DM Serif Display', serif; font-size: 22px; color: #fff; }
.dbt-banner-desc { margin: 0; font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.5; }

.dbt-dados-section { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 16px 20px; }
.dbt-dados-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: rgba(255,255,255,0.35); margin-bottom: 12px; }
.dbt-dados-list { display: flex; flex-direction: column; gap: 8px; }
.dbt-dado-item { font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.5; background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 8px; border-left: 2px solid rgba(251,191,36,0.4); }

.dbt-lado-section h4 { margin: 0 0 6px; color: #fff; font-size: 17px; font-family: 'DM Serif Display', serif; }
.dbt-lado-hint { margin: 0 0 18px; font-size: 13px; color: rgba(255,255,255,0.45); }
.dbt-lados-grid { display: flex; gap: 12px; align-items: stretch; }

.dbt-lado-card {
    flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 18px; padding: 22px 18px;
    cursor: pointer; text-align: left; transition: all 0.2s;
    display: flex; flex-direction: column; gap: 8px;
}
.dbt-lado-card:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.4); }
.dbt-lado-pro:hover { background: rgba(74,222,128,0.07); border-color: rgba(74,222,128,0.25); }
.dbt-lado-contra:hover { background: rgba(248,113,113,0.07); border-color: rgba(248,113,113,0.25); }
.dbt-lado-icon { font-size: 28px; }
.dbt-lado-label { font-size: 10px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.4); }
.dbt-lado-pro .dbt-lado-label { color: #4ade80; }
.dbt-lado-contra .dbt-lado-label { color: #f87171; }
.dbt-lado-titulo { font-size: 13px; font-weight: 700; color: #fff; }
.dbt-lado-args { display: flex; flex-direction: column; gap: 5px; margin-top: 6px; }
.dbt-lado-arg { font-size: 11px; color: rgba(255,255,255,0.5); line-height: 1.4; }
.dbt-lado-more { font-size: 10px; color: rgba(255,255,255,0.25); margin-top: 3px; }
.dbt-vs-badge {
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 800; color: rgba(255,255,255,0.2);
    font-family: 'DM Serif Display', serif; flex-shrink: 0;
}

.dbt-regras {
    background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.15);
    border-radius: 12px; padding: 14px 18px;
    display: flex; align-items: flex-start; gap: 10px;
    font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.6;
}
.dbt-regras-icon { font-size: 18px; flex-shrink: 0; }
.dbt-regras strong { color: rgba(255,255,255,0.8); }

.dbt-arena {
    display: flex; flex-direction: column; height: 100%;
    background: linear-gradient(180deg, rgba(10,12,20,0) 0%, rgba(5,7,15,0.3) 100%);
}

.dbt-arena-header {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    background: rgba(255,255,255,0.015);
    flex-shrink: 0;
}
.dbt-combatente { display: flex; align-items: center; gap: 10px; flex: 1; }
.dbt-combatente-ia { justify-content: flex-end; flex-direction: row-reverse; }
.dbt-comb-avatar { font-size: 22px; }
.dbt-comb-nome { font-size: 13px; font-weight: 700; color: #fff; }
.dbt-comb-lado { font-size: 11px; font-weight: 700; }

.dbt-arena-center { display: flex; flex-direction: column; align-items: center; gap: 6px; flex-shrink: 0; }
.dbt-tema-chip { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.05); border-radius: 12px; padding: 3px 10px; white-space: nowrap; }
.dbt-rodada-badge { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.6); }
.dbt-progress-bar { width: 100px; height: 4px; background: rgba(255,255,255,0.07); border-radius: 2px; overflow: hidden; }
.dbt-progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 2px; transition: width 0.5s ease; }

.dbt-chat {
    flex: 1; overflow-y: auto; padding: 20px;
    display: flex; flex-direction: column; gap: 16px;
    scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.05) transparent;
}
.dbt-chat-start {
    text-align: center; padding: 12px 20px;
    background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.15);
    border-radius: 12px; font-size: 13px; color: rgba(255,255,255,0.5);
}

.dbt-msg { display: flex; gap: 10px; max-width: 85%; animation: dbt-msg-in 0.25s ease; }
@keyframes dbt-msg-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
.dbt-msg-aluno { align-self: flex-end; flex-direction: row-reverse; }
.dbt-msg-ia    { align-self: flex-start; }
.dbt-msg-avatar { font-size: 20px; flex-shrink: 0; margin-top: 4px; }
.dbt-msg-bubble { border-radius: 16px; padding: 12px 16px; max-width: 100%; }
.dbt-bubble-aluno {
    background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2));
    border: 1px solid rgba(99,102,241,0.3);
    border-radius: 16px 16px 4px 16px;
}
.dbt-bubble-ia {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 16px 16px 16px 4px;
}
.dbt-msg-who { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
.dbt-msg-text { font-size: 13px; line-height: 1.7; color: rgba(255,255,255,0.85); }
.dbt-msg-text strong { color: #fff; }
.dbt-msg-text code { background: rgba(255,255,255,0.08); padding: 1px 5px; border-radius: 4px; font-family: monospace; font-size: 12px; }

.dbt-typing-bubble { display: flex; align-items: center; gap: 6px; padding: 14px 18px !important; }
.dbt-typing-bubble span { width: 8px; height: 8px; background: rgba(255,255,255,0.35); border-radius: 50%; animation: dbt-bounce 1.2s infinite; }
.dbt-typing-bubble span:nth-child(2) { animation-delay: 0.2s; }
.dbt-typing-bubble span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dbt-bounce { 0%,80%,100%{transform:scale(0.8);opacity:0.4}40%{transform:scale(1.2);opacity:1} }

.dbt-dicas-strip {
    padding: 8px 20px;
    background: rgba(251,191,36,0.05); border-top: 1px solid rgba(251,191,36,0.1);
    display: flex; align-items: center; gap: 8px;
    flex-shrink: 0;
}
.dbt-dica-label { font-size: 11px; font-weight: 700; color: rgba(251,191,36,0.7); flex-shrink: 0; }
#dbt-dica-texto { font-size: 12px; color: rgba(255,255,255,0.4); }

.dbt-input-area { border-top: 1px solid rgba(255,255,255,0.06); padding: 14px 20px 16px; flex-shrink: 0; }
.dbt-input-wrap { display: flex; flex-direction: column; gap: 8px; }
.dbt-textarea {
    width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px; padding: 12px 16px; color: #fff; outline: none;
    font-size: 13px; line-height: 1.6; resize: none; font-family: inherit;
    transition: border-color 0.2s; box-sizing: border-box;
}
.dbt-textarea:focus { border-color: rgba(99,102,241,0.4); }
.dbt-textarea:disabled { opacity: 0.4; }
.dbt-input-actions { display: flex; justify-content: space-between; align-items: center; }
.dbt-char-count { font-size: 11px; color: rgba(255,255,255,0.3); }
.dbt-send-btn {
    display: flex; align-items: center; gap: 8px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none; border-radius: 10px; padding: 10px 20px;
    color: #fff; font-size: 13px; font-weight: 700; cursor: pointer;
    transition: all 0.2s;
}
.dbt-send-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.4); }
.dbt-send-btn:disabled { opacity: 0.4; transform: none; cursor: not-allowed; }
.dbt-send-icon { font-size: 16px; }

.dbt-starter-chips { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
.dbt-starters-label { font-size: 11px; color: rgba(255,255,255,0.25); flex-shrink: 0; }
.dbt-chip {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px; padding: 5px 12px; font-size: 11px; color: rgba(255,255,255,0.45);
    cursor: pointer; transition: all 0.2s; max-width: 200px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.dbt-chip:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.3); color: #a5b4fc; }


.dbt-eval-loading {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 100%; gap: 24px; padding: 40px;
}
.dbt-eval-spinner {
    width: 56px; height: 56px;
    border: 3px solid rgba(99,102,241,0.15);
    border-top-color: #6366f1;
    border-radius: 50%; animation: dbt-spin 0.7s linear infinite;
}
@keyframes dbt-spin { to { transform: rotate(360deg); } }
.dbt-eval-loading-text { text-align: center; }
.dbt-eval-loading-text h3 { margin: 0 0 8px; color: #fff; font-family: 'DM Serif Display', serif; font-size: 22px; }
.dbt-eval-loading-text p { margin: 0; color: rgba(255,255,255,0.45); font-size: 14px; max-width: 400px; }
.dbt-eval-bars { width: 100%; max-width: 380px; display: flex; flex-direction: column; gap: 10px; }
.dbt-eval-bar-item { display: flex; align-items: center; gap: 12px; font-size: 12px; color: rgba(255,255,255,0.4); }
.dbt-eval-bar-item span { width: 80px; text-align: right; flex-shrink: 0; }
.dbt-eval-bar-bg { flex: 1; height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
.dbt-eval-bar-anim { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 3px; animation: dbt-scan 1.5s ease-in-out infinite; }
@keyframes dbt-scan { 0%,100%{width:20%;margin-left:0}50%{width:50%;margin-left:30%} }


.dbt-result-wrap { padding: 28px 32px; display: flex; flex-direction: column; gap: 22px; }

.dbt-result-hero {
    background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05));
    border: 1px solid rgba(99,102,241,0.2);
    border-radius: 20px; padding: 28px;
    display: flex; align-items: center; gap: 24px;
}
.dbt-result-medalha { font-size: 56px; flex-shrink: 0; }
.dbt-result-nivel { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); margin-bottom: 6px; }
.dbt-result-nota {
    font-size: 56px; font-weight: 900; line-height: 1; color: var(--nota-cor, #4ade80);
    font-family: 'DM Mono', monospace;
}
.dbt-result-nota span { font-size: 20px; color: rgba(255,255,255,0.3); }
.dbt-result-tema { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 6px; }

.dbt-result-criterios { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.dbt-criterio-card {
    background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px; padding: 14px 16px;
}
.dbt-criterio-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.dbt-criterio-icon { font-size: 20px; flex-shrink: 0; }
.dbt-criterio-label { font-size: 13px; font-weight: 700; color: #fff; }
.dbt-criterio-desc { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 2px; }
.dbt-criterio-nota { margin-left: auto; font-size: 22px; font-weight: 900; font-family: 'DM Mono', monospace; flex-shrink: 0; }
.dbt-criterio-nota span { font-size: 13px; color: rgba(255,255,255,0.3); }
.dbt-criterio-bar-bg { height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
.dbt-criterio-bar-fill { height: 100%; border-radius: 3px; transition: width 1s cubic-bezier(0.34,1.56,0.64,1); }

.dbt-result-feedback { display: flex; flex-direction: column; gap: 16px; }
.dbt-feedback-section { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 18px 20px; }
.dbt-feedback-section h4 { margin: 0 0 10px; color: #fff; font-size: 15px; }
.dbt-feedback-section p { margin: 0; font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.7; }

.dbt-feedback-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.dbt-feedback-col { border-radius: 14px; padding: 16px 18px; }
.dbt-col-bom { background: rgba(74,222,128,0.05); border: 1px solid rgba(74,222,128,0.15); }
.dbt-col-melhorar { background: rgba(251,191,36,0.05); border: 1px solid rgba(251,191,36,0.15); }
.dbt-feedback-col h5 { margin: 0 0 10px; font-size: 13px; color: rgba(255,255,255,0.7); }
.dbt-col-bom h5 { color: #4ade80; }
.dbt-col-melhorar h5 { color: #fbbf24; }
.dbt-feedback-col ul { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 5px; }
.dbt-feedback-col li { font-size: 12px; color: rgba(255,255,255,0.55); line-height: 1.5; }

.dbt-dica-final {
    display: flex; gap: 12px; align-items: flex-start;
    background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.2);
    border-radius: 14px; padding: 16px 18px;
}
.dbt-dica-final-icon { font-size: 22px; flex-shrink: 0; }
.dbt-dica-final strong { font-size: 13px; color: #a5b4fc; display: block; margin-bottom: 4px; }
.dbt-dica-final p { margin: 0; font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.6; }

.dbt-result-actions { display: flex; justify-content: flex-end; gap: 12px; padding-bottom: 4px; }
.dbt-btn-primary {
    padding: 12px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none; border-radius: 12px; color: #fff; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
}
.dbt-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(99,102,241,0.4); }
.dbt-btn-secondary {
    padding: 12px 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; color: rgba(255,255,255,0.6); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
}
.dbt-btn-secondary:hover { background: rgba(255,255,255,0.08); color: #fff; }


.dbt-transcricao-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 20000;
    display: flex; align-items: center; justify-content: center; padding: 16px;
}
.dbt-transcricao-box {
    width: min(680px, 94vw); height: min(600px, 90vh);
    background: #0d0f1a; border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.08);
    display: flex; flex-direction: column; overflow: hidden;
}
.dbt-transcricao-header { padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); position: relative; }
.dbt-transcricao-header h3 { margin: 0 0 4px; color: #fff; font-family: 'DM Serif Display', serif; font-size: 18px; }
.dbt-transcricao-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 14px; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.05) transparent; }
.dbt-tr-msg { border-radius: 14px; padding: 14px 16px; }
.dbt-tr-aluno { background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.15); }
.dbt-tr-ia    { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); }
.dbt-tr-who { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: rgba(255,255,255,0.3); margin-bottom: 8px; }
.dbt-tr-text { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6; }


@keyframes dbt-shake { 0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)} }


@media (max-width: 640px) {
    .dbt-result-criterios { grid-template-columns: 1fr; }
    .dbt-feedback-cols { grid-template-columns: 1fr; }
    .dbt-lados-grid { flex-direction: column; }
    .dbt-vs-badge { display: none; }
    .dbt-arena-header { gap: 6px; }
    .dbt-comb-info { display: none; }
}
        `;
        document.head.appendChild(style);
    }

   
    return {
        abrir,
        fechar,
        _renderEscolha,
        _filtrarTemas,
        _selecionarTema,
        _confirmarLado,
        _enviarArgumento,
        _handleKey,
        _usarChip,
        _verTranscricao,
        _novoDebate
    };
})();

window.DebateIA = DebateIA;
