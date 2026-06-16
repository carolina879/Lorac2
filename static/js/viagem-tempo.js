const ViagemTempo = (() => {
    const MODAL_ID = 'modal-viagem-tempo';

    let _state = {
        personagem: null,
        historico: [],
        carregando: false,
        fase: 'selecao',
    };

    const PERSONAGENS = [
        {
            id: 'robespierre',
            nome: 'Maximilien Robespierre',
            epoca: 'Revolução Francesa (1793)',
            avatar: '⚖️',
            cor: '#e84a4a',
            descricao: 'O arquiteto do "Terror". Defensor da virtude e da República a qualquer custo.',
            contexto: 'Você é Maximilien Robespierre em 1793, durante o auge da Revolução Francesa. Você é um líder jacobino e membro do Comitê de Salvação Pública. Sua linguagem é formal, apaixonada pela República e pela "Virtude". Você acredita que o Terror é necessário para proteger a Revolução contra os traidores e monarquistas. Fale com convicção e autoridade. Responda em português, com o fervor de um revolucionário.',
            dicas: ['Pergunte sobre a Guilhotina', 'Questione o Rei Luís XVI', 'Fale sobre a Igualdade, Fraternidade, Liberdade', 'Qual o papel do Comitê de Salvação Pública?']
        },
        {
            id: 'dom-pedro-ii',
            nome: 'Dom Pedro II',
            epoca: 'Império do Brasil (1880)',
            avatar: '👑',
            cor: '#e8a04a',
            descricao: 'O último imperador do Brasil. Um intelectual apaixonado por ciência, fotografia e pelo futuro do país.',
            contexto: 'Você é Dom Pedro II do Brasil, por volta de 1880. Você é um homem culto, sereno, que fala vários idiomas e valoriza a educação, a ciência e o progresso. Sua linguagem é erudita, ponderada e paternalista. Você se preocupa com o futuro do Brasil, a abolição da escravidão e a modernização. Responda em português formal, com a sabedoria de um monarca esclarecido.',
            dicas: ['Fale sobre a Astronomia', 'Pergunte sobre a Guerra do Paraguai', 'Questione o futuro da Monarquia', 'Qual sua opinião sobre a abolição da escravidão?']
        },
        {
            id: 'marie-curie',
            nome: 'Marie Curie',
            epoca: 'Paris (1911)',
            avatar: '⚗️',
            cor: '#a0c4e8',
            descricao: 'Pioneira da radioatividade. Única pessoa a ganhar dois prêmios Nobel em áreas científicas diferentes.',
            contexto: 'Você é Marie Curie em 1911, após ganhar seu segundo Prêmio Nobel. Você é uma cientista focada, humilde, resiliente e extremamente técnica. Você valoriza o método científico, a pesquisa e a descoberta acima de tudo. Sua linguagem é precisa e direta, explicando conceitos de física e química de forma clara. Responda em português, com a paixão de uma pesquisadora.',
            dicas: ['Pergunte sobre o Rádio e Polônio', 'Fale sobre o papel da mulher na ciência', 'Questione os riscos da radiação', 'Como foi trabalhar com seu marido?']
        },
        {
            id: 'einstein-jovem',
            nome: 'Albert Einstein (1905)',
            epoca: 'Suíça (1905)',
            avatar: '🧠',
            cor: '#7a9e7e',
            descricao: 'O jovem funcionário do escritório de patentes que está revolucionando a física com a Teoria da Relatividade.',
            contexto: 'Você é Albert Einstein em 1905, o "Annus Mirabilis". Você é um jovem físico brilhante, um pouco rebelde e com uma mente curiosa que questiona os fundamentos da física clássica. Sua linguagem é acessível, mas com profundidade conceitual. Você está entusiasmado com suas novas ideias sobre a relatividade e o efeito fotoelétrico. Responda em português, com a genialidade e o humor sutil de Einstein.',
            dicas: ['Pergunte sobre a Teoria da Relatividade', 'Fale sobre E=mc²', 'Questione a natureza da luz', 'Como é trabalhar no escritório de patentes?']
        },
        {
            id: 'napoleao',
            nome: 'Napoleão Bonaparte',
            epoca: 'França (1805)',
            avatar: '⚔️',
            cor: '#60a5fa',
            descricao: 'O imperador que conquistou grande parte da Europa e reformou a França.',
            contexto: 'Você é Napoleão Bonaparte em 1805, no auge de seu poder como Imperador dos Franceses. Você é um estrategista militar genial, um líder carismático e um administrador implacável. Sua linguagem é direta, autoritária e cheia de confiança. Você fala sobre suas vitórias militares, o Código Napoleônico e seu destino de moldar a Europa. Responda em português, com a imponência de um imperador.',
            dicas: ['Pergunte sobre a Batalha de Austerlitz', 'Fale sobre o Código Napoleônico', 'Questione a invasão da Rússia', 'Qual seu maior inimigo?']
        }
    ];

    
    function abrir() {
        document.getElementById(MODAL_ID)?.remove();
        _injectStyles();
        _resetState();

        const modal = document.createElement('div');
        modal.id = MODAL_ID;
        modal.className = 'vt-overlay';
        modal.innerHTML = `
            <div class="vt-box" id="vt-box">
                <div class="vt-header">
                    <div class="vt-header-left">
                        <div class="vt-header-icon">⏳</div>
                        <div>
                            <h2 class="vt-header-title">Viagem no Tempo</h2>
                            <p class="vt-header-sub">Converse com personagens históricos</p>
                        </div>
                    </div>
                    <div class="vt-header-right">
                        <button class="vt-close-btn" onclick="ViagemTempo.fechar()" title="Fechar">✕</button>
                    </div>
                </div>
                <div class="vt-body" id="vt-body"></div>
            </div>
        `;
        document.body.appendChild(modal);
        _renderEscolhaPersonagem();
    }

    function fechar() {
        document.getElementById(MODAL_ID)?.remove();
    }

    function _resetState() {
        _state = {
            personagem: null,
            historico: [],
            carregando: false,
            fase: 'selecao',
        };
    }

    
    function _renderEscolhaPersonagem() {
        _state.fase = 'selecao';
        const body = document.getElementById('vt-body');
        if (!body) return;

        body.innerHTML = `
            <div class="vt-selecao-wrap">
                <div class="vt-selecao-intro">
                    <h3>Escolha seu Companheiro de Viagem no Tempo</h3>
                    <p>Selecione um personagem abaixo ou digite o nome de quem você deseja encontrar para uma jornada personalizada.</p>
                    
                    <div class="vt-custom-input-wrap">
                        <input type="text" id="vt-custom-name" placeholder="Ex: Santos Dumont, Cleópatra, Da Vinci..." 
                            onkeydown="if(event.key==='Enter') ViagemTempo._selecionarCustomizado()"/>
                        <button class="vt-custom-btn" onclick="ViagemTempo._selecionarCustomizado()">Viajar 🚀</button>
                    </div>
                </div>
                <div class="vt-personagens-grid">
                    ${PERSONAGENS.map(p => `
                        <button class="vt-personagem-card" onclick="ViagemTempo._selecionarPersonagem('${p.id}')" style="--personagem-cor:${p.cor}">
                            <div class="vt-card-avatar">${p.avatar}</div>
                            <div class="vt-card-info">
                                <div class="vt-card-nome">${p.nome}</div>
                                <div class="vt-card-epoca">${p.epoca}</div>
                                <div class="vt-card-desc">${p.descricao}</div>
                            </div>
                            <div class="vt-card-arrow">→</div>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    function _selecionarPersonagem(id) {
        const personagem = PERSONAGENS.find(p => p.id === id);
        if (!personagem) return;
        _state.personagem = personagem;
        _state.fase = 'conversa';
        _iniciarConversa();
    }

    function _selecionarCustomizado() {
        const inp = document.getElementById('vt-custom-name');
        const nome = inp?.value.trim();
        if (!nome) return;

        const customChar = {
            id: 'custom-' + Date.now(),
            nome: nome,
            epoca: 'História',
            avatar: '✨',
            cor: '#a5b4fc',
            descricao: `Conversando com ${nome}.`,
            contexto: `Você é ${nome}. Responda em português, incorporando perfeitamente a personalidade, o vocabulário, o conhecimento e o contexto histórico real deste personagem. Se o usuário perguntar sobre sua época ou feitos, responda de acordo com os fatos históricos reais. Não saia do personagem.`,
            dicas: [`Quem é você?`, `O que você fez de importante?`, `Como é o seu tempo?`]
        };

        _state.personagem = customChar;
        _state.fase = 'conversa';
        _iniciarConversa();
    }

    
    async function _iniciarConversa() {
        const body = document.getElementById('vt-body');
        if (!body) return;
        const personagem = _state.personagem;

        body.innerHTML = `
            <div class="vt-conversa-wrap">
                <div class="vt-chat-header" style="--personagem-cor:${personagem.cor}">
                    <button class="vt-back-btn" onclick="ViagemTempo._renderEscolhaPersonagem()">← Voltar</button>
                    <div class="vt-chat-personagem-info">
                        <div class="vt-chat-avatar">${personagem.avatar}</div>
                        <div>
                            <div class="vt-chat-nome">${personagem.nome}</div>
                            <div class="vt-chat-epoca">${personagem.epoca}</div>
                        </div>
                    </div>
                    <button class="vt-clear-chat-btn" onclick="ViagemTempo._limparConversa()">🗑️ Limpar</button>
                </div>

                <div class="vt-chat-area" id="vt-chat-area">
                    <div class="vt-chat-start">
                        <div class="vt-chat-start-icon">${personagem.avatar}</div>
                        <p>Você está conversando com <strong>${personagem.nome}</strong>. Ele responderá como se estivesse em <strong>${personagem.epoca}</strong>.</p>
                        <p>Comece a conversa! Aqui estão algumas ideias:</p>
                        <div class="vt-dicas-chips">
                            ${personagem.dicas.map(d => `<button class="vt-chip" onclick="ViagemTempo._usarChip('${d.replace(/'/g,"\\'")}')">${d}</button>`).join('')}
                        </div>
                    </div>
                </div>

                <div class="vt-input-area">
                    <textarea
                        id="vt-input"
                        class="vt-textarea"
                        placeholder="Pergunte algo ao ${personagem.nome}..."
                        rows="1"
                        onkeydown="ViagemTempo._handleKey(event)"
                        oninput="this.style.height='auto'; this.style.height=(this.scrollHeight)+'px';"
                    ></textarea>
                    <button class="vt-send-btn" id="vt-send-btn" onclick="ViagemTempo._enviarMensagem()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/></svg>
                    </button>
                </div>
            </div>
        `;

        const chatArea = document.getElementById('vt-chat-area');
        if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
    }

    function _limparConversa() {
        _state.historico = [];
        _iniciarConversa();
    }

    function _handleKey(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            _enviarMensagem();
        }
    }

    function _usarChip(texto) {
        const inp = document.getElementById('vt-input');
        if (inp) {
            inp.value = texto;
            inp.focus();
            inp.dispatchEvent(new Event('input'));
            _enviarMensagem();
        }
    }

    async function _enviarMensagem() {
        if (_state.carregando) return;
        const inp = document.getElementById('vt-input');
        if (!inp) return;
        const texto = inp.value.trim();
        if (!texto) return;

        _state.carregando = true;
        inp.value = '';
        inp.style.height = 'auto';
        _setInputEnabled(false);

        _adicionarMensagemAluno(texto);
        _state.historico.push({ role: 'aluno', content: texto });

        _mostrarTypingPersonagem();

        try {
            const sistemaPrompt = _buildSystemPrompt();
            const historicoTexto = _buildHistoricoTexto();
            const mensagemParaIA = `${historicoTexto}\n\nAluno: ${texto}`;

            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: mensagemParaIA, context: sistemaPrompt })
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            const reply = (data.response || '').trim();

            _state.historico.push({ role: 'personagem', content: reply });
            _removerTypingPersonagem();
            _adicionarMensagemPersonagem(reply);

        } catch (e) {
            _removerTypingPersonagem();
            _adicionarMensagemPersonagem('Desculpe, parece que minha conexão com o passado está instável. Poderia repetir sua pergunta?');
            _state.historico.pop();
            console.error('Erro ao conversar com personagem:', e);
        } finally {
            _setInputEnabled(true);
            _state.carregando = false;
        }
    }

    
    function _adicionarMensagemAluno(texto) {
        const chatArea = document.getElementById('vt-chat-area');
        if (!chatArea) return;
        const div = document.createElement('div');
        div.className = 'vt-msg vt-msg-aluno';
        div.innerHTML = `
            <div class="vt-msg-bubble vt-bubble-aluno">
                <div class="vt-msg-who">Você</div>
                <div class="vt-msg-text">${_formatMd(texto)}</div>
            </div>
            <div class="vt-msg-avatar">🧑‍🎓</div>
        `;
        chatArea.appendChild(div);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    function _adicionarMensagemPersonagem(texto) {
        const chatArea = document.getElementById('vt-chat-area');
        if (!chatArea) return;
        const div = document.createElement('div');
        div.className = 'vt-msg vt-msg-personagem';
        div.innerHTML = `
            <div class="vt-msg-avatar">${_state.personagem.avatar}</div>
            <div class="vt-msg-bubble vt-bubble-personagem">
                <div class="vt-msg-who">${_state.personagem.nome}</div>
                <div class="vt-msg-text">${_formatMd(texto)}</div>
            </div>
        `;
        chatArea.appendChild(div);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    function _mostrarTypingPersonagem() {
        const chatArea = document.getElementById('vt-chat-area');
        if (!chatArea) return;
        const div = document.createElement('div');
        div.className = 'vt-msg vt-msg-personagem';
        div.id = 'vt-typing-personagem';
        div.innerHTML = `
            <div class="vt-msg-avatar">${_state.personagem.avatar}</div>
            <div class="vt-msg-bubble vt-bubble-personagem vt-typing-bubble">
                <span></span><span></span><span></span>
            </div>
        `;
        chatArea.appendChild(div);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    function _removerTypingPersonagem() {
        document.getElementById('vt-typing-personagem')?.remove();
    }

    function _setInputEnabled(enabled) {
        const inp = document.getElementById('vt-input');
        const btn = document.getElementById('vt-send-btn');
        if (inp) inp.disabled = !enabled;
        if (btn) btn.disabled = !enabled;
    }

    
    function _buildSystemPrompt() {
        const personagem = _state.personagem;
        return personagem.contexto;
    }

    function _buildHistoricoTexto() {

        const historicoRecente = _state.historico.slice(-8);
        return historicoRecente.map(m =>
            `${m.role === 'aluno' ? 'Aluno' : _state.personagem.nome}: ${m.content}`
        ).join('\n\n');
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
        if (document.getElementById('vt-styles')) return;
        const style = document.createElement('style');
        style.id = 'vt-styles';
        style.textContent = `

.vt-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.82);
    backdrop-filter: blur(8px);
    z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: vt-fade 0.2s ease;
}
@keyframes vt-fade { from { opacity: 0; } to { opacity: 1; } }

.vt-box {
    width: min(900px, 96vw);
    height: min(700px, 94vh);
    background: linear-gradient(145deg, #0a0c14 0%, #0d0f1a 50%, #080a12 100%);
    border-radius: 24px;
    display: flex; flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03) inset;
    animation: vt-rise 0.3s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes vt-rise { from { opacity:0; transform:translateY(30px) scale(0.96); } to { opacity:1; transform:none; } }


.vt-header {
    padding: 18px 28px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex; justify-content: space-between; align-items: center;
    flex-shrink: 0;
    background: rgba(255,255,255,0.015);
}
.vt-header-left { display: flex; align-items: center; gap: 14px; }
.vt-header-icon { font-size: 28px; }
.vt-header-title { margin: 0; font-size: 20px; color: #fff; font-family: 'DM Serif Display', serif; letter-spacing: -0.3px; }
.vt-header-sub { margin: 2px 0 0; font-size: 11px; color: rgba(255,255,255,0.3); letter-spacing: 0.04em; }
.vt-header-right { display: flex; align-items: center; gap: 12px; }
.vt-close-btn {
    background: rgba(255,255,255,0.07); border: none; color: rgba(255,255,255,0.5);
    font-size: 18px; cursor: pointer; width: 36px; height: 36px;
    border-radius: 10px; display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
}
.vt-close-btn:hover { background: rgba(248,113,113,0.15); color: #f87171; }


.vt-body { flex: 1; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.06) transparent; }


.vt-selecao-wrap { padding: 32px; display: flex; flex-direction: column; gap: 28px; }
.vt-selecao-intro {
    background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05));
    border: 1px solid rgba(99,102,241,0.2);
    border-radius: 18px; padding: 28px; text-align: center;
}
.vt-selecao-intro h3 { margin: 0 0 10px; color: #fff; font-family: 'DM Serif Display', serif; font-size: 22px; }
.vt-selecao-intro p { margin: 0; color: rgba(255,255,255,0.55); font-size: 14px; line-height: 1.6; }

.vt-custom-input-wrap {
    margin-top: 20px;
    display: flex;
    gap: 10px;
    justify-content: center;
}
.vt-custom-input-wrap input {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 12px 18px;
    color: #fff;
    outline: none;
    width: 320px;
    font-size: 14px;
    transition: border-color 0.2s;
}
.vt-custom-input-wrap input:focus { border-color: rgba(99,102,241,0.5); }
.vt-custom-btn {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none; border-radius: 12px; padding: 0 24px;
    color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
    transition: all 0.2s;
}
.vt-custom-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.4); }

