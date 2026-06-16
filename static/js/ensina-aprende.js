
const EnsinaQueAprende = (() => {
    const MODAL_ID = 'modal-ensina-aprende';
    const API_URL = '/api/ai/chat';

    let _state = {
        fase: 'selecao', 
        conceito: '',
        historico: [], 
        rodada: 0,
        maxRodadas: 5, 
        avaliacao: null,
    };

    
    function abrir() {
        document.getElementById(MODAL_ID)?.remove();
        _injectStyles();
        _resetState();

        const modal = document.createElement('div');
        modal.id = MODAL_ID;
        modal.className = 'ea-overlay';
        modal.innerHTML = `
            <div class="ea-box" id="ea-box">
                <div class="ea-header">
                    <div class="ea-header-left">
                        <div class="ea-header-icon">🧠</div>
                        <div>
                            <h2 class="ea-header-title">Ensina que Aprende</h2>
                            <p class="ea-header-sub">Explique um conceito para a IA e teste seu conhecimento</p>
                        </div>
                    </div>
                    <div class="ea-header-right">
                        <div class="ea-phase-badge" id="ea-phase-badge">Escolha o Conceito</div>
                        <button class="ea-close-btn" onclick="EnsinaQueAprende.fechar()" title="Fechar">✕</button>
                    </div>
                </div>
                <div class="ea-body" id="ea-body"></div>
            </div>
        `;
        document.body.appendChild(modal);
        _renderSelecaoConceito();
    }

    function fechar() {
        document.getElementById(MODAL_ID)?.remove();
    }

    function _resetState() {
        _state = {
            fase: 'selecao',
            conceito: '',
            historico: [],
            carregando: false,
            rodada: 0,
            maxRodadas: 5,
            avaliacao: null,
        };
    }


    function _renderSelecaoConceito() {
        _state.fase = 'selecao';
        _setPhaseBadge('Escolha o Conceito');
        const body = document.getElementById('ea-body');
        if (!body) return;

        body.innerHTML = `
            <div class="ea-selecao-wrap">
                <div class="ea-selecao-intro">
                    <div class="ea-intro-icon">💡</div>
                    <h3>Como funciona o "Ensina que Aprende"?</h3>
                    <p>Você escolhe um conceito e o explica para a IA, que agirá como um aluno mais novo. A IA fará perguntas para testar seu entendimento. Ao final, você receberá uma avaliação detalhada sobre sua explicação e compreensão do tema.</p>
                    <div class="ea-intro-steps">
                        <div class="ea-step"><span class="ea-step-num">1</span><span>Escolha um conceito</span></div>
                        <div class="ea-step"><span class="ea-step-num">2</span><span>Explique para a IA (aluno mais novo)</span></div>
                        <div class="ea-step"><span class="ea-step-num">3</span><span>Responda às perguntas da IA</span></div>
                        <div class="ea-step"><span class="ea-step-num">4</span><span>Receba avaliação e feedback</span></div>
                    </div>
                </div>

                <div class="ea-conceito-input-wrap">
                    <h4>Qual conceito você quer explicar?</h4>
                    <input type="text" id="ea-conceito-input" placeholder="Ex: Fotossíntese, Teorema de Pitágoras, Revolução Francesa..." 
                        onkeydown="if(event.key==='Enter') EnsinaQueAprende._selecionarConceito(this.value)"/>
                    <button class="ea-start-btn" onclick="EnsinaQueAprende._selecionarConceito(document.getElementById('ea-conceito-input').value)">Começar a Explicar</button>
                </div>
            </div>
        `;
    }

    async function _selecionarConceito(conceito) {
        conceito = conceito.trim();
        if (!conceito) {
            _shakeElement('ea-conceito-input');
            return;
        }
        _state.conceito = conceito;
        _state.fase = 'explicacao';
        _iniciarExplicacao();
    }

    async function _iniciarExplicacao() {
        _state.fase = 'explicacao';
        _state.rodada = 0;
        _state.historico = [];
        _setPhaseBadge(`Explicando: Rodada 1/${_state.maxRodadas}`);

        const body = document.getElementById('ea-body');
        if (!body) return;

        body.innerHTML = `
            <div class="ea-chat-wrap">
                <div class="ea-chat-header">
                    <button class="ea-back-btn" onclick="EnsinaQueAprende._renderSelecaoConceito()">← Mudar Conceito</button>
                    <div class="ea-chat-conceito">
                        <div class="ea-chat-conceito-icon">💡</div>
                        <div class="ea-chat-conceito-nome">${_state.conceito}</div>
                    </div>
                    <button class="ea-clear-chat-btn" onclick="EnsinaQueAprende._limparConversa()">🗑️ Limpar</button>
                </div>

                <div class="ea-chat-area" id="ea-chat-area">
                    <div class="ea-chat-start">
                        <div class="ea-chat-start-icon">🤖</div>
                        <p>Olá, professor! Eu sou o seu aluno. Estou aqui para aprender sobre <strong>${_state.conceito}</strong>. Pode me explicar o que é?</p>
                    </div>
                </div>

                <div class="ea-input-area">
                    <textarea
                        id="ea-input"
                        class="ea-textarea"
                        placeholder="Comece a explicar o conceito de ${_state.conceito}..."
                        rows="1"
                        onkeydown="EnsinaQueAprende._handleKey(event)"
                        oninput="this.style.height='auto'; this.style.height=(this.scrollHeight)+'px';"
                    ></textarea>
                    <button class="ea-send-btn" id="ea-send-btn" onclick="EnsinaQueAprende._enviarExplicacao()">
                        <span>Explicar</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z"/></svg>
                    </button>
                </div>
                <div class="ea-controls-bottom">
                    <button class="ea-btn-secondary" onclick="EnsinaQueAprende._iniciarAvaliacao()">Finalizar e Avaliar</button>
                </div>
            </div>
        `;
        
        const chatArea = document.getElementById('ea-chat-area');
        if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
    }

    function _limparConversa() {
        _state.historico = [];
        _iniciarExplicacao(); 
    }

    function _handleKey(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            _enviarExplicacao();
        }
    }

    async function _enviarExplicacao() {
        if (_state.carregando) return;
        const inp = document.getElementById('ea-input');
        if (!inp) return;
        const texto = inp.value.trim();
        if (!texto) return;

        _state.carregando = true;
        inp.value = '';
        inp.style.height = 'auto'; 
        _setInputEnabled(false);

        _adicionarMensagemAluno(texto);
        _state.historico.push({ role: 'aluno', content: texto });

        _state.rodada++;
        _setPhaseBadge(`Explicando: Rodada ${_state.rodada + 1}/${_state.maxRodadas}`);

        if (_state.rodada >= _state.maxRodadas) {
            _iniciarAvaliacao();
            return;
        }

        _mostrarTypingIA();

        try {
            const personaPrompt = _buildYoungerStudentPersonaPrompt();
            const historicoTexto = _buildHistoricoTexto();
            const mensagemParaIA = `${historicoTexto}\n\nProfessor explica: "${texto}"\n\nAgora, faça uma pergunta que mostre que você não entendeu algo ou que revele uma lacuna na explicação do professor. Seja um aluno curioso e um pouco confuso.`;

            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: mensagemParaIA, context: personaPrompt })
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            const reply = (data.response || '').trim();

            _state.historico.push({ role: 'ia', content: reply });
            _removerTypingIA();
            _adicionarMensagemIA(reply);

        } catch (e) {
            _removerTypingIA();
            _adicionarMensagemIA('Desculpe, professor, acho que não entendi. Pode repetir?');
            _state.historico.pop(); 
            _state.rodada--;
            console.error('Erro ao interagir com IA:', e);
        } finally {
            _setInputEnabled(true);
            _state.carregando = false;
        }
    }

  
    async function _iniciarAvaliacao() {
        _setPhaseBadge('Avaliando...');
        _state.fase = 'avaliacao';
        const body = document.getElementById('ea-body');
        if (!body) return;

        body.innerHTML = `
            <div class="ea-eval-loading">
                <div class="ea-eval-spinner"></div>
                <div class="ea-eval-loading-text">
                    <h3>Analisando sua explicação...</h3>
                    <p>A IA está avaliando sua clareza, didática e a profundidade do seu entendimento sobre "${_state.conceito}".</p>
                </div>
            </div>
        `;

        try {
            const evaluationPrompt = _buildEvaluationPrompt();
            const historicoTexto = _buildHistoricoTexto();

            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: historicoTexto,
                    context: evaluationPrompt
                })
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            let raw = (data.response || '').trim();

            raw = raw.replace(/```json|```/g, '').trim();
            _state.avaliacao = JSON.parse(raw);
            _renderAvaliacao();
        } catch (e) {
            console.error('Erro na avaliação da IA:', e);
            _state.avaliacao = {
                nota_total: 50,
                feedback_geral: 'Não foi possível obter uma avaliação detalhada. Verifique sua conexão ou tente novamente.',
                lacunas_expostas: ['Conexão com a IA falhou.'],
                pontos_fortes: ['Tentou explicar o conceito.'],
                pontos_melhorar: ['Conexão com a IA.'],
                dica_final: 'Tente novamente mais tarde.'
            };
            _renderAvaliacao();
        }
    }

    function _renderAvaliacao() {
        _setPhaseBadge('Resultado da Avaliação');
        const body = document.getElementById('ea-body');
        if (!body) return;

        const aval = _state.avaliacao;
        const nota = aval.nota_total || 0;
        const emoji = nota >= 80 ? '🏆' : nota >= 60 ? '👍' : '📚';
        const corNota = nota >= 80 ? '#4ade80' : nota >= 60 ? '#fbbf24' : '#f87171';

        body.innerHTML = `
            <div class="ea-result-wrap">
                <div class="ea-result-hero" style="--nota-cor:${corNota}">
                    <div class="ea-result-emoji">${emoji}</div>
                    <div class="ea-result-info">
                        <div class="ea-result-nota" style="color:${corNota}">${nota}<span>/100</span></div>
                        <div class="ea-result-conceito">Conceito: <strong>${_state.conceito}</strong></div>
                    </div>
                </div>

                <div class="ea-result-feedback">
                    <h4>💬 Feedback Geral</h4>
                    <p>${aval.feedback_geral || ''}</p>

                    <h4>💡 Lacunas Expostas</h4>
                    <ul>
                        ${(aval.lacunas_expostas || []).map(l => `<li>${l}</li>`).join('')}
                    </ul>

                    <div class="ea-feedback-cols">
                        <div class="ea-feedback-col ea-col-bom">
                            <h5>✅ Pontos Fortes</h5>
                            <ul>
                                ${(aval.pontos_fortes || []).map(p => `<li>${p}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="ea-feedback-col ea-col-melhorar">
                            <h5>📈 Pontos a Melhorar</h5>
                            <ul>
                                ${(aval.pontos_melhorar || []).map(p => `<li>${p}</li>`).join('')}
                            </ul>
                        </div>
                    </div>

                    <div class="ea-dica-final">
                        <span class="ea-dica-final-icon">🎯</span>
                        <div>
                            <strong>Dica do Professor:</strong>
                            <p>${aval.dica_final || ''}</p>
                        </div>
                    </div>
                </div>

                <div class="ea-result-actions">
                    <button class="ea-btn-secondary" onclick="EnsinaQueAprende._verTranscricao()">📜 Ver Transcrição</button>
                    <button class="ea-btn-primary" onclick="EnsinaQueAprende._novoCiclo()">🧠 Novo Conceito</button>
                </div>
            </div>
        `;
    }

    function _verTranscricao() {
        const historico = _state.historico;
        let html = `<div class="ea-transcricao-overlay" id="ea-transcricao-overlay" onclick="if(event.target===this)this.remove()">
            <div class="ea-transcricao-box">
                <div class="ea-transcricao-header">
                    <h3>📜 Transcrição da Explicação</h3>
                    <div style="font-size:13px;color:rgba(255,255,255,0.5);">Conceito: ${_state.conceito}</div>
                    <button onclick="document.getElementById('ea-transcricao-overlay').remove()" style="background:none;border:none;color:rgba(255,255,255,0.5);font-size:20px;cursor:pointer;position:absolute;top:16px;right:20px">✕</button>
                </div>
                <div class="ea-transcricao-body">
                    ${historico.map((m, i) => `
                        <div class="ea-tr-msg ea-tr-${m.role}">
                            <div class="ea-tr-who">${m.role === 'ia' ? `🤖 Aluno (IA)` : `🧑‍🎓 Você (Professor)`}</div>
                            <div class="ea-tr-text">${_formatMd(m.content)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>`;

        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div.firstElementChild);
    }

    function _novoCiclo() {
        _resetState();
        _renderSelecaoConceito();
    }

    function _setPhaseBadge(txt) {
        const el = document.getElementById('ea-phase-badge');
        if (el) el.textContent = txt;
    }

    function _adicionarMensagemAluno(texto) {
        const chatArea = document.getElementById('ea-chat-area');
        if (!chatArea) return;
        const div = document.createElement('div');
        div.className = 'ea-msg ea-msg-aluno';
        div.innerHTML = `
            <div class="ea-msg-bubble ea-bubble-aluno">
                <div class="ea-msg-who">Você (Professor)</div>
                <div class="ea-msg-text">${_formatMd(texto)}</div>
            </div>
            <div class="ea-msg-avatar">🧑‍🎓</div>
        `;
        chatArea.appendChild(div);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    function _adicionarMensagemIA(texto) {
        const chatArea = document.getElementById('ea-chat-area');
        if (!chatArea) return;
        const div = document.createElement('div');
        div.className = 'ea-msg ea-msg-ia';
        div.innerHTML = `
            <div class="ea-msg-avatar">🤖</div>
            <div class="ea-msg-bubble ea-bubble-ia">
                <div class="ea-msg-who">Aluno (IA)</div>
                <div class="ea-msg-text">${_formatMd(texto)}</div>
            </div>
        `;
        chatArea.appendChild(div);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    function _mostrarTypingIA() {
        const chatArea = document.getElementById('ea-chat-area');
        if (!chatArea) return;
        const div = document.createElement('div');
        div.className = 'ea-msg ea-msg-ia';
        div.id = 'ea-typing-ia';
        div.innerHTML = `
            <div class="ea-msg-avatar">🤖</div>
            <div class="ea-msg-bubble ea-bubble-ia ea-typing-bubble">
                <span></span><span></span><span></span>
            </div>
        `;
        chatArea.appendChild(div);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    function _removerTypingIA() {
        document.getElementById('ea-typing-ia')?.remove();
    }

    function _setInputEnabled(enabled) {
        const inp = document.getElementById('ea-input');
        const btn = document.getElementById('ea-send-btn');
        if (inp) inp.disabled = !enabled;
        if (btn) btn.disabled = !enabled;
    }

    function _shakeElement(id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.animation = 'ea-shake 0.3s ease';
        setTimeout(() => el.style.animation = '', 300);
    }

    function _buildYoungerStudentPersonaPrompt() {
        return `Você é um aluno do ensino fundamental, muito curioso, mas com pouco conhecimento sobre "${_state.conceito}". Seu objetivo é entender o que o 'professor' (o aluno real) está explicando. Faça perguntas simples, que revelem lacunas na explicação, peça exemplos práticos, ou mostre confusão em pontos que não foram claros. Não seja rude, apenas genuinamente confuso ou curioso. Use linguagem informal e adequada a um aluno mais novo. Não dê respostas, apenas faça perguntas ou peça para o 'professor' explicar melhor. Se o 'professor' usar termos muito complexos, peça para simplificar.`;
    }

    function _buildEvaluationPrompt() {
        return `Você é um professor experiente em pedagogia e avaliação. Analise a explicação que o 'aluno' (o usuário) deu sobre "${_state.conceito}" para um 'aluno mais novo' (a IA). Avalie a clareza, profundidade, didática, e a capacidade do 'aluno' de responder a dúvidas e simplificar conceitos. Identifique lacunas no entendimento do 'aluno' que foram expostas pelas perguntas da IA. Forneça uma nota de 0 a 100 e um feedback estruturado, comparando o que o 'aluno' realmente entendeu versus o que ele achou que entendia.

Responda APENAS com um objeto JSON válido, sem texto antes ou depois, no seguinte formato:
{
  "nota_total": <0-100>,
  "feedback_geral": "<2-3 frases sobre a performance geral>",
  "lacunas_expostas": ["<lacuna 1>", "<lacuna 2>"],
  "pontos_fortes": ["<ponto 1>", "<ponto 2>"],
  "pontos_melhorar": ["<ponto 1>", "<ponto 2>"],
  "dica_final": "<1 dica prática específica para melhorar>"
}`;
    }

    function _buildHistoricoTexto() {
        return _state.historico.map(m =>
            `${m.role === 'ia' ? 'Aluno (IA)' : 'Professor (Você)'}: ${m.content}`
        ).join('\n\n');
    }


    async function _callAI(message, context) {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, context })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Erro ${res.status}`);
        }
        const data = await res.json();
        return data.response || '';
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
        if (document.getElementById('ea-styles')) return;
        const style = document.createElement('style');
        style.id = 'ea-styles';
        style.textContent = `

.ea-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.82);
    backdrop-filter: blur(8px);
    z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: ea-fade 0.2s ease;
}
@keyframes ea-fade { from { opacity: 0; } to { opacity: 1; } }

.ea-box {
    width: min(900px, 96vw);
    height: min(700px, 94vh);
    background: linear-gradient(145deg, #0a0c14 0%, #0d0f1a 50%, #080a12 100%);
    border-radius: 24px;
    display: flex; flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03) inset;
    animation: ea-rise 0.3s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes ea-rise { from { opacity:0; transform:translateY(30px) scale(0.96); } to { opacity:1; transform:none; } }

.ea-header {
    padding: 18px 28px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex; justify-content: space-between; align-items: center;
    flex-shrink: 0;
    background: rgba(255,255,255,0.015);
}
.ea-header-left { display: flex; align-items: center; gap: 14px; }
.ea-header-icon { font-size: 28px; }
.ea-header-title { margin: 0; font-size: 20px; color: #fff; font-family: 'DM Serif Display', serif; letter-spacing: -0.3px; }
.ea-header-sub { margin: 2px 0 0; font-size: 11px; color: rgba(255,255,255,0.3); letter-spacing: 0.04em; }
.ea-header-right { display: flex; align-items: center; gap: 12px; }
.ea-phase-badge {
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px; padding: 5px 14px; font-size: 12px; font-weight: 600;
    color: rgba(255,255,255,0.6); letter-spacing: 0.03em;
}
.ea-close-btn {
    background: rgba(255,255,255,0.07); border: none; color: rgba(255,255,255,0.5);
    font-size: 18px; cursor: pointer; width: 36px; height: 36px;
    border-radius: 10px; display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
}
.ea-close-btn:hover { background: rgba(248,113,113,0.15); color: #f87171; }

.ea-body { flex: 1; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.06) transparent; }

.ea-selecao-wrap { padding: 32px; display: flex; flex-direction: column; gap: 28px; }
.ea-selecao-intro {
    background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05));
    border: 1px solid rgba(99,102,241,0.2);
    border-radius: 18px; padding: 28px; text-align: center;
}
.ea-intro-icon { font-size: 40px; margin-bottom: 12px; }
.ea-selecao-intro h3 { margin: 0 0 10px; color: #fff; font-family: 'DM Serif Display', serif; font-size: 22px; }
.ea-selecao-intro p { margin: 0 0 20px; color: rgba(255,255,255,0.55); font-size: 14px; line-height: 1.6; }
.ea-intro-steps { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.ea-step {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px; padding: 6px 14px; font-size: 12px; color: rgba(255,255,255,0.6);
}
.ea-step-num {
    width: 20px; height: 20px; background: rgba(99,102,241,0.3);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: #818cf8; flex-shrink: 0;
}

.ea-conceito-input-wrap {
    display: flex; flex-direction: column; gap: 15px;
    max-width: 500px; margin: 0 auto;
}
.ea-conceito-input-wrap h4 { margin: 0; color: rgba(255,255,255,0.7); font-size: 16px; font-weight: 600; }
.ea-conceito-input-wrap input {
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; padding: 12px 18px; color: #fff; outline: none;
    font-size: 15px; width: 100%;
    transition: border-color 0.2s;
}
.ea-conceito-input-wrap input:focus { border-color: rgba(99,102,241,0.4); }
.ea-start-btn {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none; border-radius: 12px; padding: 12px 24px;
    color: #fff; font-size: 15px; font-weight: 700; cursor: pointer;
    transition: all 0.2s;
}
.ea-start-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.4); }

.ea-chat-wrap { display: flex; flex-direction: column; height: 100%; }
.ea-chat-header {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    background: rgba(255,255,255,0.015);
    flex-shrink: 0;
}
.ea-back-btn {
    background: none; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.4);
    border-radius: 10px; padding: 7px 14px; font-size: 12px; cursor: pointer;
    transition: all 0.2s;
}
.ea-back-btn:hover { color: #fff; border-color: rgba(255,255,255,0.3); }
.ea-chat-conceito { display: flex; align-items: center; gap: 10px; flex: 1; }
.ea-chat-conceito-icon { font-size: 24px; }
.ea-chat-conceito-nome { font-size: 16px; font-weight: 700; color: #fff; }
.ea-clear-chat-btn {
    background: rgba(255,255,255,0.07); border: none; color: rgba(255,255,255,0.5);
    font-size: 14px; cursor: pointer; padding: 8px 12px; border-radius: 10px;
    transition: all 0.2s;
}
.ea-clear-chat-btn:hover { background: rgba(248,113,113,0.15); color: #f87171; }

.ea-chat-area {
    flex: 1; overflow-y: auto; padding: 20px;
    display: flex; flex-direction: column; gap: 16px;
    scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.05) transparent;
}
.ea-chat-start {
    text-align: center; padding: 20px;
    background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.15);
    border-radius: 16px; font-size: 14px; color: rgba(255,255,255,0.6);
    max-width: 600px; margin: 20px auto;
}
.ea-chat-start-icon { font-size: 48px; margin-bottom: 12px; }
.ea-chat-start strong { color: #fff; }

.ea-msg { display: flex; gap: 10px; max-width: 85%; animation: ea-msg-in 0.25s ease; }
@keyframes ea-msg-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
.ea-msg-aluno { align-self: flex-end; flex-direction: row-reverse; }
.ea-msg-ia    { align-self: flex-start; }
.ea-msg-avatar { font-size: 24px; flex-shrink: 0; margin-top: 4px; }
.ea-msg-bubble { border-radius: 16px; padding: 12px 16px; max-width: 100%; }
.ea-bubble-aluno {
    background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2));
    border: 1px solid rgba(99,102,241,0.3);
    border-radius: 16px 16px 4px 16px;
}
.ea-bubble-ia {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 16px 16px 16px 4px;
}
.ea-msg-who { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
.ea-msg-text { font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.85); }
.ea-msg-text strong { color: #fff; }
.ea-msg-text code { background: rgba(255,255,255,0.08); padding: 1px 5px; border-radius: 4px; font-family: monospace; font-size: 12px; }

.ea-typing-bubble { display: flex; align-items: center; gap: 6px; padding: 14px 18px !important; }
.ea-typing-bubble span { width: 8px; height: 8px; background: rgba(255,255,255,0.35); border-radius: 50%; animation: ea-bounce 1.2s infinite; }
.ea-typing-bubble span:nth-child(2) { animation-delay: 0.2s; }
.ea-typing-bubble span:nth-child(3) { animation-delay: 0.4s; }
@keyframes ea-bounce { 0%,80%,100%{transform:scale(0.8);opacity:0.4}40%{transform:scale(1.2);opacity:1} }

.ea-input-area { border-top: 1px solid rgba(255,255,255,0.06); padding: 14px 20px 16px; flex-shrink: 0; display: flex; align-items: flex-end; gap: 10px; }
.ea-textarea {
    flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px; padding: 12px 16px; color: #fff; outline: none;
    font-size: 14px; line-height: 1.6; resize: none; font-family: inherit;
    transition: border-color 0.2s; box-sizing: border-box;
    max-height: 120px;
}
.ea-textarea:focus { border-color: rgba(99,102,241,0.4); }
.ea-textarea:disabled { opacity: 0.4; }
.ea-send-btn {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none; border-radius: 10px; padding: 10px 16px;
    color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
    transition: all 0.2s; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
}
.ea-send-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.4); }
.ea-send-btn:disabled { opacity: 0.4; transform: none; cursor: not-allowed; }

