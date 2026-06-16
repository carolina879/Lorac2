
const ModoDuelo = (() => {
  const API = ''; // Vazio para usar o host atual (evita erros de conexão)

 
  let _state = {
    fase: 'menu',      
    questoes: [],
    qi: 0,            
    vidas: 3,
    xp: 0,
    streak: 0,
    maxStreak: 0,
    acertos: 0,
    respondida: false,
    escolha: null,
    totalXpSessao: 0,
  };

 
  const TEMAS = [
    { emoji: '📐', label: 'Matemática' },
    { emoji: '⚗️', label: 'Química' },
    { emoji: '⚡', label: 'Física' },
    { emoji: '🧬', label: 'Biologia' },
    { emoji: '🌍', label: 'Geografia' },
    { emoji: '📜', label: 'História' },
    { emoji: '📖', label: 'Português' },
    { emoji: '🗣️', label: 'Inglês' },
    { emoji: '💻', label: 'Programação' },
    { emoji: '🎨', label: 'Artes' },
    { emoji: '🏛️', label: 'Filosofia' },
    { emoji: '📊', label: 'Estatística' },
  ];

  
  function _injectCSS() {
    if (document.getElementById('duelo-css')) return;
    const s = document.createElement('style');
    s.id = 'duelo-css';
    s.textContent = `
      #duelo-overlay {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.88);
        backdrop-filter: blur(8px);
        z-index: 10000;
        display: flex; align-items: center; justify-content: center;
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        animation: duelo-fadein .25s ease;
      }
      @keyframes duelo-fadein { from { opacity:0 } to { opacity:1 } }

      #duelo-box {
        background: var(--bg-1, #151210);
        border: 1px solid var(--border, #3a3228);
        border-radius: 24px;
        width: 100%; max-width: 580px;
        max-height: 95vh;
        display: flex; flex-direction: column;
        overflow: hidden;
        box-shadow: 0 32px 80px rgba(0,0,0,0.7);
        position: relative;
      }

   
      .duelo-topbar {
        display: flex; align-items: center; gap: 12px;
        padding: 16px 20px;
        border-bottom: 1px solid var(--border, #3a3228);
        background: var(--bg-2, #1a1612);
        flex-shrink: 0;
      }
      .duelo-close-btn {
        background: none; border: none; cursor: pointer;
        color: var(--text-2, #8a7a6a); font-size: 20px;
        padding: 4px; line-height: 1; flex-shrink: 0;
        transition: color .15s;
      }
      .duelo-close-btn:hover { color: var(--text-0, #f0e8df); }

   
      .duelo-vidas { display: flex; gap: 4px; }
      .duelo-vida { font-size: 18px; transition: all .3s; }
      .duelo-vida.perdida { opacity: .2; filter: grayscale(1); transform: scale(0.8); }

  
      .duelo-progress-wrap {
        flex: 1; height: 10px;
        background: var(--bg-3, #211d18);
        border-radius: 99px; overflow: hidden;
      }
      .duelo-progress-fill {
        height: 100%; border-radius: 99px;
        background: linear-gradient(90deg, #e8a04a, #f0c060);
        transition: width .5s cubic-bezier(.34,1.56,.64,1);
      }

      .duelo-xp-badge {
        display: flex; align-items: center; gap: 4px;
        background: rgba(232,160,74,.12);
        border: 1px solid rgba(232,160,74,.3);
        border-radius: 99px; padding: 3px 10px;
        font-size: 12px; font-weight: 700; color: #e8a04a;
        white-space: nowrap; flex-shrink: 0;
      }
      .duelo-streak-badge {
        display: flex; align-items: center; gap: 4px;
        background: rgba(255,100,50,.12);
        border: 1px solid rgba(255,100,50,.3);
        border-radius: 99px; padding: 3px 10px;
        font-size: 12px; font-weight: 700; color: #ff7040;
        white-space: nowrap; flex-shrink: 0;
      }

      .duelo-body {
        flex: 1; overflow-y: auto; padding: 28px 28px 20px;
        display: flex; flex-direction: column; gap: 20px;
      }

    
      .duelo-q-num {
        font-size: 11px; font-weight: 700; letter-spacing: .1em;
        text-transform: uppercase; color: var(--text-2, #8a7a6a);
      }
      .duelo-q-texto {
        font-size: 20px; font-weight: 600; line-height: 1.45;
        color: var(--text-0, #f0e8df);
        font-family: var(--font-display, 'DM Serif Display', serif);
      }

      .duelo-alts { display: flex; flex-direction: column; gap: 10px; }
      .duelo-alt {
        display: flex; align-items: center; gap: 14px;
        padding: 14px 18px;
        background: var(--bg-2, #1a1612);
        border: 2px solid var(--border, #3a3228);
        border-radius: 14px; cursor: pointer;
        transition: all .15s; position: relative; overflow: hidden;
        font-size: 15px; color: var(--text-0, #f0e8df);
        text-align: left;
      }
      .duelo-alt:hover:not(:disabled) {
        border-color: #e8a04a;
        background: rgba(232,160,74,.06);
        transform: translateY(-1px);
      }
      .duelo-alt:disabled { cursor: default; }
      .duelo-alt .duelo-alt-letra {
        width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        font-size: 12px; font-weight: 800; letter-spacing: .04em;
        background: var(--bg-3, #211d18);
        border: 1.5px solid var(--border, #3a3228);
        color: var(--text-2, #8a7a6a);
        transition: all .15s;
      }
      .duelo-alt.correta {
        border-color: #60c878 !important;
        background: rgba(96,200,120,.1) !important;
        animation: duelo-pulse-green .4s ease;
      }
      .duelo-alt.correta .duelo-alt-letra {
        background: #60c878; color: #0a1a0d; border-color: #60c878;
      }
      .duelo-alt.errada {
        border-color: #e06060 !important;
        background: rgba(224,96,96,.1) !important;
        animation: duelo-shake .4s ease;
      }
      .duelo-alt.errada .duelo-alt-letra {
        background: #e06060; color: #fff; border-color: #e06060;
      }
      .duelo-alt.gabarito {
        border-color: #60c878 !important;
        background: rgba(96,200,120,.07) !important;
      }
      .duelo-alt.gabarito .duelo-alt-letra {
        background: #60c878; color: #0a1a0d; border-color: #60c878;
      }

      @keyframes duelo-pulse-green {
        0%,100% { box-shadow: 0 0 0 0 rgba(96,200,120,0); }
        50% { box-shadow: 0 0 0 8px rgba(96,200,120,.25); }
      }
      @keyframes duelo-shake {
        0%,100% { transform: translateX(0); }
        20%,60% { transform: translateX(-6px); }
        40%,80% { transform: translateX(6px); }
      }


      .duelo-feedback {
        border-radius: 14px; padding: 14px 18px;
        display: flex; align-items: flex-start; gap: 12px;
        animation: duelo-slidein .25s ease;
        font-size: 14px; line-height: 1.5;
      }
      @keyframes duelo-slidein {
        from { opacity:0; transform: translateY(10px); }
        to   { opacity:1; transform: translateY(0); }
      }
      .duelo-feedback.ok {
        background: rgba(96,200,120,.1);
        border: 1px solid rgba(96,200,120,.3);
        color: #80e098;
      }
      .duelo-feedback.erro {
        background: rgba(224,96,96,.1);
        border: 1px solid rgba(224,96,96,.3);
        color: #e08080;
      }
      .duelo-feedback-icon { font-size: 22px; flex-shrink:0; margin-top:1px; }
      .duelo-feedback strong { display:block; font-size:15px; margin-bottom:2px; }

    
      .duelo-xp-pop {
        position: absolute; top: 50%; left: 50%;
        transform: translate(-50%,-50%);
        font-size: 32px; font-weight: 900; color: #f0c060;
        pointer-events: none; z-index: 10;
        animation: duelo-xp-fly 1s ease forwards;
        text-shadow: 0 2px 12px rgba(0,0,0,.6);
      }
      @keyframes duelo-xp-fly {
        0%   { opacity:1; transform: translate(-50%,-50%) scale(1); }
        60%  { opacity:1; transform: translate(-50%,-130%) scale(1.3); }
        100% { opacity:0; transform: translate(-50%,-200%) scale(0.8); }
      }


      .duelo-btn-next {
        width: 100%; padding: 15px;
        background: var(--accent, #e8a04a);
        color: var(--bg-0, #0f0d0a);
        border: none; border-radius: 14px;
        font-size: 15px; font-weight: 700; cursor: pointer;
        transition: all .15s;
        letter-spacing: .02em;
      }
      .duelo-btn-next:hover { filter: brightness(1.1); transform: translateY(-1px); }
      .duelo-btn-next:active { transform: translateY(0); }


      .duelo-menu-titulo {
        font-family: var(--font-display, serif);
        font-size: 28px; color: var(--text-0, #f0e8df);
        text-align: center; margin-bottom: 4px;
      }
      .duelo-menu-sub {
        font-size: 14px; color: var(--text-2, #8a7a6a);
        text-align: center; margin-bottom: 24px;
      }
      .duelo-temas-grid {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
        margin-bottom: 20px;
      }
      .duelo-tema-btn {
        display: flex; flex-direction: column; align-items: center;
        gap: 6px; padding: 14px 8px;
        background: var(--bg-2, #1a1612);
        border: 2px solid var(--border, #3a3228);
        border-radius: 14px; cursor: pointer;
        transition: all .15s; font-size: 13px;
        color: var(--text-1, #c8b89a); font-weight: 600;
      }
      .duelo-tema-btn:hover, .duelo-tema-btn.ativo {
        border-color: #e8a04a;
        background: rgba(232,160,74,.08);
        color: var(--text-0, #f0e8df);
      }
      .duelo-tema-btn span:first-child { font-size: 26px; }

      .duelo-input-tema {
        width: 100%; background: var(--bg-3, #211d18);
        border: 1px solid var(--border, #3a3228);
        border-radius: 12px; padding: 12px 16px;
        font-size: 14px; color: var(--text-0, #f0e8df);
        outline: none; transition: border-color .15s;
        box-sizing: border-box;
      }
      .duelo-input-tema:focus { border-color: #e8a04a; }

      .duelo-config-row {
        display: flex; gap: 10px; margin-bottom: 4px;
      }
      .duelo-config-select {
        flex: 1; background: var(--bg-3, #211d18);
        border: 1px solid var(--border, #3a3228);
        border-radius: 10px; padding: 10px 12px;
        font-size: 13px; color: var(--text-1, #c8b89a);
        outline: none; cursor: pointer;
      }

      .duelo-start-btn {
        width: 100%; padding: 16px;
        background: linear-gradient(135deg, #e8a04a, #f0c060);
        color: #0f0d0a; border: none; border-radius: 14px;
        font-size: 16px; font-weight: 800; cursor: pointer;
        transition: all .2s; letter-spacing: .03em;
        box-shadow: 0 4px 20px rgba(232,160,74,.3);
      }
      .duelo-start-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(232,160,74,.4); }
      .duelo-start-btn:disabled { opacity:.5; cursor:not-allowed; transform:none; }

      .duelo-resultado-emoji { font-size: 64px; text-align: center; }
      .duelo-resultado-titulo {
        font-family: var(--font-display, serif);
        font-size: 26px; color: var(--text-0, #f0e8df);
        text-align: center; margin: 8px 0 4px;
      }
      .duelo-resultado-sub {
        font-size: 14px; color: var(--text-2, #8a7a6a);
        text-align: center; margin-bottom: 24px;
      }
      .duelo-stats-grid {
        display: grid; grid-template-columns: repeat(3, 1fr);
        gap: 10px; margin-bottom: 24px;
      }
      .duelo-stat-card {
        background: var(--bg-2, #1a1612);
        border: 1px solid var(--border, #3a3228);
        border-radius: 14px; padding: 16px 10px;
        text-align: center;
      }
      .duelo-stat-card .val {
        font-size: 28px; font-weight: 800;
        color: var(--accent, #e8a04a); line-height: 1;
        margin-bottom: 4px;
      }
      .duelo-stat-card .lbl {
        font-size: 11px; color: var(--text-2, #8a7a6a);
        text-transform: uppercase; letter-spacing: .07em;
      }
      .duelo-resultado-btns { display: flex; gap: 10px; }


      .duelo-loading {
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 16px; padding: 48px 28px; text-align: center;
      }
      .duelo-spinner {
        width: 44px; height: 44px;
        border: 3px solid var(--border, #3a3228);
        border-top-color: #e8a04a;
        border-radius: 50%;
        animation: duelo-spin .7s linear infinite;
      }
      @keyframes duelo-spin { to { transform: rotate(360deg); } }

      /* Responsivo */
      @media (max-width: 600px) {
        #duelo-box { border-radius: 20px 20px 0 0; max-height: 100vh; align-self: flex-end; }
        #duelo-overlay { align-items: flex-end; }
        .duelo-temas-grid { grid-template-columns: repeat(3, 1fr); }
        .duelo-q-texto { font-size: 17px; }
        .duelo-body { padding: 20px 18px 16px; }
      }
    `;
    document.head.appendChild(s);
  }

  function abrir() {
    _injectCSS();
    if (document.getElementById('duelo-overlay')) return;

    _state = {
      fase: 'menu', tema: '', questoes: [], qi: 0,
      vidas: 3, xp: 0, streak: 0, maxStreak: 0,
      acertos: 0, respondida: false, escolha: null, totalXpSessao: 0,
    };

    const overlay = document.createElement('div');
    overlay.id = 'duelo-overlay';
    overlay.innerHTML = `<div id="duelo-box"></div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) fechar(); });
    document.body.appendChild(overlay);

    _renderMenu();
  }

  function fechar() {
    const el = document.getElementById('duelo-overlay');
    if (el) el.remove();
  }


  function _box() { return document.getElementById('duelo-box'); }

  function _topbar(mostrarProgresso = false) {
    const pct = _state.questoes.length
      ? Math.round((_state.qi / _state.questoes.length) * 100) : 0;

    return `
      <div class="duelo-topbar">
        <button class="duelo-close-btn" onclick="ModoDuelo.fechar()">✕</button>

        ${mostrarProgresso ? `
          <div class="duelo-progress-wrap">
            <div class="duelo-progress-fill" style="width:${pct}%"></div>
          </div>
        ` : `<div style="flex:1"></div>`}

        <div class="duelo-vidas">
          ${[1,2,3].map(i => `<span class="duelo-vida ${i > _state.vidas ? 'perdida' : ''}">❤️</span>`).join('')}
        </div>
        <div class="duelo-xp-badge">⚡ ${_state.xp} XP</div>
        ${_state.streak >= 2 ? `<div class="duelo-streak-badge">🔥 ${_state.streak}</div>` : ''}
      </div>
    `;
  }

  function _renderMenu() {
    const box = _box();
    box.innerHTML = `
      ${_topbar(false)}
      <div class="duelo-body">
        <div class="duelo-menu-titulo">🎯 Modo Duelo</div>
        <div class="duelo-menu-sub">Escolha um tema e teste seus conhecimentos</div>

        <div class="duelo-temas-grid" id="duelo-temas-grid">
          ${TEMAS.map(t => `
            <button class="duelo-tema-btn" onclick="ModoDuelo._selecionarTema('${t.label}', this)">
              <span>${t.emoji}</span>
              <span>${t.label}</span>
            </button>
          `).join('')}
        </div>

        <div style="margin-bottom:16px;">
          <label style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-2,#8a7a6a);display:block;margin-bottom:6px;">
            Ou digite um tema específico
          </label>
          <input id="duelo-tema-input" class="duelo-input-tema"
            placeholder="Ex: Segunda Guerra Mundial, Álgebra Linear, Fotossíntese..."
            oninput="ModoDuelo._onTemaInput(this.value)"
            onkeydown="if(event.key==='Enter') ModoDuelo.iniciar()" />
        </div>

        <div class="duelo-config-row">
          <select class="duelo-config-select" id="duelo-qtd">
            <option value="5">5 questões</option>
            <option value="10" selected>10 questões</option>
            <option value="15">15 questões</option>
            <option value="20">20 questões</option>
          </select>
          <select class="duelo-config-select" id="duelo-nivel">
            <option value="fácil">Fácil</option>
            <option value="médio" selected>Médio</option>
            <option value="difícil">Difícil</option>
          </select>
        </div>

        <button class="duelo-start-btn" id="duelo-start-btn"
          onclick="ModoDuelo.iniciar()" disabled>
          🚀 Iniciar Duelo
        </button>
      </div>
    `;
  }

  function _selecionarTema(label, btn) {
 
    const jaAtivo = btn.classList.contains('ativo');
    document.querySelectorAll('.duelo-tema-btn').forEach(b => b.classList.remove('ativo'));
    const input = document.getElementById('duelo-tema-input');

    if (jaAtivo) {
      _state.tema = '';
      if (input) input.value = '';
    } else {
      btn.classList.add('ativo');
      _state.tema = label;
      if (input) input.value = label;
    }
    _atualizarStartBtn();
  }

  function _onTemaInput(val) {
    _state.tema = val.trim();
    document.querySelectorAll('.duelo-tema-btn').forEach(b => b.classList.remove('ativo'));
    _atualizarStartBtn();
  }

  function _atualizarStartBtn() {
    const btn = document.getElementById('duelo-start-btn');
    if (btn) btn.disabled = !_state.tema;
  }

  async function iniciar(nivelOverride = null) {
    const tema = _state.tema ||
      (document.getElementById('duelo-tema-input')?.value.trim());
    if (!tema) return;

    const qtd = parseInt(document.getElementById('duelo-qtd')?.value) || 10;
    const nivel = document.getElementById('duelo-nivel')?.value || 'médio';

    _state.tema = tema;
    _state.vidas = 3;
    _state.xp = 0;
    _state.streak = 0;
    _state.maxStreak = 0;
    _state.acertos = 0;
    _state.qi = 0;
    _state.fase = 'carregando';

    const box = _box();
    box.innerHTML = `
      ${_topbar(false)}
      <div class="duelo-loading">
        <div class="duelo-spinner"></div>
        <div style="font-size:16px;font-weight:600;color:var(--text-0,#f0e8df);">Preparando seu duelo...</div>
        <div style="font-size:13px;color:var(--text-2,#8a7a6a);">A IA está criando ${qtd} questões sobre <strong style="color:var(--accent,#e8a04a);">${tema}</strong></div>
      </div>
    `;

    try {
      const prompt = `Crie ${qtd} questões de múltipla escolha de nível ${nivel} sobre o tema: "${tema}".

Regras:
- Cada questão deve ter exatamente 4 alternativas (A, B, C, D)
- Apenas uma alternativa está correta
- As alternativas incorretas devem ser plausíveis mas claramente erradas
- Inclua uma breve explicação da resposta correta

Responda APENAS com um array JSON válido, sem texto adicional:
[
  {
    "enunciado": "Texto da questão?",
    "alternativas": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
    "correta": 0,
    "explicacao": "Breve explicação do porquê a resposta está correta."
  }
]`;

      const res = await fetch(`${API}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          context: 'Você é um professor que cria questões educativas envolventes. Responda APENAS com JSON puro, sem markdown.'
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Erro ${res.status}`);
      }

      const data = await res.json();
      const raw = (data.response || '').replace(/```json|```/g, '').trim();
      const match = raw.match(/\[[\s\S]*\]/);
      const questoes = JSON.parse(match ? match[0] : raw);

      if (!Array.isArray(questoes) || !questoes.length) {
        throw new Error('Nenhuma questão foi gerada.');
      }

      _state.questoes = questoes;
      _state.fase = 'jogando';
      _renderQuestao();

    } catch (e) {
      box.innerHTML = `
        ${_topbar(false)}
        <div class="duelo-body" style="align-items:center;justify-content:center;text-align:center;gap:16px;">
          <div style="font-size:48px;">😕</div>
          <div style="font-size:16px;font-weight:600;color:var(--text-0,#f0e8df);">Erro ao gerar questões</div>
          <div style="font-size:13px;color:var(--text-2,#8a7a6a);">${e.message}</div>
          <button class="duelo-btn-next" onclick="ModoDuelo._renderMenu()" style="max-width:200px;">
            Tentar novamente
          </button>
        </div>
      `;
    }
  }


  function _renderQuestao() {
    const q = _state.questoes[_state.qi];
    if (!q) { _renderResultado(); return; }

    _state.respondida = false;
    _state.escolha = null;

    const letras = ['A', 'B', 'C', 'D'];
    const box = _box();

    box.innerHTML = `
      ${_topbar(true)}
      <div class="duelo-body" id="duelo-q-body">
        <div>
          <div class="duelo-q-num">Questão ${_state.qi + 1} de ${_state.questoes.length}</div>
          <div class="duelo-q-texto">${_esc(q.enunciado)}</div>
        </div>

        <div class="duelo-alts" id="duelo-alts">
          ${q.alternativas.map((alt, ai) => `
            <button class="duelo-alt" id="duelo-alt-${ai}"
              onclick="ModoDuelo.responder(${ai})">
              <span class="duelo-alt-letra">${letras[ai]}</span>
              <span>${_esc(alt)}</span>
            </button>
          `).join('')}
        </div>

        <div id="duelo-feedback-area"></div>
        <div id="duelo-next-area"></div>
      </div>
    `;
  }

  
  function responder(ai) {
    if (_state.respondida) return;
    _state.respondida = true;
    _state.escolha = ai;

    const q = _state.questoes[_state.qi];
    const acertou = ai === q.correta;

   
    document.querySelectorAll('.duelo-alt').forEach(b => b.disabled = true);

    const btnEscolhido = document.getElementById(`duelo-alt-${ai}`);
    if (acertou) {
      btnEscolhido?.classList.add('correta');
    } else {
      btnEscolhido?.classList.add('errada');

      document.getElementById(`duelo-alt-${q.correta}`)?.classList.add('gabarito');
    }


    if (acertou) {
      _state.streak++;
      _state.maxStreak = Math.max(_state.maxStreak, _state.streak);
      _state.acertos++;

   
      const bonus = Math.min(_state.streak - 1, 5) * 2;
      const xpGanho = 10 + bonus;
      _state.xp += xpGanho;
      _state.totalXpSessao += xpGanho;
  _showXpPop(`+${xpGanho} XP`);
    } else {
      _state.streak = 0;
      _state.vidas--;
    }


    const topbar = document.querySelector('.duelo-topbar');
    if (topbar) {
      topbar.outerHTML = _topbar(true);
     
    }

    const box = _box();
    const oldTopbar = box.querySelector('.duelo-topbar');
    if (oldTopbar) {
      const tmp = document.createElement('div');
      tmp.innerHTML = _topbar(true);
      oldTopbar.replaceWith(tmp.firstElementChild);
    }


    const feedbackArea = document.getElementById('duelo-feedback-area');
    if (feedbackArea) {
      feedbackArea.innerHTML = acertou
        ? `<div class="duelo-feedback ok">
             <span class="duelo-feedback-icon">✅</span>
             <div><strong>Correto!</strong>${q.explicacao ? _esc(q.explicacao) : 'Ótimo trabalho!'}</div>
           </div>`
        : `<div class="duelo-feedback erro">
             <span class="duelo-feedback-icon">❌</span>
             <div><strong>Incorreto!</strong>${q.explicacao ? _esc(q.explicacao) : 'Resposta errada.'}</div>
           </div>`;
    }

    const nextArea = document.getElementById('duelo-next-area');
    if (nextArea) {
      const semVidas = _state.vidas <= 0;
      const ultimaQ = _state.qi >= _state.questoes.length - 1;

      if (semVidas) {
        nextArea.innerHTML = `
          <button class="duelo-btn-next" style="background:#e06060;"
            onclick="ModoDuelo._renderResultado()">
            💀 Ver resultado
          </button>`;
      } else if (ultimaQ) {
        nextArea.innerHTML = `
          <button class="duelo-btn-next" onclick="ModoDuelo._renderResultado()">
            🏁 Ver resultado
          </button>`;
      } else {
        nextArea.innerHTML = `
          <button class="duelo-btn-next" onclick="ModoDuelo._proximaQuestao()">
            Próxima →
          </button>`;
      }
    }
  }

  function _proximaQuestao() {
    _state.qi++;
    if (_state.qi >= _state.questoes.length || _state.vidas <= 0) {
      _renderResultado();
    } else {
      _renderQuestao();
    }
  }

  function _showXpPop(texto) {
    const body = document.getElementById('duelo-q-body');
    if (!body) return;
    const pop = document.createElement('div');
    pop.className = 'duelo-xp-pop';
    pop.textContent = texto;
    body.appendChild(pop);
    setTimeout(() => pop.remove(), 1000);
  }

  
  function _renderResultado() {
    _state.fase = 'resultado';
    const total = Math.min(_state.qi + 1, _state.questoes.length);
    const pct = total > 0 ? Math.round((_state.acertos / total) * 100) : 0;

    let emoji, titulo, sub;
    if (pct >= 90)      { emoji = '🏆'; titulo = 'Incrível!';       sub = 'Você domina esse assunto!'; }
    else if (pct >= 70) { emoji = '🌟'; titulo = 'Muito bem!';      sub = 'Excelente desempenho!'; }
    else if (pct >= 50) { emoji = '😊'; titulo = 'Bom esforço!';    sub = 'Continue praticando!'; }
    else if (_state.vidas <= 0) { emoji = '💀'; titulo = 'Sem vidas!'; sub = 'Tente novamente!'; }
    else                { emoji = '😅'; titulo = 'Pode melhorar!';  sub = 'Estude e tente de novo!'; }

    if (typeof App !== 'undefined' && App.addXP) {
      App.addXP(_state.totalXpSessao);
    }

    const box = _box();
    box.innerHTML = `
      ${_topbar(false)}
      <div class="duelo-body">
        <div class="duelo-resultado-emoji">${emoji}</div>
        <div class="duelo-resultado-titulo">${titulo}</div>
        <div class="duelo-resultado-sub">${sub} — <strong style="color:var(--accent,#e8a04a);">${_state.tema}</strong></div>

        <div class="duelo-stats-grid">
          <div class="duelo-stat-card">
            <div class="val">${_state.acertos}/${total}</div>
            <div class="lbl">Acertos</div>
          </div>
          <div class="duelo-stat-card">
            <div class="val">${_state.totalXpSessao}</div>
            <div class="lbl">XP ganho</div>
          </div>
          <div class="duelo-stat-card">
            <div class="val">${_state.maxStreak}🔥</div>
            <div class="lbl">Melhor streak</div>
          </div>
        </div>

        <div style="background:var(--bg-2,#1a1612);border:1px solid var(--border,#3a3228);border-radius:14px;padding:14px 18px;margin-bottom:4px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <span style="font-size:13px;font-weight:600;color:var(--text-1,#c8b89a);">Taxa de acerto</span>
            <span style="font-size:18px;font-weight:800;color:${pct>=70?'#60c878':'#e06060'};">${pct}%</span>
          </div>
          <div style="height:10px;background:var(--bg-3,#211d18);border-radius:99px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:${pct>=70?'linear-gradient(90deg,#60c878,#a0e8b0)':'linear-gradient(90deg,#e06060,#f09090)'};border-radius:99px;transition:width .8s cubic-bezier(.34,1.56,.64,1);"></div>
          </div>
        </div>

        <div class="duelo-resultado-btns">
          <button class="duelo-btn-next" style="flex:1;background:var(--bg-2,#1a1612);color:var(--text-0,#f0e8df);border:1px solid var(--border,#3a3228);"
            onclick="ModoDuelo._renderMenu()">
            🏠 Menu
          </button>
          <button class="duelo-btn-next" style="flex:2;"
            onclick="ModoDuelo.iniciar()">
            🔄 Jogar de novo
          </button>
        </div>
      </div>
    `;
  }


  const STORAGE_KEY = 'studysync_duelo_v1';

  function _loadStorage() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
  }
  function _saveStorage(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }
  function _getData() {
    const d = _loadStorage();
    if (!d.historico) d.historico = [];
    if (!d.conquistas) d.conquistas = [];
    if (!d.erros) d.erros = [];
    if (!d.totalPartidas) d.totalPartidas = 0;
    if (!d.totalAcertos) d.totalAcertos = 0;
    if (!d.totalQuestoes) d.totalQuestoes = 0;
    if (!d.totalXp) d.totalXp = 0;
    return d;
  }

  const CONQUISTAS_DUELO = [
    { id: 'primeira_vitoria',  icon: '🏆', nome: 'Primeira Vitória',    desc: 'Acerte 70%+ em um duelo.',         check: (d) => d.historico.some(h => h.pct >= 70) },
    { id: 'perfeito',          icon: '💎', nome: 'Perfeição',            desc: 'Acerte 100% em um duelo.',         check: (d) => d.historico.some(h => h.pct === 100) },
    { id: 'streak_5',          icon: '🔥', nome: 'Em Chamas',            desc: 'Faça um streak de 5 respostas.',   check: (d) => d.historico.some(h => h.maxStreak >= 5) },
    { id: 'dez_partidas',      icon: '⚔️', nome: 'Veterano',             desc: 'Complete 10 duelos.',              check: (d) => d.totalPartidas >= 10 },
    { id: 'cem_questoes',      icon: '📚', nome: 'Estudante Dedicado',   desc: 'Responda 100 questões no total.',  check: (d) => d.totalQuestoes >= 100 },
    { id: 'sem_errar',         icon: '❤️', nome: 'Invicto',              desc: 'Termine um duelo sem perder vida.', check: (d) => d.historico.some(h => h.vidasRestantes === 3) },
    { id: 'cinco_temas',       icon: '🌐', nome: 'Multidisciplinar',     desc: 'Jogue em 5 temas diferentes.',     check: (d) => new Set(d.historico.map(h => h.tema)).size >= 5 },
    { id: 'revisao_mestre',    icon: '🔄', nome: 'Mestre da Revisão',    desc: 'Revise seus erros pelo menos uma vez.', check: (d) => d.revisouErros },
    { id: 'mil_xp',            icon: '⚡', nome: 'Acumulador de XP',     desc: 'Acumule 1000 XP no Duelo.',        check: (d) => d.totalXp >= 1000 },
    { id: 'dificil_vencedor',  icon: '🧠', nome: 'Mente Brilhante',      desc: 'Acerte 70%+ no nível Difícil.',    check: (d) => d.historico.some(h => h.nivel === 'difícil' && h.pct >= 70) },
  ];

  function _verificarConquistas() {
    const d = _getData();
    const novas = [];
    CONQUISTAS_DUELO.forEach(c => {
      if (!d.conquistas.includes(c.id) && c.check(d)) {
        d.conquistas.push(c.id);
        novas.push(c);
      }
    });
    _saveStorage(d);
    return novas;
  }

  function _salvarPartida(pct, vidasRestantes, nivel) {
    const d = _getData();
    const total = Math.min(_state.qi + 1, _state.questoes.length);
    d.historico.unshift({
      id: Date.now(),
      tema: _state.tema,
      nivel,
      pct,
      acertos: _state.acertos,
      total,
      xp: _state.totalXpSessao,
      maxStreak: _state.maxStreak,
      vidasRestantes,
      erros: _state.questoes
        .filter((_, i) => i < total && _state._respostas && _state._respostas[i] !== undefined && _state._respostas[i] !== _state.questoes[i].correta)
        .map(q => ({ enunciado: q.enunciado, alternativas: q.alternativas, correta: q.correta, explicacao: q.explicacao })),
      data: new Date().toLocaleDateString('pt-BR'),
    });
    // Salva erros para revisão futura
    const errosNovos = _state.questoes
      .filter((q, i) => i < total && _state._respostas && _state._respostas[i] !== q.correta)
      .map(q => ({ ...q, tema: _state.tema, data: new Date().toLocaleDateString('pt-BR') }));
    d.erros = [...errosNovos, ...d.erros].slice(0, 100); // máx 100 erros salvos
    if (d.historico.length > 50) d.historico = d.historico.slice(0, 50);
    d.totalPartidas++;
    d.totalAcertos += _state.acertos;
    d.totalQuestoes += total;
    d.totalXp += _state.totalXpSessao;
    _saveStorage(d);
  }

  let _timerInterval = null;
  let _timerRestante = 0;

  function _iniciarTimer(segundos) {
    _pararTimer();
    _timerRestante = segundos;
    _atualizarTimerUI();
    _timerInterval = setInterval(() => {
      _timerRestante--;
      _atualizarTimerUI();
      if (_timerRestante <= 0) {
        _pararTimer();
        if (!_state.respondida) {
     
          _state.respondida = true;
          _state.streak = 0;
          _state.vidas--;
          const q = _state.questoes[_state.qi];
          document.querySelectorAll('.duelo-alt').forEach(b => b.disabled = true);
          document.getElementById(`duelo-alt-${q.correta}`)?.classList.add('gabarito');
          const feedbackArea = document.getElementById('duelo-feedback-area');
          if (feedbackArea) {
            feedbackArea.innerHTML = `<div class="duelo-feedback erro">
              <span class="duelo-feedback-icon">⏱️</span>
              <div><strong>Tempo esgotado!</strong>${q.explicacao ? _esc(q.explicacao) : ''}</div>
            </div>`;
          }
     
          const box = _box();
          const oldTopbar = box.querySelector('.duelo-topbar');
          if (oldTopbar) {
            const tmp = document.createElement('div');
            tmp.innerHTML = _topbar(true);
            oldTopbar.replaceWith(tmp.firstElementChild);
          }
          const nextArea = document.getElementById('duelo-next-area');
          if (nextArea) {
            const semVidas = _state.vidas <= 0;
            const ultimaQ = _state.qi >= _state.questoes.length - 1;
            if (semVidas || ultimaQ) {
              nextArea.innerHTML = `<button class="duelo-btn-next" onclick="ModoDuelo._renderResultado()">🏁 Ver resultado</button>`;
            } else {
              nextArea.innerHTML = `<button class="duelo-btn-next" onclick="ModoDuelo._proximaQuestao()">Próxima →</button>`;
            }
          }
        }
      }
    }, 1000);
  }

  function _pararTimer() {
    if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
  }

  function _atualizarTimerUI() {
    const el = document.getElementById('duelo-timer');
    if (!el) return;
    const pct = (_timerRestante / _state._timerTotal) * 100;
    const cor = _timerRestante <= 5 ? '#e06060' : _timerRestante <= 10 ? '#e8a04a' : '#60c878';
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:${cor};">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${cor}" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        ${_timerRestante}s
      </div>
      <div style="height:3px;background:var(--bg-3,#211d18);border-radius:99px;overflow:hidden;margin-top:3px;">
        <div style="height:100%;width:${pct}%;background:${cor};border-radius:99px;transition:width 1s linear;"></div>
      </div>
    `;
  }

  function _injectCSSExtra() {
    if (document.getElementById('duelo-css-extra')) return;
    const s = document.createElement('style');
    s.id = 'duelo-css-extra';
    s.textContent = `
   
      .duelo-timer-wrap {
        min-width: 56px; padding: 2px 8px;
        background: var(--bg-3, #211d18);
        border: 1px solid var(--border, #3a3228);
        border-radius: 8px;
        flex-shrink: 0;
      }

      .duelo-conquista-toast {
        position: fixed; bottom: 28px; right: 28px;
        background: linear-gradient(135deg, #1a1612, #211d18);
        border: 1px solid #e8a04a;
        border-radius: 16px; padding: 14px 18px;
        display: flex; align-items: center; gap: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.6);
        z-index: 99999; max-width: 320px;
        animation: duelo-toast-in .4s cubic-bezier(.34,1.56,.64,1);
      }
      @keyframes duelo-toast-in {
        from { opacity:0; transform: translateY(20px) scale(0.9); }
        to   { opacity:1; transform: translateY(0) scale(1); }
      }
      .duelo-conquista-toast-icon { font-size: 32px; flex-shrink:0; }
      .duelo-conquista-toast-title { font-size: 10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#e8a04a; margin-bottom:2px; }
      .duelo-conquista-toast-nome { font-size: 15px; font-weight:700; color:#f0e8df; margin-bottom:1px; }
      .duelo-conquista-toast-desc { font-size: 12px; color:#8a7a6a; }


      .duelo-menu-tabs {
        display: flex; gap: 4px;
        background: var(--bg-3, #211d18);
        border-radius: 12px; padding: 4px;
        margin-bottom: 20px;
      }
      .duelo-menu-tab {
        flex: 1; padding: 8px 4px;
        background: none; border: none;
        border-radius: 8px; cursor: pointer;
        font-size: 12px; font-weight: 600;
        color: var(--text-2, #8a7a6a);
        transition: all .15s;
      }
      .duelo-menu-tab.ativa {
        background: var(--bg-1, #151210);
        color: var(--text-0, #f0e8df);
        box-shadow: 0 1px 4px rgba(0,0,0,.4);
      }

      .duelo-hist-item {
        display: flex; align-items: center; gap: 12px;
        padding: 12px 14px;
        background: var(--bg-2, #1a1612);
        border: 1px solid var(--border, #3a3228);
        border-radius: 12px;
        font-size: 13px;
      }
      .duelo-hist-pct {
        font-size: 18px; font-weight: 800;
        min-width: 48px; text-align:center;
      }
      .duelo-hist-info { flex:1; }
      .duelo-hist-tema { font-weight:600; color:var(--text-0,#f0e8df); margin-bottom:2px; }
      .duelo-hist-meta { color:var(--text-2,#8a7a6a); font-size:11px; }

      .duelo-badge-grid {
        display: grid; grid-template-columns: repeat(3,1fr); gap: 8px;
      }
      .duelo-badge-card {
        background: var(--bg-2,#1a1612);
        border: 1px solid var(--border,#3a3228);
        border-radius: 12px; padding: 14px 8px;
        text-align: center; position:relative;
      }
      .duelo-badge-card.desbloqueada { border-color: rgba(232,160,74,.4); }
      .duelo-badge-card.bloqueada { opacity:.4; filter: grayscale(1); }
      .duelo-badge-icon { font-size: 28px; margin-bottom:4px; }
      .duelo-badge-nome { font-size: 11px; font-weight:700; color:var(--text-0,#f0e8df); margin-bottom:2px; }
      .duelo-badge-desc { font-size: 10px; color:var(--text-2,#8a7a6a); line-height:1.3; }

      .duelo-revisao-card {
        background: var(--bg-2,#1a1612);
        border: 1px solid var(--border,#3a3228);
        border-radius: 14px; padding: 16px 18px;
      }
      .duelo-revisao-card .duelo-q-texto { font-size:15px; margin-bottom:12px; }

      .duelo-share-btn {
        display:flex;align-items:center;gap:6px;justify-content:center;
        padding:10px 20px;
        background:var(--bg-2,#1a1612);
        border:1px solid var(--border,#3a3228);
        border-radius:10px;cursor:pointer;
        font-size:13px;font-weight:600;color:var(--text-1,#c8b89a);
        transition:all .15s;
      }
      .duelo-share-btn:hover { border-color:#e8a04a;color:var(--text-0,#f0e8df); }

      
      .duelo-adapt-badge {
        display:inline-flex;align-items:center;gap:4px;
        font-size:11px;font-weight:700;padding:3px 10px;
        border-radius:99px;background:rgba(96,160,232,.12);
        border:1px solid rgba(96,160,232,.3);color:#60a0e8;
      }

      .duelo-global-stats {
        display:grid;grid-template-columns:repeat(2,1fr);gap:8px;
        margin-bottom:16px;
      }
      .duelo-global-stat {
        background:var(--bg-2,#1a1612);
        border:1px solid var(--border,#3a3228);
        border-radius:12px;padding:12px;text-align:center;
      }
      .duelo-global-stat .val { font-size:22px;font-weight:800;color:var(--accent,#e8a04a); }
      .duelo-global-stat .lbl { font-size:10px;color:var(--text-2,#8a7a6a);text-transform:uppercase;letter-spacing:.07em; }
    `;
    document.head.appendChild(s);
  }

  function _mostrarConquistaToast(conquistas) {
    conquistas.forEach((c, i) => {
      setTimeout(() => {
        const t = document.createElement('div');
        t.className = 'duelo-conquista-toast';
        t.innerHTML = `
          <div class="duelo-conquista-toast-icon">${c.icon}</div>
          <div>
            <div class="duelo-conquista-toast-title">🏅 Conquista desbloqueada!</div>
            <div class="duelo-conquista-toast-nome">${c.nome}</div>
            <div class="duelo-conquista-toast-desc">${c.desc}</div>
          </div>
        `;
        document.body.appendChild(t);
        setTimeout(() => {
          t.style.transition = 'opacity .4s, transform .4s';
          t.style.opacity = '0';
          t.style.transform = 'translateY(10px)';
          setTimeout(() => t.remove(), 400);
        }, 3500);
      }, i * 800);
    });
  }

  const _renderResultadoOriginal = _renderResultado;

  function _renderResultadoComSave() {
    _pararTimer();
    _state.fase = 'resultado';
    const total = Math.min(_state.qi + 1, _state.questoes.length);
    const pct = total > 0 ? Math.round((_state.acertos / total) * 100) : 0;
    const nivel = _state._nivel || 'médio';
    const vidasRestantes = _state.vidas;

 
    _salvarPartida(pct, vidasRestantes, nivel);


    const novas = _verificarConquistas();

    let emoji, titulo, sub;
    if (pct >= 90)      { emoji = '🏆'; titulo = 'Incrível!';       sub = 'Você domina esse assunto!'; }
    else if (pct >= 70) { emoji = '🌟'; titulo = 'Muito bem!';      sub = 'Excelente desempenho!'; }
    else if (pct >= 50) { emoji = '😊'; titulo = 'Bom esforço!';    sub = 'Continue praticando!'; }
    else if (_state.vidas <= 0) { emoji = '💀'; titulo = 'Sem vidas!'; sub = 'Tente novamente!'; }
    else                { emoji = '😅'; titulo = 'Pode melhorar!';  sub = 'Estude e tente de novo!'; }

    if (typeof App !== 'undefined' && App.addXP) App.addXP(_state.totalXpSessao);

    const d = _getData();
    const ultimas = d.historico.slice(0, 3);
    let sugestao = '';
    if (ultimas.length >= 2) {
      const media = ultimas.reduce((a,b) => a + b.pct, 0) / ultimas.length;
      if (media >= 85 && nivel !== 'difícil') {
        sugestao = `<div class="duelo-adapt-badge">🧠 Que tal tentar o nível <strong>Difícil</strong>?</div>`;
      } else if (media < 40 && nivel !== 'fácil') {
        sugestao = `<div class="duelo-adapt-badge" style="background:rgba(224,96,96,.1);border-color:rgba(224,96,96,.3);color:#e08080;">💡 Experimente o nível <strong>Fácil</strong> para ganhar confiança!</div>`;
      }
    }

    const box = _box();
    box.innerHTML = `
      ${_topbar(false)}
      <div class="duelo-body">
        <div class="duelo-resultado-emoji">${emoji}</div>
        <div class="duelo-resultado-titulo">${titulo}</div>
        <div class="duelo-resultado-sub">${sub} — <strong style="color:var(--accent,#e8a04a);">${_state.tema}</strong></div>
        ${sugestao}

        <div class="duelo-stats-grid">
          <div class="duelo-stat-card">
            <div class="val">${_state.acertos}/${total}</div>
            <div class="lbl">Acertos</div>
          </div>
          <div class="duelo-stat-card">
            <div class="val">${_state.totalXpSessao}</div>
            <div class="lbl">XP ganho</div>
          </div>
          <div class="duelo-stat-card">
            <div class="val">${_state.maxStreak}🔥</div>
            <div class="lbl">Melhor streak</div>
          </div>
        </div>

        <div style="background:var(--bg-2,#1a1612);border:1px solid var(--border,#3a3228);border-radius:14px;padding:14px 18px;margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <span style="font-size:13px;font-weight:600;color:var(--text-1,#c8b89a);">Taxa de acerto</span>
            <span style="font-size:18px;font-weight:800;color:${pct>=70?'#60c878':'#e06060'};">${pct}%</span>
          </div>
          <div style="height:10px;background:var(--bg-3,#211d18);border-radius:99px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:${pct>=70?'linear-gradient(90deg,#60c878,#a0e8b0)':'linear-gradient(90deg,#e06060,#f09090)'};border-radius:99px;transition:width .8s cubic-bezier(.34,1.56,.64,1);"></div>
          </div>
        </div>

        ${_state._temErros() ? `
          <button class="duelo-btn-next" style="background:rgba(224,160,74,.15);border:1px solid rgba(224,160,74,.3);color:#e8a04a;margin-bottom:8px;"
            onclick="ModoDuelo._renderRevisaoErros()">
            🔄 Revisar ${_state._contarErros()} erro(s) desta partida
          </button>
        ` : ''}

        <button class="duelo-share-btn" onclick="ModoDuelo._compartilhar(${pct})" style="margin-bottom:12px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Compartilhar resultado
        </button>

        <div class="duelo-resultado-btns">
          <button class="duelo-btn-next" style="flex:1;background:var(--bg-2,#1a1612);color:var(--text-0,#f0e8df);border:1px solid var(--border,#3a3228);"
            onclick="ModoDuelo._renderMenu()">
            🏠 Menu
          </button>
          <button class="duelo-btn-next" style="flex:2;"
            onclick="ModoDuelo.iniciar()">
            🔄 Jogar de novo
          </button>
        </div>
      </div>
    `;

    
    if (novas.length) setTimeout(() => _mostrarConquistaToast(novas), 800);
  }

 
  _state._temErros = () => {
    const total = Math.min(_state.qi + 1, _state.questoes.length);
    return _state._respostas && _state.questoes.slice(0, total).some((q, i) => _state._respostas[i] !== q.correta);
  };
  _state._contarErros = () => {
    const total = Math.min(_state.qi + 1, _state.questoes.length);
    if (!_state._respostas) return 0;
    return _state.questoes.slice(0, total).filter((q, i) => _state._respostas[i] !== q.correta).length;
  };


  function _renderRevisaoErros() {
    const d = _getData();
    d.revisouErros = true;
    _saveStorage(d);
    _verificarConquistas();

    const erros = _state.questoes
      .filter((q, i) => _state._respostas && _state._respostas[i] !== q.correta)
      .slice(0, _state.qi + 1);

    if (!erros.length) {
      alert('Nenhum erro para revisar!');
      return;
    }

    const letras = ['A','B','C','D'];
    const box = _box();
    box.innerHTML = `
      ${_topbar(false)}
      <div class="duelo-body">
        <div style="font-family:var(--font-display,serif);font-size:20px;color:var(--text-0,#f0e8df);margin-bottom:4px;">📋 Revisão de Erros</div>
        <div style="font-size:13px;color:var(--text-2,#8a7a6a);margin-bottom:20px;">${erros.length} questão(ões) errada(s) — estude o gabarito</div>
        ${erros.map((q, idx) => `
          <div class="duelo-revisao-card" style="margin-bottom:12px;">
            <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text-2,#8a7a6a);margin-bottom:8px;">Questão ${idx+1}</div>
            <div class="duelo-q-texto">${_esc(q.enunciado)}</div>
            <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px;">
              ${q.alternativas.map((alt, ai) => `
                <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;
                  background:${ai === q.correta ? 'rgba(96,200,120,.12)' : 'var(--bg-3,#211d18)'};
                  border:1.5px solid ${ai === q.correta ? '#60c878' : 'var(--border,#3a3228)'};
                  font-size:13px;color:${ai === q.correta ? '#80e098' : 'var(--text-2,#8a7a6a)'};">
                  <span style="width:22px;height:22px;border-radius:6px;display:flex;align-items:center;justify-content:center;
                    font-size:11px;font-weight:800;flex-shrink:0;
                    background:${ai === q.correta ? '#60c878' : 'var(--bg-2,#1a1612)'};
                    color:${ai === q.correta ? '#0a1a0d' : 'var(--text-2,#8a7a6a)'};">${letras[ai]}</span>
                  ${_esc(alt)} ${ai === q.correta ? '✓' : ''}
                </div>
              `).join('')}
            </div>
            ${q.explicacao ? `
              <div style="background:rgba(96,160,232,.08);border:1px solid rgba(96,160,232,.2);border-radius:10px;padding:10px 14px;font-size:13px;color:#80b8e8;">
                💡 ${_esc(q.explicacao)}
              </div>
            ` : ''}
          </div>
        `).join('')}
        <button class="duelo-btn-next" onclick="ModoDuelo._renderResultadoComSave ? ModoDuelo._renderMenu() : ModoDuelo._renderMenu()" style="margin-top:8px;">
          ← Voltar ao resultado
        </button>
      </div>
    `;
  }

  function _compartilhar(pct) {
    const total = Math.min(_state.qi + 1, _state.questoes.length);
    const estrelas = pct >= 90 ? '⭐⭐⭐' : pct >= 70 ? '⭐⭐' : '⭐';
    const texto = `🎯 StudySync — Modo Duelo\n${estrelas} ${pct}% de acerto\n📚 Tema: ${_state.tema}\n✅ ${_state.acertos}/${total} questões | ⚡${_state.totalXpSessao} XP | 🔥${_state.maxStreak} streak`;
    if (navigator.share) {
      navigator.share({ title: 'StudySync Duelo', text: texto }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(texto).then(() => {
        _showToastSimples('✅ Copiado para a área de transferência!');
      }).catch(() => {
        prompt('Copie o resultado:', texto);
      });
    }
  }

  function _showToastSimples(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#211d18;border:1px solid #3a3228;color:#f0e8df;padding:10px 20px;border-radius:99px;font-size:13px;font-weight:600;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.5);';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity='0';t.style.transition='opacity .3s'; setTimeout(()=>t.remove(),300); }, 2000);
  }

  
  function _renderMenuComAbas(aba = 'jogar') {
    _injectCSSExtra();
    const box = _box();
    const d = _getData();

    let conteudoAba = '';
    if (aba === 'jogar') {
      conteudoAba = `
        <div class="duelo-temas-grid" id="duelo-temas-grid">
          ${TEMAS.map(t => `
            <button class="duelo-tema-btn" onclick="ModoDuelo._selecionarTema('${t.label}', this)">
              <span>${t.emoji}</span>
              <span>${t.label}</span>
            </button>
          `).join('')}
        </div>

        <div style="margin-bottom:16px;">
          <label style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-2,#8a7a6a);display:block;margin-bottom:6px;">
            Ou digite um tema específico
          </label>
          <input id="duelo-tema-input" class="duelo-input-tema"
            placeholder="Ex: Segunda Guerra Mundial, Álgebra Linear..."
            oninput="ModoDuelo._onTemaInput(this.value)"
            onkeydown="if(event.key==='Enter') ModoDuelo.iniciar()" />
        </div>

        <div class="duelo-config-row">
          <select class="duelo-config-select" id="duelo-qtd">
            <option value="5">5 questões</option>
            <option value="10" selected>10 questões</option>
            <option value="15">15 questões</option>
            <option value="20">20 questões</option>
          </select>
          <select class="duelo-config-select" id="duelo-nivel">
            <option value="fácil">Fácil</option>
            <option value="médio" selected>Médio</option>
            <option value="difícil">Difícil</option>
          </select>
          <select class="duelo-config-select" id="duelo-timer-select">
            <option value="0">Sem timer</option>
            <option value="20">20s / questão</option>
            <option value="30" selected>30s / questão</option>
            <option value="60">60s / questão</option>
          </select>
        </div>

        ${d.erros.length ? `
          <button class="duelo-btn-next" onclick="ModoDuelo._iniciarRevisaoGlobal()"
            style="background:rgba(232,160,74,.1);border:1px solid rgba(232,160,74,.3);color:#e8a04a;margin-bottom:10px;">
            📋 Revisar meus ${Math.min(d.erros.length,10)} erros salvos
          </button>
        ` : ''}

        <button class="duelo-start-btn" id="duelo-start-btn"
          onclick="ModoDuelo.iniciar()" disabled>
          🚀 Iniciar Duelo
        </button>
      `;
    } else if (aba === 'historico') {
      const taxaGeral = d.totalQuestoes > 0 ? Math.round((d.totalAcertos / d.totalQuestoes) * 100) : 0;
      conteudoAba = `
        <div class="duelo-global-stats">
          <div class="duelo-global-stat"><div class="val">${d.totalPartidas}</div><div class="lbl">Partidas</div></div>
          <div class="duelo-global-stat"><div class="val">${taxaGeral}%</div><div class="lbl">Taxa geral</div></div>
          <div class="duelo-global-stat"><div class="val">${d.totalXp}</div><div class="lbl">XP total</div></div>
          <div class="duelo-global-stat"><div class="val">${d.conquistas.length}/${CONQUISTAS_DUELO.length}</div><div class="lbl">Conquistas</div></div>
        </div>
        ${d.historico.length === 0 ? `
          <div style="text-align:center;padding:32px 0;color:var(--text-2,#8a7a6a);">
            <div style="font-size:40px;margin-bottom:8px;">📭</div>
            <div>Nenhuma partida ainda.<br>Jogue seu primeiro duelo!</div>
          </div>
        ` : d.historico.map(h => {
          const cor = h.pct >= 70 ? '#60c878' : h.pct >= 50 ? '#e8a04a' : '#e06060';
          return `
            <div class="duelo-hist-item" style="margin-bottom:8px;">
              <div class="duelo-hist-pct" style="color:${cor};">${h.pct}%</div>
              <div class="duelo-hist-info">
                <div class="duelo-hist-tema">${_esc(h.tema)}</div>
                <div class="duelo-hist-meta">${h.acertos}/${h.total} acertos · ${h.nivel} · ⚡${h.xp} XP · 🔥${h.maxStreak} · ${h.data}</div>
              </div>
              <div style="font-size:18px;">${h.pct >= 70 ? '🌟' : h.pct >= 50 ? '😊' : '😅'}</div>
            </div>
          `;
        }).join('')}
      `;
    } else if (aba === 'conquistas') {
      conteudoAba = `
        <div style="font-size:13px;color:var(--text-2,#8a7a6a);margin-bottom:16px;">
          ${d.conquistas.length} de ${CONQUISTAS_DUELO.length} desbloqueadas
        </div>
        <div class="duelo-badge-grid">
          ${CONQUISTAS_DUELO.map(c => {
            const desbloqueada = d.conquistas.includes(c.id);
            return `
              <div class="duelo-badge-card ${desbloqueada ? 'desbloqueada' : 'bloqueada'}">
                <div class="duelo-badge-icon">${c.icon}</div>
                <div class="duelo-badge-nome">${c.nome}</div>
                <div class="duelo-badge-desc">${c.desc}</div>
                ${desbloqueada ? '<div style="font-size:9px;color:#e8a04a;font-weight:700;margin-top:4px;">DESBLOQUEADA</div>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    box.innerHTML = `
      ${_topbar(false)}
      <div class="duelo-body">
        <div class="duelo-menu-titulo">🎯 Modo Duelo</div>

        <div class="duelo-menu-tabs">
          <button class="duelo-menu-tab ${aba==='jogar'?'ativa':''}" onclick="ModoDuelo._renderMenuComAbas('jogar')">⚔️ Jogar</button>
          <button class="duelo-menu-tab ${aba==='historico'?'ativa':''}" onclick="ModoDuelo._renderMenuComAbas('historico')">📊 Histórico</button>
          <button class="duelo-menu-tab ${aba==='conquistas'?'ativa':''}" onclick="ModoDuelo._renderMenuComAbas('conquistas')">🏅 Conquistas</button>
        </div>

        ${conteudoAba}
      </div>
    `;
  }

  function _iniciarRevisaoGlobal() {
    const d = _getData();
    if (!d.erros.length) return;
    const erros = d.erros.slice(0, 10);
    const letras = ['A','B','C','D'];
    const box = _box();
    box.innerHTML = `
      ${_topbar(false)}
      <div class="duelo-body">
        <div style="font-family:var(--font-display,serif);font-size:20px;color:var(--text-0,#f0e8df);margin-bottom:4px;">📋 Revisão Geral</div>
        <div style="font-size:13px;color:var(--text-2,#8a7a6a);margin-bottom:20px;">${erros.length} questões que você errou antes</div>
        ${erros.map((q, idx) => `
          <div class="duelo-revisao-card" style="margin-bottom:12px;">
            <div style="font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text-2,#8a7a6a);margin-bottom:4px;">
              ${_esc(q.tema || '')} · ${q.data || ''}
            </div>
            <div class="duelo-q-texto">${_esc(q.enunciado)}</div>
            <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px;">
              ${q.alternativas.map((alt, ai) => `
                <div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;
                  background:${ai === q.correta ? 'rgba(96,200,120,.12)' : 'var(--bg-3,#211d18)'};
                  border:1.5px solid ${ai === q.correta ? '#60c878' : 'var(--border,#3a3228)'};
                  font-size:13px;color:${ai === q.correta ? '#80e098' : 'var(--text-2,#8a7a6a)'};">
                  <span style="width:20px;height:20px;border-radius:5px;display:flex;align-items:center;justify-content:center;
                    font-size:10px;font-weight:800;flex-shrink:0;
                    background:${ai === q.correta ? '#60c878' : 'var(--bg-2,#1a1612)'};
                    color:${ai === q.correta ? '#0a1a0d' : 'var(--text-2,#8a7a6a)'};">${letras[ai]}</span>
                  ${_esc(alt)} ${ai === q.correta ? '✓' : ''}
                </div>
              `).join('')}
            </div>
            ${q.explicacao ? `<div style="background:rgba(96,160,232,.08);border:1px solid rgba(96,160,232,.2);border-radius:10px;padding:10px 14px;font-size:13px;color:#80b8e8;">💡 ${_esc(q.explicacao)}</div>` : ''}
          </div>
        `).join('')}
        <button class="duelo-btn-next" onclick="ModoDuelo._renderMenuComAbas('jogar')" style="margin-top:8px;">← Voltar ao menu</button>
      </div>
    `;
    
    d.revisouErros = true;
    _saveStorage(d);
    _verificarConquistas();
  }

  
  async function _iniciarComExtras() {
    const tema = _state.tema || (document.getElementById('duelo-tema-input')?.value.trim());
    if (!tema) return;

    const qtd = parseInt(document.getElementById('duelo-qtd')?.value) || 10;
    const nivel = document.getElementById('duelo-nivel')?.value || 'médio';
    const timerSeg = parseInt(document.getElementById('duelo-timer-select')?.value) || 0;

    _state._nivel = nivel;
    _state._timerSeg = timerSeg;
    _state._timerTotal = timerSeg;
    _state._respostas = {};

  
    _state.tema = tema;
    _state.vidas = 3;
    _state.xp = 0;
    _state.streak = 0;
    _state.maxStreak = 0;
    _state.acertos = 0;
    _state.qi = 0;
    _state.fase = 'carregando';
    _state.totalXpSessao = 0;

    const box = _box();
    box.innerHTML = `
      ${_topbar(false)}
      <div class="duelo-loading">
        <div class="duelo-spinner"></div>
        <div style="font-size:16px;font-weight:600;color:var(--text-0,#f0e8df);">Preparando seu duelo...</div>
        <div style="font-size:13px;color:var(--text-2,#8a7a6a);">A IA está criando ${qtd} questões sobre <strong style="color:var(--accent,#e8a04a);">${tema}</strong></div>
      </div>
    `;

    try {
      const prompt = `Crie ${qtd} questões de múltipla escolha de nível ${nivel} sobre o tema: "${tema}".

Regras:
- Cada questão deve ter exatamente 4 alternativas (A, B, C, D)
- Apenas uma alternativa está correta
- As alternativas incorretas devem ser plausíveis mas claramente erradas
- Inclua uma breve explicação da resposta correta

Responda APENAS com um array JSON válido, sem texto adicional:
[
  {
    "enunciado": "Texto da questão?",
    "alternativas": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
    "correta": 0,
    "explicacao": "Breve explicação do porquê a resposta está correta."
  }
]`;

      const res = await fetch(`${API}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          context: 'Você é um professor que cria questões educativas envolventes. Responda APENAS com JSON puro, sem markdown.'
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Erro ${res.status}`);
      }

      const data = await res.json();
      const raw = (data.response || '').replace(/```json|```/g, '').trim();
      const match = raw.match(/\[[\s\S]*\]/);
      const questoes = JSON.parse(match ? match[0] : raw);

      if (!Array.isArray(questoes) || !questoes.length) throw new Error('Nenhuma questão foi gerada.');

      _state.questoes = questoes;
      _state.fase = 'jogando';
      _renderQuestaoComTimer();

    } catch (e) {
      box.innerHTML = `
        ${_topbar(false)}
        <div class="duelo-body" style="align-items:center;justify-content:center;text-align:center;gap:16px;">
          <div style="font-size:48px;">😕</div>
          <div style="font-size:16px;font-weight:600;color:var(--text-0,#f0e8df);">Erro ao gerar questões</div>
          <div style="font-size:13px;color:var(--text-2,#8a7a6a);">${e.message}</div>
          <button class="duelo-btn-next" onclick="ModoDuelo._renderMenuComAbas()" style="max-width:200px;">Tentar novamente</button>
        </div>
      `;
    }
  }


  function _renderQuestaoComTimer() {
    const q = _state.questoes[_state.qi];
    if (!q) { _renderResultadoComSave(); return; }

    _state.respondida = false;
    _state.escolha = null;

    const letras = ['A','B','C','D'];
    const box = _box();

    box.innerHTML = `
      ${_topbar(true)}
      <div class="duelo-body" id="duelo-q-body">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
          <div>
            <div class="duelo-q-num">Questão ${_state.qi + 1} de ${_state.questoes.length}</div>
            <div class="duelo-q-texto">${_esc(q.enunciado)}</div>
          </div>
          ${_state._timerSeg > 0 ? `<div class="duelo-timer-wrap" id="duelo-timer"></div>` : ''}
        </div>

        <div class="duelo-alts" id="duelo-alts">
          ${q.alternativas.map((alt, ai) => `
            <button class="duelo-alt" id="duelo-alt-${ai}" data-alt="${ai}">
              <span class="duelo-alt-letra">${letras[ai]}</span>
              <span>${_esc(alt)}</span>
            </button>
          `).join('')}
        </div>

        <div id="duelo-feedback-area"></div>
        <div id="duelo-next-area"></div>
      </div>
    `;

   
    document.querySelectorAll('#duelo-alts .duelo-alt').forEach(btn => {
      btn.addEventListener('click', () => _responderComTimer(parseInt(btn.dataset.alt)));
    });

    if (_state._timerSeg > 0) {
      _iniciarTimer(_state._timerSeg);
    }
  }


  function _responderComTimer(ai) {
    _pararTimer();
    if (_state.respondida) return;
    _state.respondida = true;
    _state.escolha = ai;


    if (!_state._respostas) _state._respostas = {};
    _state._respostas[_state.qi] = ai;

    const q = _state.questoes[_state.qi];
    const acertou = ai === q.correta;

    document.querySelectorAll('.duelo-alt').forEach(b => b.disabled = true);

    const btnEscolhido = document.getElementById(`duelo-alt-${ai}`);
    if (acertou) {
      btnEscolhido?.classList.add('correta');
    } else {
      btnEscolhido?.classList.add('errada');
      document.getElementById(`duelo-alt-${q.correta}`)?.classList.add('gabarito');
    }

    if (acertou) {
      _state.streak++;
      _state.maxStreak = Math.max(_state.maxStreak, _state.streak);
      _state.acertos++;
      const bonus = Math.min(_state.streak - 1, 5) * 2;
      const xpGanho = 10 + bonus;
      _state.xp += xpGanho;
      _state.totalXpSessao += xpGanho;
      _showXpPop(`+${xpGanho} XP`);
    } else {
      _state.streak = 0;
      _state.vidas--;
    }

    const box = _box();
    const oldTopbar = box.querySelector('.duelo-topbar');
    if (oldTopbar) {
      const tmp = document.createElement('div');
      tmp.innerHTML = _topbar(true);
      oldTopbar.replaceWith(tmp.firstElementChild);
    }

    const feedbackArea = document.getElementById('duelo-feedback-area');
    if (feedbackArea) {
      feedbackArea.innerHTML = acertou
        ? `<div class="duelo-feedback ok"><span class="duelo-feedback-icon">✅</span><div><strong>Correto!</strong>${q.explicacao ? _esc(q.explicacao) : 'Ótimo trabalho!'}</div></div>`
        : `<div class="duelo-feedback erro"><span class="duelo-feedback-icon">❌</span><div><strong>Incorreto!</strong>${q.explicacao ? _esc(q.explicacao) : 'Resposta errada.'}</div></div>`;
    }

    const nextArea = document.getElementById('duelo-next-area');
    if (nextArea) {
      const semVidas = _state.vidas <= 0;
      const ultimaQ = _state.qi >= _state.questoes.length - 1;
      if (semVidas || ultimaQ) {
        nextArea.innerHTML = `<button class="duelo-btn-next" id="duelo-btn-resultado">🏁 Ver resultado</button>`;
        document.getElementById('duelo-btn-resultado')
          ?.addEventListener('click', _renderResultadoComSave);
      } else {
        nextArea.innerHTML = `<button class="duelo-btn-next" id="duelo-btn-proxima">Próxima →</button>`;
        document.getElementById('duelo-btn-proxima')
          ?.addEventListener('click', _proximaQuestaoComTimer);
      }
    }
  }

  function _proximaQuestaoComTimer() {
    _state.qi++;
    if (_state.qi >= _state.questoes.length || _state.vidas <= 0) {
      _renderResultadoComSave();
    } else {
      _renderQuestaoComTimer();
    }
  }


  
  const _renderMenuPatch = () => _renderMenuComAbas('jogar');


  function _esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  
  return {
    abrir: () => {
    
      const _injectCSSOriginal = _injectCSS;
      _injectCSSOriginal();
      _injectCSSExtra();
      if (document.getElementById('duelo-overlay')) return;

      _state = {
        fase: 'menu', tema: '', questoes: [], qi: 0,
        vidas: 3, xp: 0, streak: 0, maxStreak: 0,
        acertos: 0, respondida: false, escolha: null, totalXpSessao: 0,
        _nivel: 'médio', _timerSeg: 0, _timerTotal: 0, _respostas: {},
        _temErros: () => false,
        _contarErros: () => 0,
      };

      const overlay = document.createElement('div');
      overlay.id = 'duelo-overlay';
      overlay.innerHTML = `<div id="duelo-box"></div>`;
      overlay.addEventListener('click', e => { if (e.target === overlay) fechar(); });
      document.body.appendChild(overlay);

      _renderMenuComAbas('jogar');
    },
    fechar,
    iniciar: _iniciarComExtras,
    responder: _responderComTimer,
    _responderComTimer,      
    _renderMenu: _renderMenuPatch,
    _renderResultado: _renderResultadoComSave,
    _proximaQuestao: _proximaQuestaoComTimer,
    _selecionarTema,
    _onTemaInput,
    _renderMenuComAbas,
    _renderRevisaoErros,
    _iniciarRevisaoGlobal,
    _renderResultadoComSave,
    _compartilhar,
  };
})();

window.ModoDuelo = ModoDuelo;