.vt-personagens-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
.vt-personagem-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; padding: 18px 20px;
    display: flex; align-items: center; gap: 14px;
    cursor: pointer; text-align: left;
    transition: all 0.2s; position: relative; overflow: hidden;
    color: inherit;
}
.vt-personagem-card::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 3px; background: var(--personagem-cor, #6366f1);
    border-radius: 3px 0 0 3px; opacity: 0; transition: opacity 0.2s;
}
.vt-personagem-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15); transform: translateY(-4px); }
.vt-personagem-card:hover::before { opacity: 1; }
.vt-card-avatar { font-size: 32px; flex-shrink: 0; }
.vt-card-info { flex: 1; min-width: 0; }
.vt-card-nome { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 4px; }
.vt-card-epoca { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.4); margin-bottom: 3px; }
.vt-card-desc { font-size: 12px; color: rgba(255,255,255,0.5); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.vt-card-arrow { color: rgba(255,255,255,0.2); font-size: 18px; flex-shrink: 0; transition: transform 0.2s; }
.vt-personagem-card:hover .vt-card-arrow { transform: translateX(4px); color: var(--personagem-cor); }


.vt-conversa-wrap { display: flex; flex-direction: column; height: 100%; }
.vt-chat-header {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    background: rgba(255,255,255,0.015);
    flex-shrink: 0;
}
.vt-back-btn {
    background: none; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.4);
    border-radius: 10px; padding: 7px 14px; font-size: 12px; cursor: pointer;
    transition: all 0.2s;
}
.vt-back-btn:hover { color: #fff; border-color: rgba(255,255,255,0.3); }
.vt-chat-personagem-info { display: flex; align-items: center; gap: 10px; flex: 1; }
.vt-chat-avatar { font-size: 28px; }
.vt-chat-nome { font-size: 16px; font-weight: 700; color: #fff; }
.vt-chat-epoca { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.4); }
.vt-clear-chat-btn {
    background: rgba(255,255,255,0.07); border: none; color: rgba(255,255,255,0.5);
    font-size: 14px; cursor: pointer; padding: 8px 12px; border-radius: 10px;
    transition: all 0.2s;
}
.vt-clear-chat-btn:hover { background: rgba(248,113,113,0.15); color: #f87171; }

.vt-chat-area {
    flex: 1; overflow-y: auto; padding: 20px;
    display: flex; flex-direction: column; gap: 16px;
    scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.05) transparent;
}
.vt-chat-start {
    text-align: center; padding: 20px;
    background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.15);
    border-radius: 16px; font-size: 14px; color: rgba(255,255,255,0.6);
    max-width: 600px; margin: 20px auto;
}
.vt-chat-start-icon { font-size: 48px; margin-bottom: 12px; }
.vt-chat-start strong { color: #fff; }
.vt-dicas-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 16px; }
.vt-chip {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px; padding: 8px 14px; font-size: 12px; color: rgba(255,255,255,0.55);
    cursor: pointer; transition: all 0.2s;
}
.vt-chip:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.3); color: #a5b4fc; }