.ea-controls-bottom {
    padding: 0 20px 14px; text-align: right;
}
.ea-btn-secondary {
    background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; padding: 8px 16px; color: rgba(255,255,255,0.6);
    font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.ea-btn-secondary:hover { background: rgba(255,255,255,0.1); color: #fff; }

/* ══ FASE 3: AVALIAÇÃO — LOADING ══ */
.ea-eval-loading {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 100%; gap: 24px; padding: 40px;
}
.ea-eval-spinner {
    width: 56px; height: 56px;
    border: 3px solid rgba(99,102,241,0.15);
    border-top-color: #6366f1;
    border-radius: 50%; animation: ea-spin 0.7s linear infinite;
}
@keyframes ea-spin { to { transform: rotate(360deg); } }
.ea-eval-loading-text { text-align: center; }
.ea-eval-loading-text h3 { margin: 0 0 8px; color: #fff; font-family: 'DM Serif Display', serif; font-size: 22px; }
.ea-eval-loading-text p { margin: 0; color: rgba(255,255,255,0.45); font-size: 14px; max-width: 400px; }


.ea-result-wrap { padding: 28px 32px; display: flex; flex-direction: column; gap: 22px; }

.ea-result-hero {
    background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05));
    border: 1px solid rgba(99,102,241,0.2);
    border-radius: 20px; padding: 28px;
    display: flex; align-items: center; gap: 24px;
}
.ea-result-emoji { font-size: 56px; flex-shrink: 0; }
.ea-result-info { flex: 1; }
.ea-result-nota {
    font-size: 56px; font-weight: 900; line-height: 1; color: var(--nota-cor, #4ade80);
    font-family: 'DM Mono', monospace;
}
.ea-result-nota span { font-size: 20px; color: rgba(255,255,255,0.3); }
.ea-result-conceito { font-size: 14px; color: rgba(255,255,255,0.35); margin-top: 6px; }

.ea-result-feedback { display: flex; flex-direction: column; gap: 16px; }
.ea-result-feedback h4 { margin: 0 0 10px; color: #fff; font-size: 15px; }
.ea-result-feedback p, .ea-result-feedback ul { margin: 0; font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.7; }
.ea-result-feedback ul { padding-left: 20px; }
.ea-result-feedback li { margin-bottom: 5px; }

.ea-feedback-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ea-feedback-col { border-radius: 14px; padding: 16px 18px; }
.ea-col-bom { background: rgba(74,222,128,0.05); border: 1px solid rgba(74,222,128,0.15); }
.ea-col-melhorar { background: rgba(251,191,36,0.05); border: 1px solid rgba(251,191,36,0.15); }
.ea-feedback-col h5 { margin: 0 0 10px; font-size: 13px; color: rgba(255,255,255,0.7); }
.ea-col-bom h5 { color: #4ade80; }
.ea-col-melhorar h5 { color: #fbbf24; }
.ea-feedback-col ul { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 5px; }
.ea-feedback-col li { font-size: 12px; color: rgba(255,255,255,0.55); line-height: 1.5; }

.ea-dica-final {
    display: flex; gap: 12px; align-items: flex-start;
    background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.2);
    border-radius: 14px; padding: 16px 18px;
}
.ea-dica-final-icon { font-size: 22px; flex-shrink: 0; }
.ea-dica-final strong { font-size: 13px; color: #a5b4fc; display: block; margin-bottom: 4px; }
.ea-dica-final p { margin: 0; font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.6; }

.ea-result-actions { display: flex; justify-content: flex-end; gap: 12px; padding-bottom: 4px; }
.ea-btn-primary {
    padding: 12px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none; border-radius: 12px; color: #fff; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
}
.ea-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(99,102,241,0.4); }
.ea-btn-secondary {
    padding: 12px 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; color: rgba(255,255,255,0.6); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
}
.ea-btn-secondary:hover { background: rgba(255,255,255,0.08); color: #fff; }


.ea-transcricao-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 20000;
    display: flex; align-items: center; justify-content: center; padding: 16px;
}
.ea-transcricao-box {
    width: min(680px, 94vw); height: min(600px, 90vh);
    background: #0d0f1a; border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.08);
    display: flex; flex-direction: column; overflow: hidden;
}
.ea-transcricao-header { padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); position: relative; }
.ea-transcricao-header h3 { margin: 0 0 4px; color: #fff; font-family: 'DM Serif Display', serif; font-size: 18px; }
.ea-transcricao-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 14px; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.05) transparent; }
.ea-tr-msg { border-radius: 14px; padding: 14px 16px; }
.ea-tr-aluno { background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.15); }
.ea-tr-ia    { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); }
.ea-tr-who { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: rgba(255,255,255,0.3); margin-bottom: 8px; }
.ea-tr-text { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6; }


