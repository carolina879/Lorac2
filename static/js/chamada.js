

const Chamada = (() => {

  
  const API         = 'http://localhost:8000';
  const LS_KEY      = (turmaId) => `studysync_chamada_${turmaId}`;
  const STATUS      = { P: 'presente', A: 'ausente', J: 'justificado' }; // Não usado diretamente, mas bom para referência
  const LABEL       = { P: 'Presente', A: 'Ausente', J: 'Justificado' };
  const COLOR       = { P: '#7bc47f', A: '#e07060', J: '#e8a04a' };
  const BG          = { P: 'rgba(123,196,127,0.12)', A: 'rgba(224,112,96,0.12)', J: 'rgba(232,160,74,0.12)' };
  const BORDER      = { P: 'rgba(123,196,127,0.35)', A: 'rgba(224,112,96,0.35)', J: 'rgba(232,160,74,0.35)' };

 
  let _turma        = null;   
  let _alunos       = [];   
  let _statusMap    = {};    
  let _data         = '';     
  let _descricao    = '';   
  let _overlayEl    = null;
  let _abaAtual     = 'chamada';
  let _historico    = [];     

 
  function _injectStyles() {
    if (document.getElementById('chamada-styles')) return;
    const s = document.createElement('style');
    s.id = 'chamada-styles';
    s.textContent = `
      
      #chamada-overlay {
        position: fixed; inset: 0; z-index: 10030;
        background: rgba(8,6,4,0.88);
        backdrop-filter: blur(16px);
        display: flex; align-items: center; justify-content: center;
        padding: 16px;
        animation: chFadeIn .22s ease;
      }
      @keyframes chFadeIn { from{opacity:0} to{opacity:1} }

     
      #chamada-modal {
        background: var(--bg-1, #181410);
        border: 1px solid var(--border, #3a3228);
        border-radius: 22px;
        width: min(780px, 100%);
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 40px 100px rgba(0,0,0,.7);
        animation: chSlideUp .28s cubic-bezier(.22,1,.36,1);
        overflow: hidden;
      }
      @keyframes chSlideUp {
        from { transform: translateY(32px); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }

     
      #chamada-header {
        display: flex; align-items: center; gap: 14px;
        padding: 20px 24px 0;
        flex-shrink: 0;
      }
      #chamada-header-icon {
        width: 44px; height: 44px; border-radius: 12px;
        background: var(--bg-3, #211d18);
        border: 1px solid var(--border, #3a3228);
        display: flex; align-items: center; justify-content: center;
        font-size: 22px; flex-shrink: 0;
      }
      #chamada-header-title {
        font-size: 18px; font-weight: 700;
        color: var(--text-0, #f0e8df);
        font-family: 'DM Serif Display', serif;
      }
      #chamada-header-sub {
        font-size: 12px; color: var(--text-2, #8a7a6a); margin-top: 2px;
      }
      #chamada-close {
        margin-left: auto; background: none; border: none;
        color: var(--text-2, #8a7a6a); font-size: 22px; cursor: pointer;
        padding: 4px 8px; border-radius: 8px; line-height: 1; flex-shrink: 0;
        transition: color .15s;
      }
      #chamada-close:hover { color: var(--text-0, #f0e8df); }

      
      #chamada-tabs {
        display: flex; gap: 4px;
        padding: 16px 24px 0;
        border-bottom: 1px solid var(--border, #3a3228);
        flex-shrink: 0;
      }
      .ch-tab {
        padding: 9px 18px; border: none; background: none;
        font-size: 13px; font-weight: 600; cursor: pointer;
        color: var(--text-2, #8a7a6a);
        border-bottom: 2px solid transparent;
        margin-bottom: -1px; transition: all .15s;
      }
      .ch-tab:hover { color: var(--text-0, #f0e8df); }
      .ch-tab.active {
        color: var(--accent, #e8a04a);
        border-bottom-color: var(--accent, #e8a04a);
      }

   
      #chamada-body {
        flex: 1; overflow-y: auto; padding: 20px 24px;
        scrollbar-width: thin;
        scrollbar-color: var(--border, #3a3228) transparent;
      }
      #chamada-body::-webkit-scrollbar { width: 5px; }
      #chamada-body::-webkit-scrollbar-track { background: transparent; }
      #chamada-body::-webkit-scrollbar-thumb { background: var(--border, #3a3228); border-radius: 3px; }

     
      #chamada-meta-bar {
        display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap;
      }
      .ch-meta-field {
        display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 160px;
      }
      .ch-meta-label {
        font-size: 10px; font-weight: 700; letter-spacing: .1em;
        text-transform: uppercase; color: var(--text-3, #5a4e44);
      }
      .ch-meta-input {
        background: var(--bg-3, #211d18);
        border: 1px solid var(--border, #3a3228);
        border-radius: 8px; padding: 8px 12px;
        font-size: 13px; color: var(--text-0, #f0e8df);
        outline: none; width: 100%; box-sizing: border-box;
        transition: border-color .15s;
      }
      .ch-meta-input:focus { border-color: var(--accent, #e8a04a); }

    
      #chamada-quick-bar {
        display: flex; align-items: center; gap: 8px;
        margin-bottom: 14px; flex-wrap: wrap;
      }
      #chamada-quick-bar span {
        font-size: 11px; color: var(--text-3, #5a4e44); font-weight: 600;
        text-transform: uppercase; letter-spacing: .08em; margin-right: 2px;
      }
      .ch-quick-btn {
        padding: 5px 12px; border-radius: 20px;
        border: 1px solid; font-size: 12px; font-weight: 600; cursor: pointer;
        transition: all .14s;
      }
      .ch-quick-btn.p {
        background: rgba(123,196,127,0.1); color: #7bc47f; border-color: rgba(123,196,127,0.3);
      }
      .ch-quick-btn.p:hover { background: rgba(123,196,127,0.22); }
      .ch-quick-btn.a {
        background: rgba(224,112,96,0.1); color: #e07060; border-color: rgba(224,112,96,0.3);
      }
      .ch-quick-btn.a:hover { background: rgba(224,112,96,0.22); }
      #chamada-search-wrap { margin-left: auto; position: relative; }
      #chamada-search {
        background: var(--bg-3, #211d18); border: 1px solid var(--border, #3a3228);
        border-radius: 20px; padding: 5px 12px 5px 30px;
        font-size: 12px; color: var(--text-0, #f0e8df); outline: none; width: 160px;
        transition: border-color .15s;
      }
      #chamada-search:focus { border-color: var(--accent, #e8a04a); }
      #chamada-search-icon {
        position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
        font-size: 12px; pointer-events: none; opacity: .5;
      }

      
      #chamada-alunos-list { display: flex; flex-direction: column; gap: 6px; }

      .ch-aluno-row {
        display: flex; align-items: center; gap: 12px;
        padding: 10px 14px; border-radius: 12px;
        border: 1px solid var(--border, #3a3228);
        background: var(--bg-2, #1a1612);
        transition: background .15s, border-color .15s;
      }
      .ch-aluno-row:hover { background: var(--bg-3, #211d18); }
      .ch-aluno-row.status-P { border-color: rgba(123,196,127,.3); background: rgba(123,196,127,.06); }
      .ch-aluno-row.status-A { border-color: rgba(224,112,96,.3);  background: rgba(224,112,96,.06);  }
      .ch-aluno-row.status-J { border-color: rgba(232,160,74,.3);  background: rgba(232,160,74,.06);  }

      .ch-aluno-num {
        font-size: 11px; color: var(--text-3, #5a4e44);
        font-family: 'DM Mono', monospace; width: 22px; text-align: right; flex-shrink: 0;
      }
      .ch-aluno-avatar {
        width: 34px; height: 34px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 14px; font-weight: 700; flex-shrink: 0;
        color: var(--bg-0, #0f0d0a);
      }
      .ch-aluno-name {
        flex: 1; font-size: 14px; font-weight: 600;
        color: var(--text-0, #f0e8df); white-space: nowrap;
        overflow: hidden; text-overflow: ellipsis;
      }
      .ch-aluno-status-badge {
        font-size: 11px; font-weight: 700; padding: 3px 10px;
        border-radius: 20px; flex-shrink: 0; min-width: 80px; text-align: center;
        transition: all .15s;
      }

      
      .ch-btns { display: flex; gap: 5px; flex-shrink: 0; }
      .ch-btn {
        width: 32px; height: 32px; border-radius: 8px;
        border: 1px solid; font-size: 13px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; transition: all .13s; background: transparent;
        flex-shrink: 0;
      }
      .ch-btn.p { border-color: rgba(123,196,127,.4); color: #7bc47f; }
      .ch-btn.p:hover, .ch-btn.p.active { background: rgba(123,196,127,.18); border-color: #7bc47f; transform: scale(1.08); }
      .ch-btn.a { border-color: rgba(224,112,96,.4); color: #e07060; }
      .ch-btn.a:hover, .ch-btn.a.active { background: rgba(224,112,96,.18); border-color: #e07060; transform: scale(1.08); }
      .ch-btn.j { border-color: rgba(232,160,74,.4); color: var(--accent, #e8a04a); }
      .ch-btn.j:hover, .ch-btn.j.active { background: rgba(232,160,74,.18); border-color: var(--accent, #e8a04a); transform: scale(1.08); }

      
      #chamada-footer {
        padding: 16px 24px;
        border-top: 1px solid var(--border, #3a3228);
        display: flex; align-items: center; gap: 12px; flex-shrink: 0;
        flex-wrap: wrap;
      }
      .ch-summary-chip {
        display: flex; align-items: center; gap: 6px;
        padding: 6px 14px; border-radius: 20px;
        font-size: 13px; font-weight: 700;
        font-family: 'DM Mono', monospace;
      }
      .ch-summary-chip.p { background: rgba(123,196,127,.13); color: #7bc47f; }
      .ch-summary-chip.a { background: rgba(224,112,96,.13);  color: #e07060; }
      .ch-summary-chip.j { background: rgba(232,160,74,.13);  color: var(--accent, #e8a04a); }
      .ch-summary-chip .ch-dot {
        width: 7px; height: 7px; border-radius: 50%; background: currentColor;
      }
      #chamada-footer-btns { margin-left: auto; display: flex; gap: 8px; }
      .ch-footer-btn {
        padding: 9px 18px; border-radius: 10px;
        font-size: 13px; font-weight: 600; cursor: pointer;
        border: 1px solid var(--border, #3a3228);
        background: var(--bg-3, #211d18);
        color: var(--text-1, #c8b89a);
        display: flex; align-items: center; gap: 6px;
        transition: all .15s;
      }
      .ch-footer-btn:hover { background: var(--bg-2, #1a1612); }
      .ch-footer-btn.primary {
        background: var(--accent, #e8a04a);
        color: var(--bg-0, #0f0d0a);
        border-color: var(--accent, #e8a04a);
      }
      .ch-footer-btn.primary:hover { opacity: .88; }
      .ch-footer-btn:disabled { opacity: .4; cursor: default; pointer-events: none; }

     
      #chamada-historico-list { display: flex; flex-direction: column; gap: 10px; }

      .ch-hist-card {
        border: 1px solid var(--border, #3a3228);
        border-radius: 14px; overflow: hidden;
        background: var(--bg-2, #1a1612);
        transition: border-color .15s;
      }
      .ch-hist-card:hover { border-color: rgba(232,160,74,.3); }

      .ch-hist-header {
        display: flex; align-items: center; gap: 12px;
        padding: 14px 16px; cursor: pointer;
      }
      .ch-hist-date {
        font-size: 15px; font-weight: 700;
        color: var(--text-0, #f0e8df);
        font-family: 'DM Mono', monospace;
      }
      .ch-hist-desc {
        font-size: 12px; color: var(--text-2, #8a7a6a);
        flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .ch-hist-chips { display: flex; gap: 6px; margin-left: auto; }
      .ch-hist-chip {
        font-size: 11px; font-weight: 700; padding: 2px 9px; border-radius: 20px;
        font-family: 'DM Mono', monospace;
      }
      .ch-hist-chip.p { background: rgba(123,196,127,.13); color: #7bc47f; }
      .ch-hist-chip.a { background: rgba(224,112,96,.13);  color: #e07060; }
      .ch-hist-chip.j { background: rgba(232,160,74,.13);  color: var(--accent, #e8a04a); }
      .ch-hist-expand { font-size: 12px; color: var(--text-3, #5a4e44); transition: transform .2s; }
      .ch-hist-card.open .ch-hist-expand { transform: rotate(180deg); }

      .ch-hist-detail {
        display: none; padding: 0 16px 14px;
        border-top: 1px solid var(--border, #3a3228);
      }
      .ch-hist-card.open .ch-hist-detail { display: block; }

      .ch-hist-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      .ch-hist-table th {
        font-size: 10px; font-weight: 700; letter-spacing: .08em;
        text-transform: uppercase; color: var(--text-3, #5a4e44);
        text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--border, #3a3228);
      }
      .ch-hist-table td {
        font-size: 13px; padding: 7px 8px;
        border-bottom: 1px solid rgba(255,255,255,.03);
        color: var(--text-0, #f0e8df);
      }
      .ch-hist-table tr:last-child td { border-bottom: none; }
      .ch-status-pill {
        display: inline-block; padding: 2px 10px; border-radius: 20px;
        font-size: 11px; font-weight: 700;
      }
      .ch-status-pill.P { background: rgba(123,196,127,.15); color: #7bc47f; }
      .ch-status-pill.A { background: rgba(224,112,96,.15);  color: #e07060; }
      .ch-status-pill.J { background: rgba(232,160,74,.15);  color: var(--accent, #e8a04a); }

      .ch-hist-actions {
        display: flex; gap: 8px; margin-top: 12px; justify-content: flex-end;
      }
      .ch-hist-btn {
        padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
        cursor: pointer; border: 1px solid var(--border, #3a3228);
        background: var(--bg-3, #211d18); color: var(--text-1, #c8b89a);
        transition: all .14s;
      }
      .ch-hist-btn:hover { background: var(--accent, #e8a04a); color: var(--bg-0, #0f0d0a); border-color: var(--accent, #e8a04a); }
      .ch-hist-btn.danger:hover { background: #e07060; color: #fff; border-color: #e07060; }

      
      .ch-empty {
        text-align: center; padding: 48px 24px;
        color: var(--text-3, #5a4e44);
      }
      .ch-empty-icon { font-size: 48px; margin-bottom: 12px; }
      .ch-empty-text { font-size: 14px; }

      
      #chamada-freq-geral {
        background: var(--bg-3, #211d18);
        border: 1px solid var(--border, #3a3228);
        border-radius: 12px; padding: 14px 16px;
        margin-bottom: 16px;
        display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
      }
      .ch-freq-title { font-size: 12px; font-weight: 700; color: var(--text-2, #8a7a6a); text-transform: uppercase; letter-spacing: .08em; }
      .ch-freq-bar-wrap { flex: 1; min-width: 120px; height: 8px; background: var(--bg-1, #181410); border-radius: 20px; overflow: hidden; }
      .ch-freq-bar { height: 100%; background: linear-gradient(90deg, #7bc47f, #50b455); border-radius: 20px; transition: width .6s cubic-bezier(.22,1,.36,1); }
      .ch-freq-pct { font-size: 18px; font-weight: 700; color: var(--accent, #e8a04a); font-family: 'DM Mono', monospace; }

    
      .btn-chamada-turma {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;
        background: var(--bg-3, #211d18); border: 1px solid var(--border, #3a3228);
        color: var(--text-1, #c8b89a); cursor: pointer; transition: all .15s;
        white-space: nowrap;
      }
      .btn-chamada-turma:hover {
        background: var(--accent, #e8a04a); color: var(--bg-0, #0f0d0a);
        border-color: var(--accent, #e8a04a);
      }
    `;
    document.head.appendChild(s);
  }

 
  const _COLORS = [
    ['#e8a04a','#0f0d0a'],['#c96a4a','#0f0d0a'],['#7a9e7e','#0f0d0a'],
    ['#a0c4e8','#0f0d0a'],['#c8a0e8','#0f0d0a'],['#e8c4a0','#0f0d0a'],['#a0e8c4','#0f0d0a'],
  ];
  function _avatarColor(name) {
    let h = 0;
    for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
    return _COLORS[h % _COLORS.length];
  }
  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }



  function _carregarHistorico() {
    try {
      const raw = localStorage.getItem(LS_KEY(_turma.id));
      _historico = raw ? JSON.parse(raw) : [];
    } catch { _historico = []; }
  }

  function _salvarHistoricoLocal(entrada) {
    _historico.unshift(entrada); // mais recente primeiro
    try { localStorage.setItem(LS_KEY(_turma.id), JSON.stringify(_historico)); } catch {}
  }

  function _deletarEntrada(id) {
    _historico = _historico.filter(e => e.id !== id);
    try { localStorage.setItem(LS_KEY(_turma.id), JSON.stringify(_historico)); } catch {}
  }

  async function _salvarNaAPI(entrada) {
    try {
      const res = await fetch(`${API}/api/turmas/${_turma.id}/chamada`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entrada),
      });
   
      if (!res.ok && res.status !== 404) {
        console.warn('[Chamada] API retornou', res.status, '— usando localStorage.');
      }
    } catch {
      
    }
  }

 
  function abrir(turma) {
    if (!turma) {
   
      turma = (typeof App !== 'undefined' && App.getState) ? App.getState().currentTurma : null;
    }
    if (!turma) { _toast('Turma não encontrada.', 'error'); return; }

    _injectStyles();
    _turma   = turma;
    _alunos  = turma.students || [];
    _data    = new Date().toISOString().slice(0, 10);
    _descricao = '';
    _abaAtual  = 'chamada';

    
    _statusMap = {};
    _alunos.forEach(a => { _statusMap[a.id] = null; });

    _carregarHistorico();
    _montarOverlay();
  }

 
  function _montarOverlay() {
    fechar();
    _overlayEl = document.createElement('div');
    _overlayEl.id = 'chamada-overlay';
    _overlayEl.innerHTML = `
      <div id="chamada-modal">
        <!-- Header -->
        <div id="chamada-header">
          <div id="chamada-header-icon">📋</div>
          <div>
            <div id="chamada-header-title">Lista de Presença</div>
            <div id="chamada-header-sub">${_esc(_turma.name)}</div>
          </div>
          <button id="chamada-close" onclick="Chamada.fechar()">&#10005;</button>
        </div>

        
        <div id="chamada-tabs">
          <button class="ch-tab active" id="ch-tab-chamada" onclick="Chamada._trocarAba('chamada')">
            ✏️ Nova Chamada
          </button>
          <button class="ch-tab" id="ch-tab-historico" onclick="Chamada._trocarAba('historico')">
            📅 Histórico
            <span id="ch-hist-count" style="margin-left:5px;background:var(--bg-3,#211d18);border-radius:20px;padding:1px 7px;font-size:11px;">
              ${_historico.length}
            </span>
          </button>
        </div>

     
        <div id="chamada-body">
          <div id="ch-panel-chamada">${_renderPainelChamada()}</div>
          <div id="ch-panel-historico" style="display:none;">${_renderPainelHistorico()}</div>
        </div>

       
        <div id="chamada-footer">
          ${_renderFooter()}
        </div>
      </div>
    `;
    _overlayEl.addEventListener('click', e => { if (e.target === _overlayEl) fechar(); });
    document.body.appendChild(_overlayEl);
  }

  
  function _renderPainelChamada() {
    if (!_alunos.length) {
      return `<div class="ch-empty">
        <div class="ch-empty-icon">👥</div>
        <div class="ch-empty-text">Nenhum aluno matriculado nesta turma ainda.</div>
      </div>`;
    }

    const linhas = _alunos.map((a, i) => _renderLinhaAluno(a, i)).join('');

    return `
   
      <div id="chamada-meta-bar">
        <div class="ch-meta-field" style="max-width:180px;">
          <span class="ch-meta-label">Data da Aula</span>
          <input class="ch-meta-input" id="ch-input-data" type="date" value="${_data}"
            onchange="Chamada._setData(this.value)" />
        </div>
        <div class="ch-meta-field">
          <span class="ch-meta-label">Assunto / Descrição</span>
          <input class="ch-meta-input" id="ch-input-desc" type="text" maxlength="120"
            placeholder="Ex.: Funções do 2º grau, Revolução Francesa..."
            value="${_esc(_descricao)}"
            oninput="Chamada._setDesc(this.value)" />
        </div>
      </div>

     
      <div id="chamada-quick-bar">
        <span>Marcar todos:</span>
        <button class="ch-quick-btn p" onclick="Chamada._marcarTodos('P')">✓ Todos presentes</button>
        <button class="ch-quick-btn a" onclick="Chamada._marcarTodos('A')">✗ Todos ausentes</button>
        <div id="chamada-search-wrap">
          <span id="chamada-search-icon">🔍</span>
          <input id="chamada-search" type="text" placeholder="Buscar aluno..."
            oninput="Chamada._filtrar(this.value)" />
        </div>
      </div>

     
      <div id="chamada-alunos-list">
        ${linhas}
      </div>
    `;
  }

  function _renderLinhaAluno(aluno, idx) {
    const st    = _statusMap[aluno.id];      
    const nome  = aluno.username || 'Aluno';
    const [bg]  = _avatarColor(nome);
    const rowCls = st ? `ch-aluno-row status-${st}` : 'ch-aluno-row';

    const badgeHtml = st
      ? `<span class="ch-aluno-status-badge" style="background:${BG[st]};color:${COLOR[st]};border:1px solid ${BORDER[st]};">${LABEL[st]}</span>`
      : `<span class="ch-aluno-status-badge" style="background:var(--bg-3,#211d18);color:var(--text-3,#5a4e44);border:1px solid var(--border,#3a3228);">—</span>`;

    return `
      <div class="ch-aluno-row ${st ? 'status-' + st : ''}" id="ch-row-${_esc(aluno.id)}" data-nome="${_esc(nome.toLowerCase())}">
        <span class="ch-aluno-num">${idx + 1}</span>
        <div class="ch-aluno-avatar" style="background:${bg};color:var(--bg-0,#0f0d0a);">
          ${_esc(nome[0].toUpperCase())}
        </div>
        <span class="ch-aluno-name">${_esc(nome)}</span>
        ${badgeHtml}
        <div class="ch-btns">
          <button class="ch-btn p ${st === 'P' ? 'active' : ''}" title="Presente"
            onclick="Chamada._marcar('${_esc(aluno.id)}','P')">P</button>
          <button class="ch-btn a ${st === 'A' ? 'active' : ''}" title="Ausente"
            onclick="Chamada._marcar('${_esc(aluno.id)}','A')">F</button>
          <button class="ch-btn j ${st === 'J' ? 'active' : ''}" title="Justificado"
            onclick="Chamada._marcar('${_esc(aluno.id)}','J')">J</button>
        </div>
      </div>`;
  }

 
  function _renderPainelHistorico() {
    if (!_historico.length) {
      return `<div class="ch-empty">
        <div class="ch-empty-icon">📅</div>
        <div class="ch-empty-text">Nenhuma chamada registrada ainda.<br>Faça a primeira chamada e salve!</div>
      </div>`;
    }

    const pcts = _historico.map(h => {
      const total = h.registros.length;
      const pres  = h.registros.filter(r => r.status === 'P' || r.status === 'J').length;
      return total ? (pres / total) * 100 : 0;
    });
    const mediaFreq = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0;

    const cards = _historico.map(entrada => _renderHistCard(entrada)).join('');

    return `
      <div id="chamada-freq-geral">
        <div>
          <div class="ch-freq-title">Frequência Geral Média</div>
        </div>
        <div class="ch-freq-bar-wrap">
          <div class="ch-freq-bar" style="width:${mediaFreq}%"></div>
        </div>
        <div class="ch-freq-pct">${mediaFreq}%</div>
      </div>

      <div id="chamada-historico-list">
        ${cards}
      </div>

      <div style="margin-top:14px;text-align:right;">
        <button class="ch-footer-btn" onclick="Chamada.exportarCSV()" style="display:inline-flex;">
          ⬇️ Exportar Histórico Completo (CSV)
        </button>
      </div>
    `;
  }

  function _renderHistCard(entrada) {
    const dateLabel = _formatarData(entrada.data);
    const presentes    = entrada.registros.filter(r => r.status === 'P').length;
    const ausentes     = entrada.registros.filter(r => r.status === 'A').length;
    const justificados = entrada.registros.filter(r => r.status === 'J').length;

    const linhasTabela = entrada.registros.map((r, i) => `
      <tr>
        <td style="color:var(--text-3,#5a4e44);font-family:'DM Mono',monospace;">${i + 1}</td>
        <td>${_esc(r.nome)}</td>
        <td><span class="ch-status-pill ${r.status}">${LABEL[r.status]}</span></td>
      </tr>
    `).join('');

    return `
      <div class="ch-hist-card" id="ch-hist-${entrada.id}">
        <div class="ch-hist-header" onclick="Chamada._toggleHistCard('${entrada.id}')">
          <div>
            <div class="ch-hist-date">📅 ${dateLabel}</div>
            ${entrada.descricao ? `<div class="ch-hist-desc">${_esc(entrada.descricao)}</div>` : ''}
          </div>
          <div class="ch-hist-chips">
            <span class="ch-hist-chip p">✓ ${presentes}</span>
            <span class="ch-hist-chip a">✗ ${ausentes}</span>
            ${justificados ? `<span class="ch-hist-chip j">J ${justificados}</span>` : ''}
          </div>
          <span class="ch-hist-expand">▼</span>
        </div>
        <div class="ch-hist-detail">
          <table class="ch-hist-table">
            <thead><tr><th>#</th><th>Aluno</th><th>Status</th></tr></thead>
            <tbody>${linhasTabela}</tbody>
          </table>
          <div class="ch-hist-actions">
            <button class="ch-hist-btn" onclick="Chamada.exportarCSVEntrada('${entrada.id}')">
              ⬇️ Exportar esta chamada
            </button>
            <button class="ch-hist-btn danger" onclick="Chamada._deletarHistorico('${entrada.id}')">
              🗑️ Excluir
            </button>
          </div>
        </div>
      </div>
    `;
  }

 
  function _renderFooter() {
    if (_abaAtual === 'historico') {
      return `<div style="flex:1;font-size:13px;color:var(--text-3,#5a4e44);">
        ${_historico.length} chamada${_historico.length !== 1 ? 's' : ''} registrada${_historico.length !== 1 ? 's' : ''}
      </div>
      <div id="chamada-footer-btns">
        <button class="ch-footer-btn" onclick="Chamada.fechar()">Fechar</button>
      </div>`;
    }

    const totais = _contarTotais();
    return `
      <div class="ch-summary-chip p"><div class="ch-dot"></div>${totais.P}</div>
      <div class="ch-summary-chip a"><div class="ch-dot"></div>${totais.A}</div>
      <div class="ch-summary-chip j"><div class="ch-dot"></div>${totais.J}</div>
      <span style="font-size:12px;color:var(--text-3,#5a4e44);">
        ${totais.total - totais.P - totais.A - totais.J} sem marcação
      </span>
      <div id="chamada-footer-btns">
        <button class="ch-footer-btn" onclick="Chamada.fechar()">Cancelar</button>
        <button class="ch-footer-btn primary" id="ch-btn-salvar" onclick="Chamada.salvar()">
          💾 Salvar Chamada
        </button>
      </div>
    `;
  }

  function _atualizarFooter() {
    const footer = document.getElementById('chamada-footer');
    if (footer) footer.innerHTML = _renderFooter();
  }

 

  function _trocarAba(aba) {
    _abaAtual = aba;
    document.getElementById('ch-tab-chamada')?.classList.toggle('active', aba === 'chamada');
    document.getElementById('ch-tab-historico')?.classList.toggle('active', aba === 'historico');
    document.getElementById('ch-panel-chamada').style.display   = aba === 'chamada'   ? '' : 'none';
    document.getElementById('ch-panel-historico').style.display = aba === 'historico' ? '' : 'none';
    _atualizarFooter();
  }

  function _setData(v)  { _data = v; }
  function _setDesc(v)  { _descricao = v; }

  function _marcar(alunoId, status) {
   
    _statusMap[alunoId] = _statusMap[alunoId] === status ? null : status;
    _atualizarLinhaAluno(alunoId);
    _atualizarFooter();
  }

  function _marcarTodos(status) {
    _alunos.forEach(a => { _statusMap[a.id] = status; });
  
    const lista = document.getElementById('chamada-alunos-list');
    if (lista) lista.innerHTML = _alunos.map((a, i) => _renderLinhaAluno(a, i)).join('');
    _atualizarFooter();
  }

  function _atualizarLinhaAluno(alunoId) {
    const aluno = _alunos.find(a => a.id === alunoId);
    if (!aluno) return;
    const idx = _alunos.indexOf(aluno);
    const row = document.getElementById('ch-row-' + alunoId);
    if (!row) return;
    row.outerHTML = _renderLinhaAluno(aluno, idx);
  }

  function _filtrar(texto) {
    const q = texto.toLowerCase().trim();
    document.querySelectorAll('#chamada-alunos-list .ch-aluno-row').forEach(row => {
      const nome = row.dataset.nome || '';
      row.style.display = (!q || nome.includes(q)) ? '' : 'none';
    });
  }

  function _toggleHistCard(id) {
    const card = document.getElementById('ch-hist-' + id);
    if (card) card.classList.toggle('open');
  }

  function _deletarHistorico(id) {
    if (!confirm('Excluir esta chamada do histórico?')) return;
    _deletarEntrada(id);
  
    const panel = document.getElementById('ch-panel-historico');
    if (panel) panel.innerHTML = _renderPainelHistorico();
    _atualizarFooter();
   
    const countEl = document.getElementById('ch-hist-count');
    if (countEl) countEl.textContent = _historico.length;
  }

  
  async function salvar() {
    const data   = document.getElementById('ch-input-data')?.value  || _data;
    const desc   = document.getElementById('ch-input-desc')?.value  || _descricao;

    if (!_alunos.length) { _toast('Nenhum aluno na turma.', 'error'); return; }

  
    const semMarcacao = _alunos.filter(a => !_statusMap[a.id]);
    if (semMarcacao.length > 0) {
      const nomes = semMarcacao.slice(0, 3).map(a => a.username).join(', ');
      const extra = semMarcacao.length > 3 ? ` e mais ${semMarcacao.length - 3}` : '';
      if (!confirm(`${semMarcacao.length} aluno(s) sem marcação: ${nomes}${extra}.\n\nMarcar automaticamente como Ausente?`)) return;
      semMarcacao.forEach(a => { _statusMap[a.id] = 'A'; });
    }

    const btn = document.getElementById('ch-btn-salvar');
    if (btn) { btn.disabled = true; btn.textContent = 'Salvando…'; }

    const registros = _alunos.map(a => ({
      alunoId: a.id,
      nome:    a.username || 'Aluno',
      status:  _statusMap[a.id] || 'A',
    }));

    const entrada = {
      id:         `ch_${Date.now()}`,
      turmaId:    _turma.id,
      turmaNome:  _turma.name,
      data,
      descricao:  desc.trim(),
      registros,
      savedAt:    new Date().toISOString(),
    };

    _salvarHistoricoLocal(entrada);
    await _salvarNaAPI(entrada);

   
    const countEl = document.getElementById('ch-hist-count');
    if (countEl) countEl.textContent = _historico.length;

    _toast('✅ Chamada salva com sucesso!', 'success');

    
    setTimeout(() => {
      const panel = document.getElementById('ch-panel-historico');
      if (panel) panel.innerHTML = _renderPainelHistorico();
      _trocarAba('historico');
    }, 400);
  }

  
  function exportarCSV() {
    if (!_historico.length) { _toast('Nenhuma chamada para exportar.', 'error'); return; }
    const csv = _gerarCSVCompleto(_historico, _turma.name);
    _downloadCSV(csv, `chamada_${_turma.name.replace(/\s+/g,'_')}_historico.csv`);
    _toast('📥 CSV baixado!', 'success');
  }

  function exportarCSVEntrada(entradaId) {
    const entrada = _historico.find(e => e.id === entradaId);
    if (!entrada) return;
    const csv = _gerarCSVEntrada(entrada);
    const nomArq = `chamada_${entrada.data}_${_turma.name.replace(/\s+/g,'_')}.csv`;
    _downloadCSV(csv, nomArq);
    _toast('📥 CSV baixado!', 'success');
  }

  
  function _gerarCSVEntrada(entrada) {
    const linhas = [
      ['Turma', 'Data', 'Assunto', 'Aluno', 'Status'],
      ...entrada.registros.map(r => [
        entrada.turmaNome || '',
        entrada.data,
        entrada.descricao || '',
        r.nome,
        LABEL[r.status] || r.status,
      ])
    ];
    return linhas.map(l => l.map(_csvCell).join(',')).join('\r\n');
  }

  
  function _gerarCSVCompleto(historico, turmaNome) {
    
    const ordenado = [...historico].sort((a, b) => a.data.localeCompare(b.data));

   
    const alunosSet = new Set();
    ordenado.forEach(e => e.registros.forEach(r => alunosSet.add(r.nome)));
    const alunosLista = Array.from(alunosSet).sort();

 
    const cabData = ordenado.flatMap(e => [`${e.data} Status`, `${e.data} Aula`]);
    const cabecalho = ['Aluno', ...cabData, 'Total Aulas', 'Presentes', 'Ausentes', 'Freq%'];

    const linhas = alunosLista.map(nome => {
      const vals = ordenado.flatMap(e => {
        const reg = e.registros.find(r => r.nome === nome);
        return reg ? [LABEL[reg.status], e.descricao || ''] : ['—', ''];
      });
      const totAulas = ordenado.length;
      const totPres  = ordenado.filter(e => {
        const r = e.registros.find(r => r.nome === nome);
        return r && (r.status === 'P' || r.status === 'J');
      }).length;
      const totAus   = totAulas - totPres;
      const freq     = totAulas ? Math.round((totPres / totAulas) * 100) + '%' : '—';
      return [nome, ...vals, totAulas, totPres, totAus, freq];
    });

    return [cabecalho, ...linhas]
      .map(l => l.map(_csvCell).join(','))
      .join('\r\n');
  }

  function _csvCell(v) {
    const s = String(v == null ? '' : v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  function _downloadCSV(csv, filename) {
    const bom  = '\uFEFF'; // BOM para UTF-8 (Excel)
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }

  
  function _contarTotais() {
    const totais = { P: 0, A: 0, J: 0, total: _alunos.length };
    _alunos.forEach(a => {
      const s = _statusMap[a.id];
      if (s) totais[s]++;
    });
    return totais;
  }

  function _formatarData(isoDate) {
    if (!isoDate) return '—';
    const [y, m, d] = isoDate.split('-');
    const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return `${d} ${MESES[parseInt(m, 10) - 1]} ${y}`;
  }

  function _toast(msg, tipo = 'info') {
    if (typeof App !== 'undefined' && App.toast) {
      App.toast(msg, tipo);
    } else {
      console.log(`[Chamada] ${msg}`);
    }
  }

  
  function fechar() {
    if (_overlayEl) { _overlayEl.remove(); _overlayEl = null; }
  }

  
  function _injetarBotaoTurma() {
  
    if (document.getElementById('btn-chamada-turma')) return;

  
    const appState = (typeof App !== 'undefined' && App.getState) ? App.getState() : null;
    if (!appState) return;

    const turma = appState.currentTurma;
    const user  = appState.user;
    if (!turma || !user) return;

    const isProfessor = user.role === 'professor' && turma.professor_id === user.id;
    if (!isProfessor) return;

   
    const actionBar = document.querySelector('.turma-action-bar');
    if (!actionBar) return;

    const btn = document.createElement('button');
    btn.id        = 'btn-chamada-turma';
    btn.className = 'btn-turma-action btn-chamada-turma';
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 11l3 3L22 4"/>
        <rect x="3" y="3" width="18" height="18" rx="2"/>
      </svg>
      Chamada
    `;
    btn.onclick = () => {
      const t = (typeof App !== 'undefined' && App.getState) ? App.getState().currentTurma : null;
      Chamada.abrir(t);
    };
    actionBar.appendChild(btn);
  }


  const _observer = new MutationObserver(() => _injetarBotaoTurma());
  document.addEventListener('DOMContentLoaded', () => {
    _observer.observe(document.body, { childList: true, subtree: true });
  });

 
  return {
    abrir,
    fechar,
    salvar,
    exportarCSV,
    exportarCSVEntrada,
    _trocarAba,
    _setData,
    _setDesc,
    _marcar,
    _marcarTodos,
    _filtrar,
    _toggleHistCard,
    _deletarHistorico,
  };
})();

window.Chamada = Chamada;