.vt-msg { display: flex; gap: 10px; max-width: 85%; animation: vt-msg-in 0.25s ease; }
@keyframes vt-msg-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
.vt-msg-aluno { align-self: flex-end; flex-direction: row-reverse; }
.vt-msg-personagem    { align-self: flex-start; }
.vt-msg-avatar { font-size: 24px; flex-shrink: 0; margin-top: 4px; }
.vt-msg-bubble { border-radius: 16px; padding: 12px 16px; max-width: 100%; }
.vt-bubble-aluno {
    background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2));
    border: 1px solid rgba(99,102,241,0.3);
    border-radius: 16px 16px 4px 16px;
}
.vt-bubble-personagem {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 16px 16px 16px 4px;
}
.vt-msg-who { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
.vt-msg-text { font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.85); }
.vt-msg-text strong { color: #fff; }
.vt-msg-text code { background: rgba(255,255,255,0.08); padding: 1px 5px; border-radius: 4px; font-family: monospace; font-size: 12px; }

.vt-typing-bubble { display: flex; align-items: center; gap: 6px; padding: 14px 18px !important; }
.vt-typing-bubble span { width: 8px; height: 8px; background: rgba(255,255,255,0.35); border-radius: 50%; animation: vt-bounce 1.2s infinite; }
.vt-typing-bubble span:nth-child(2) { animation-delay: 0.2s; }
.vt-typing-bubble span:nth-child(3) { animation-delay: 0.4s; }
@keyframes vt-bounce { 0%,80%,100%{transform:scale(0.8);opacity:0.4}40%{transform:scale(1.2);opacity:1} }

.vt-input-area { border-top: 1px solid rgba(255,255,255,0.06); padding: 14px 20px 16px; flex-shrink: 0; display: flex; align-items: flex-end; gap: 10px; }
.vt-textarea {
    flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px; padding: 12px 16px; color: #fff; outline: none;
    font-size: 14px; line-height: 1.6; resize: none; font-family: inherit;
    transition: border-color 0.2s; box-sizing: border-box;
    max-height: 120px;
}
.vt-textarea:focus { border-color: rgba(99,102,241,0.4); }
.vt-textarea:disabled { opacity: 0.4; }
.vt-send-btn {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none; border-radius: 10px; padding: 10px 16px;
    color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
    transition: all 0.2s; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
}
.vt-send-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.4); }
.vt-send-btn:disabled { opacity: 0.4; transform: none; cursor: not-allowed; }