@keyframes ea-shake { 0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-5px)}40%,80%{transform:translateX(5px)} }

@media (max-width: 640px) {
    .ea-header { padding: 14px 18px; }
    .ea-header-title { font-size: 18px; }
    .ea-header-sub { display: none; }
    .ea-close-btn { width: 30px; height: 30px; font-size: 16px; }

    .ea-selecao-wrap { padding: 20px; }
    .ea-selecao-intro h3 { font-size: 18px; }
    .ea-selecao-intro p { font-size: 13px; }
    .ea-conceito-input-wrap input { width: 100%; }
    .ea-start-btn { height: 44px; }

    .ea-chat-header { padding: 10px 14px; }
    .ea-back-btn { padding: 5px 10px; font-size: 11px; }
    .ea-chat-conceito-icon { font-size: 20px; }
    .ea-chat-conceito-nome { font-size: 14px; }
    .ea-clear-chat-btn { padding: 6px 10px; font-size: 12px; }

    .ea-chat-area { padding: 14px; }
    .ea-chat-start { padding: 15px; font-size: 13px; }
    .ea-chat-start-icon { font-size: 40px; }

    .ea-msg { max-width: 95%; }
    .ea-msg-text { font-size: 13px; }
    .ea-input-area { padding: 10px 14px; }
    .ea-textarea { font-size: 13px; }
    .ea-send-btn { padding: 8px 12px; font-size: 13px; }
    .ea-controls-bottom { padding: 0 14px 10px; }
    .ea-btn-secondary { padding: 8px 12px; font-size: 12px; }

    .ea-result-hero { flex-direction: column; text-align: center; }
    .ea-result-emoji { margin-bottom: 10px; }
    .ea-result-nota { font-size: 48px; }
    .ea-result-nota span { font-size: 18px; }
    .ea-result-conceito { font-size: 13px; }
    .ea-feedback-cols { grid-template-columns: 1fr; }
}
        `;
        document.head.appendChild(style);
    }


    (function injetarNoMundo() {
        function add() {
            const menus = document.querySelectorAll('.mt-dropdown-content:not(.ea-processed)');
            if (!menus.length) return;

            menus.forEach(menu => {
                menu.classList.add('ea-processed');

                const btn = document.createElement('button');
                btn.innerHTML = '🧠 Ensina que Aprende';
                btn.onclick = (e) => {
                    e.stopPropagation();
                    menu.classList.remove('show');
                    EnsinaQueAprende.abrir();
                };

               
                const refBtn = Array.from(menu.querySelectorAll('button')).find(b => b.innerText.includes('Debate com IA'));
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
        _selecionarConceito,
        _renderSelecaoConceito, 
        _enviarExplicacao,
        _handleKey,
        _limparConversa,
        _iniciarAvaliacao, 
        _verTranscricao,
        _novoCiclo,
    };
})();

window.EnsinaQueAprende = EnsinaQueAprende;