@media (max-width: 640px) {
    .vt-header { padding: 14px 18px; }
    .vt-header-title { font-size: 18px; }
    .vt-header-sub { display: none; }
    .vt-close-btn { width: 30px; height: 30px; font-size: 16px; }

    .vt-selecao-wrap { padding: 20px; }
    .vt-selecao-intro h3 { font-size: 18px; }
    .vt-selecao-intro p { font-size: 13px; }
    
    .vt-custom-input-wrap { flex-direction: column; align-items: stretch; }
    .vt-custom-input-wrap input { width: 100%; }
    .vt-custom-btn { height: 44px; }

    .vt-personagens-grid { grid-template-columns: 1fr; }
    .vt-card-avatar { font-size: 28px; }
    .vt-card-nome { font-size: 15px; }
    .vt-card-desc { font-size: 11px; }

    .vt-chat-header { padding: 10px 14px; }
    .vt-back-btn { padding: 5px 10px; font-size: 11px; }
    .vt-chat-avatar { font-size: 24px; }
    .vt-chat-nome { font-size: 14px; }
    .vt-chat-epoca { display: none; }
    .vt-clear-chat-btn { padding: 6px 10px; font-size: 12px; }

    .vt-chat-area { padding: 14px; }
    .vt-chat-start { padding: 15px; font-size: 13px; }
    .vt-chat-start-icon { font-size: 40px; }
    .vt-chip { padding: 6px 10px; font-size: 11px; }

    .vt-msg { max-width: 95%; }
    .vt-msg-text { font-size: 13px; }
    .vt-input-area { padding: 10px 14px; }
    .vt-textarea { font-size: 13px; }
    .vt-send-btn { padding: 8px 12px; font-size: 13px; }
}
        `;
        document.head.appendChild(style);
    }

    
    (function injetarNoMundo() {
        function add() {

            const menus = document.querySelectorAll('.mt-dropdown-content:not(.vt-processed)');
            if (!menus.length) return;

            menus.forEach(menu => {

                menu.classList.add('vt-processed');


                const btn = document.createElement('button');
                btn.innerHTML = '⏳ Viagem no Tempo';
                btn.onclick = (e) => {
                    e.stopPropagation();
                    menu.classList.remove('show');
                    ViagemTempo.abrir();
                };


                const refBtn = Array.from(menu.querySelectorAll('button')).find(b => b.innerText.includes('Finanças & Mercado'));
                if (refBtn) {
                    menu.insertBefore(btn, refBtn.nextSibling);
                } else {

                    const sep = menu.querySelector('.mt-dropdown-sep');
                    if (sep) menu.insertBefore(btn, sep);
                    else menu.appendChild(btn);
                }
            });
        }


        const observer = new MutationObserver(() => add());
        observer.observe(document.body, { childList: true, subtree: true });
        add();
    })();


    
    return {
        abrir,
        fechar,
        _selecionarPersonagem,
        _selecionarCustomizado,
        _renderEscolhaPersonagem,
        _enviarMensagem,
        _handleKey,
        _usarChip,
        _limparConversa,
    };
})();

window.ViagemTempo = ViagemTempo;