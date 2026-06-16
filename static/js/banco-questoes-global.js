const BancoGlobal = (() => {



  const API_BASE    = ''; 
  const LS_KEY      = 'ss_banco_global';
  const LS_META_KEY = 'ss_banco_meta';
  const MODAL_ID    = 'modal-banco-global';

  const NIVEIS = ['Fácil', 'Médio', 'Difícil'];

  const DISCIPLINAS = [
    'Matemática', 'Português', 'História', 'Geografia', 'Ciências',
    'Biologia', 'Física', 'Química', 'Inglês', 'Artes',
    'Educação Física', 'Filosofia', 'Sociologia', 'Informática', 'Outro',
  ];

  
  const DEMO_QUESTOES = [
    {
      id: 'bq_demo_001',
      enunciado: 'Qual é o resultado de 2³ + √16?',
      tipo: 'marcar',
      alternativas: ['10', '12', '14', '16'],
      correta: 1,
      dica: 'Lembre: 2³ = 8 e √16 = 4',
      nivel: 'Fácil',
      disciplina: 'Matemática',
      temas: ['potenciação', 'radiciação'],
      autor: 'Prof. Demo',
      usos: 34,
      createdAt: Date.now() - 86400000 * 5,
    },
    {
      id: 'bq_demo_002',
      enunciado: 'Explique a diferença entre célula procarionte e eucarionte.',
      tipo: 'escrever',
      alternativas: [],
      correta: null,
      dica: '',
      nivel: 'Médio',
      disciplina: 'Biologia',
      temas: ['citologia', 'células'],
      autor: 'Prof. Demo',
      usos: 21,
      createdAt: Date.now() - 86400000 * 3,
    },
    {
      id: 'bq_demo_003',
      enunciado: 'A Revolução Francesa ocorreu em qual ano?',
      tipo: 'marcar',
      alternativas: ['1776', '1789', '1815', '1804'],
      correta: 1,
      dica: 'Lema: Liberdade, Igualdade, Fraternidade',
      nivel: 'Fácil',
      disciplina: 'História',
      temas: ['revoluções', 'história moderna'],
      autor: 'Prof. Demo',
      usos: 58,
      createdAt: Date.now() - 86400000 * 10,
    },
    {
      id: 'bq_demo_004',
      enunciado: 'Qual lei da termodinâmica afirma que a energia não pode ser criada nem destruída?',
      tipo: 'marcar',
      alternativas: ['Lei Zero', 'Primeira Lei', 'Segunda Lei', 'Terceira Lei'],
      correta: 1,
      dica: 'Princípio da conservação da energia',
      nivel: 'Médio',
      disciplina: 'Física',
      temas: ['termodinâmica', 'energia'],
      autor: 'Prof. Demo',
      usos: 29,
      createdAt: Date.now() - 86400000 * 7,
    },
    {
      id: 'bq_demo_005',
      enunciado: 'Disserte sobre as causas e consequências da Segunda Guerra Mundial.',
      tipo: 'escrever',
      alternativas: [],
      correta: null,
      dica: 'Considere aspectos políticos, econômicos e sociais.',
      nivel: 'Difícil',
      disciplina: 'História',
      temas: ['segunda guerra', 'conflitos mundiais', 'século XX'],
      autor: 'Prof. Demo',
      usos: 15,
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'bq_demo_006',
      enunciado: 'Qual é a fórmula molecular da água?',
      tipo: 'marcar',
      alternativas: ['CO₂', 'H₂O', 'NaCl', 'O₂'],
      correta: 1,
      dica: 'Hidrogênio e Oxigênio',
      nivel: 'Fácil',
      disciplina: 'Química',
      temas: ['compostos', 'fórmulas'],
      autor: 'Prof. Demo',
      usos: 72,
      createdAt: Date.now() - 86400000 * 15,
    },
    {
      id: 'bq_demo_007',
      enunciado: 'Em inglês, como se diz "eu gostaria de um copo de água, por favor"?',
      tipo: 'marcar',
      alternativas: [
        'I want water.',
        'I would like a glass of water, please.',
        'Give me water.',
        'Water, please give.',
      ],
      correta: 1,
      dica: 'Use "would like" para ser mais educado.',
      nivel: 'Fácil',
      disciplina: 'Inglês',
      temas: ['vocabulário', 'cotidiano'],
      autor: 'Prof. Demo',
      usos: 43,
      createdAt: Date.now() - 86400000 * 6,
    },
    {
      id: 'bq_demo_008',
      enunciado: 'O que é fotossíntese e quais são seus principais produtos?',
      tipo: 'escrever',
      alternativas: [],
      correta: null,
      dica: 'Pense em clorofila, luz solar, CO₂ e H₂O.',
      nivel: 'Médio',
      disciplina: 'Biologia',
      temas: ['fotossíntese', 'plantas', 'metabolismo'],
      autor: 'Prof. Demo',
      usos: 38,
      createdAt: Date.now() - 86400000 * 4,
    },
  ];

  

  let _state = {
    questoes: [],      
    filtered: [],       
    selected: new Set(), 
    page: 0,
    perPage: 8,
    search: '',
    filtDisciplina: '',
    filtTipo: '',
    filtNivel: '',
    turmaId: null,       
    loading: false,
    tab: 'browse',      
    preview: null,       
  };

  

  function _load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const saved = raw ? JSON.parse(raw) : [];
    
      const savedIds = new Set(saved.map(q => q.id));
      const demos = DEMO_QUESTOES.filter(d => !savedIds.has(d.id));
      return [...saved, ...demos];
    } catch { return [...DEMO_QUESTOES]; }
  }

  function _save(questoes) {
   
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(questoes));
      localStorage.setItem(LS_META_KEY, JSON.stringify({
        totalPublicadas: questoes.length,
        ultimaAtualizacao: Date.now(),
      }));
    } catch {}
  }

  function _genId() {
    return 'bq_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

 
  async function _fetchBackend(params = {}) {
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/api/banco-global?${qs}`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return Array.isArray(data.questoes) ? data.questoes : null;
    } catch { return null; }
  }

  async function _postBackend(questao) {
    try {
      const res = await fetch(`${API_BASE}/api/banco-global`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questao),
        signal: AbortSignal.timeout(4000),
      });
      return res.ok;
    } catch { return false; }
  }

  

  function _applyFilters() {
    const { search, filtDisciplina, filtTipo, filtNivel, questoes } = _state;
    const q = search.toLowerCase().trim();
    _state.filtered = questoes.filter(item => {
      if (filtDisciplina && item.disciplina !== filtDisciplina) return false;
      if (filtTipo && item.tipo !== filtTipo) return false;
      if (filtNivel && item.nivel !== filtNivel) return false;
      if (q) {
        const hay = [
          item.enunciado,
          item.disciplina,
          ...(item.temas || []),
          item.autor || '',
        ].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    _state.page = 0;
  }

 

  async function open(turmaId) {
    _state.turmaId = turmaId;
    _state.selected.clear();
    _state.search = '';
    _state.filtDisciplina = '';
    _state.filtTipo = '';
    _state.filtNivel = '';
    _state.tab = 'browse';
    _state.preview = null;
    _state.page = 0;

    
    document.getElementById(MODAL_ID)?.remove();

    
    _injectStyles();

   
    const overlay = document.createElement('div');
    overlay.id = MODAL_ID;
    overlay.className = 'ex-modal-overlay bq-overlay';
    overlay.innerHTML = `
      <div class="ex-modal-box bq-modal" role="dialog" aria-modal="true" aria-label="Banco de Questões Global">
        <div class="ex-modal-header bq-header">
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="bq-header-icon">🌐</div>
            <div>
              <h3 style="margin:0;">Banco de Questões Global</h3>
              <div class="ex-modal-subtitle">Questões compartilhadas por todos os professores</div>
            </div>
          </div>
          <button class="ex-modal-close" onclick="BancoGlobal.close()" aria-label="Fechar">✕</button>
        </div>


        <div class="bq-tabs">
          <button id="bq-tab-browse" class="bq-tab bq-tab-active" onclick="BancoGlobal._switchTab('browse')">
             Explorar Questões
          </button>
          <button id="bq-tab-publicar" class="bq-tab" onclick="BancoGlobal._switchTab('publicar')">
             Publicar Questão
          </button>
        </div>

  
        <div id="bq-panel-browse" class="bq-panel">
          <!-- Barra de Filtros -->
          <div class="bq-filters">
            <div class="bq-search-wrap">
              <span class="bq-search-icon">🔍</span>
              <input
                id="bq-search-input"
                class="bq-search-input"
                type="text"
                placeholder="Buscar por tema, enunciado, disciplina..."
                oninput="BancoGlobal._onSearch(this.value)"
                autocomplete="off"
              />
              <button class="bq-search-clear" id="bq-search-clear" onclick="BancoGlobal._clearSearch()" title="Limpar busca">✕</button>
            </div>
            <div class="bq-filter-row">
              <select class="bq-select" onchange="BancoGlobal._onFilterChange('disciplina', this.value)" id="bq-filter-disciplina">
                <option value="">📚 Todas as Disciplinas</option>
                ${DISCIPLINAS.map(d => `<option value="${d}">${d}</option>`).join('')}
              </select>
              <select class="bq-select" onchange="BancoGlobal._onFilterChange('tipo', this.value)" id="bq-filter-tipo">
                <option value="">📝 Todos os Tipos</option>
                <option value="marcar">☑️ Múltipla Escolha</option>
                <option value="escrever">✍️ Dissertativa</option>
              </select>
              <select class="bq-select" onchange="BancoGlobal._onFilterChange('nivel', this.value)" id="bq-filter-nivel">
                <option value="">⚡ Todos os Níveis</option>
                ${NIVEIS.map(n => `<option value="${n}">${n}</option>`).join('')}
              </select>
              <button class="bq-btn-limpar" onclick="BancoGlobal._limparFiltros()">🗑️ Limpar</button>
            </div>
          </div>

        
          <div id="bq-selection-bar" class="bq-selection-bar bq-hidden">
            <span id="bq-selection-count">0 questões selecionadas</span>
            <div style="display:flex;gap:8px;">
              <button class="bq-btn-ghost" onclick="BancoGlobal._deselectAll()">Desmarcar tudo</button>
              <button class="bq-btn-primary" onclick="BancoGlobal._usarSelecionadas()">
                 Criar Exercício com Selecionadas
              </button>
            </div>
          </div>

          <!-- Lista de Questões -->
          <div class="bq-modal-body" id="bq-list-container">
            <div class="bq-loading">⏳ Carregando banco de questões...</div>
          </div>

          <div class="bq-pagination" id="bq-pagination"></div>
        </div>

       
        <div id="bq-panel-publicar" class="bq-panel bq-hidden">
          <div class="bq-modal-body">
            ${_renderFormPublicar()}
          </div>
        </div>
      </div>
    `;

    
    overlay.addEventListener('click', e => {
      if (e.target === overlay) close();
    });

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('bq-overlay-show'));

  
    await _loadQuestoes();
    _renderList();
  }

  async function _loadQuestoes() {
    _state.loading = true;
    _updateListUI('<div class="bq-loading">⏳ Buscando questões...</div>');

   
    const backendData = await _fetchBackend();
    console.log('[BancoGlobal DEBUG] backendData:', backendData ? backendData.length : 'null', backendData ? JSON.stringify(backendData.slice(0,2)) : '');
    if (backendData && backendData.length > 0) {
    
      const backendIds = new Set(backendData.map(q => q.id));
      const local = _load().filter(q => !backendIds.has(q.id));
      _state.questoes = [...backendData, ...local];
    } else {
      _state.questoes = _load();
    }
    console.log('[BancoGlobal DEBUG] total questoes em _state:', _state.questoes.length, '| primeiro:', JSON.stringify(_state.questoes[0]));

    _state.loading = false;
    _applyFilters();
    console.log('[BancoGlobal DEBUG] após _applyFilters, filtered.length:', _state.filtered.length);
  }

  

  function _renderList() {
    const { filtered, page, perPage, selected } = _state;
    const start = page * perPage;
    const slice = filtered.slice(start, start + perPage);

    if (!filtered.length) {
      _updateListUI(`
        <div class="bq-empty">
          <div style="font-size:48px;margin-bottom:12px;">🔍</div>
          <div style="font-size:16px;font-weight:600;color:var(--text-1,#ddd);margin-bottom:6px;">Nenhuma questão encontrada</div>
          <div style="font-size:13px;color:var(--text-3,#666);">Tente outros termos ou publique a primeira!</div>
        </div>
      `);
      _renderPagination();
      return;
    }

    const html = `
      <div class="bq-stats-row">
        <span>${filtered.length} questão${filtered.length !== 1 ? 'ões' : ''} encontrada${filtered.length !== 1 ? 's' : ''}</span>
        ${selected.size > 0 ? `<span style="color:var(--accent,#e8a04a);">${selected.size} selecionada${selected.size !== 1 ? 's' : ''}</span>` : ''}
      </div>
      <div class="bq-grid">
        ${slice.map(q => _renderCard(q)).join('')}
      </div>
    `;
    _updateListUI(html);
    _renderPagination();
    _updateSelectionBar();
  }

  function _renderCard(q) {
    const isSelected = _state.selected.has(q.id);
    const letras = ['A', 'B', 'C', 'D', 'E'];
    const nivelColor = { Fácil: '#60d080', Médio: '#e8a04a', Difícil: '#e07060' }[q.nivel] || '#aaa';
    const temas = (q.temas || []).slice(0, 3);
    
    const subQs = q.questoes || q.questions;
    const isPacote = q.tipo === 'pacote' || (!q.enunciado && q.title && Array.isArray(subQs));
    const tipoNorm = isPacote ? 'pacote' : (q.tipo || 'escrever');
    const textoExibicao = isPacote ? `📦 ${q.title || 'Exercício'}` : (q.enunciado || q.content || q.question || '(sem enunciado)');

    return `
      <div class="bq-card ${isSelected ? 'bq-card-selected' : ''}" id="bq-card-${_esc(q.id)}">
        <!-- Header do card -->
        <div class="bq-card-header">
          <div class="bq-card-badges">
            <span class="bq-badge bq-badge-disc">${_esc(q.disciplina || 'Geral')}</span>
            <span class="bq-badge" style="background:rgba(0,0,0,.2);color:${nivelColor};">${_esc(q.nivel || 'Médio')}</span>
            <span class="bq-badge bq-badge-tipo-${tipoNorm}">${tipoNorm === 'marcar' ? '☑️ Questão' : tipoNorm === 'pacote' ? '📦 Exercício' : '✍️ Dissertativa'}</span>
          </div>
          <label class="bq-checkbox-wrap" title="${isSelected ? 'Desmarcar' : 'Selecionar'} questão">
            <input
              type="checkbox"
              class="bq-checkbox"
              ${isSelected ? 'checked' : ''}
              onchange="BancoGlobal._toggleSelect('${_esc(q.id)}')"
            />
            <span class="bq-checkmark"></span>
          </label>
        </div>

      
        <div class="bq-card-enunciado">${_esc(textoExibicao)}</div>

        <!-- Preview das alternativas (marcar) -->
        ${tipoNorm === 'marcar' && q.alternativas?.length ? `
          <div class="bq-card-alts">
            ${q.alternativas.slice(0, 4).map((alt, i) => `
              <div class="bq-card-alt ${i === q.correta ? 'bq-card-alt-correta' : ''}">
                <span class="bq-alt-letra">${letras[i]}</span>
                <span class="bq-alt-text">${_esc(alt)}</span>
                ${i === q.correta ? '<span class="bq-alt-check">✓</span>' : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${tipoNorm === 'escrever' ? `
          <div class="bq-card-escrever-hint">✍️ Questão dissertativa — resposta em texto livre</div>
        ` : ''}

       
        ${temas.length ? `
          <div class="bq-card-temas">
            ${temas.map(t => `<span class="bq-tema-tag">${_esc(t)}</span>`).join('')}
          </div>
        ` : ''}

        
        <div class="bq-card-footer">
          <div class="bq-card-meta">
            <span title="Publicado por">👤 ${_esc(q.autor || 'Anônimo')}</span>
            <span title="Vezes utilizada">🔁 ${q.usos || 0} uso${(q.usos || 0) !== 1 ? 's' : ''}</span>
            <span title="Data">${_fmtDate(q.createdAt)}</span>
          </div>
          <div class="bq-card-actions">
            <button class="bq-btn-icon" onclick="BancoGlobal._preview('${_esc(q.id)}')" title="Ver questão completa">👁️</button>
            <button class="bq-btn-usar" onclick="BancoGlobal._usarUma('${_esc(q.id)}')" title="Usar esta questão">➕ Usar</button>
          </div>
        </div>
      </div>
    `;
  }

  function _renderPagination() {
    const { filtered, page, perPage } = _state;
    const totalPages = Math.ceil(filtered.length / perPage);
    const el = document.getElementById('bq-pagination');
    if (!el) return;

    if (totalPages <= 1) { el.innerHTML = ''; return; }

    const pages = [];
    for (let i = 0; i < totalPages; i++) {
      pages.push(`
        <button class="bq-page-btn ${i === page ? 'bq-page-active' : ''}" onclick="BancoGlobal._goPage(${i})">
          ${i + 1}
        </button>
      `);
    }
    el.innerHTML = `
      <button class="bq-page-btn" onclick="BancoGlobal._goPage(${page - 1})" ${page === 0 ? 'disabled' : ''}>‹</button>
      ${pages.join('')}
      <button class="bq-page-btn" onclick="BancoGlobal._goPage(${page + 1})" ${page >= totalPages - 1 ? 'disabled' : ''}>›</button>
    `;
  }

  function _updateListUI(html) {
    const el = document.getElementById('bq-list-container');
    if (el) el.innerHTML = html;
  }

  function _updateSelectionBar() {
    const bar = document.getElementById('bq-selection-bar');
    const count = document.getElementById('bq-selection-count');
    if (!bar) return;
    const n = _state.selected.size;
    if (n > 0) {
      bar.classList.remove('bq-hidden');
      if (count) count.textContent = `${n} questão${n !== 1 ? 'ões' : ''} selecionada${n !== 1 ? 's' : ''}`;
    } else {
      bar.classList.add('bq-hidden');
    }
  }

 
  let _searchTimer = null;
  function _onSearch(val) {
    clearTimeout(_searchTimer);
    _state.search = val;
    const clear = document.getElementById('bq-search-clear');
    if (clear) clear.style.opacity = val ? '1' : '0';
    _searchTimer = setTimeout(() => { _applyFilters(); _renderList(); }, 200);
  }

  function _clearSearch() {
    _state.search = '';
    const inp = document.getElementById('bq-search-input');
    if (inp) inp.value = '';
    const clear = document.getElementById('bq-search-clear');
    if (clear) clear.style.opacity = '0';
    _applyFilters();
    _renderList();
  }

  function _onFilterChange(field, val) {
    if (field === 'disciplina') _state.filtDisciplina = val;
    else if (field === 'tipo') _state.filtTipo = val;
    else if (field === 'nivel') _state.filtNivel = val;
    _applyFilters();
    _renderList();
  }

  function _limparFiltros() {
    _state.search = '';
    _state.filtDisciplina = '';
    _state.filtTipo = '';
    _state.filtNivel = '';
    const inp = document.getElementById('bq-search-input');
    if (inp) inp.value = '';
    ['bq-filter-disciplina', 'bq-filter-tipo', 'bq-filter-nivel'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    _applyFilters();
    _renderList();
  }

 

  function _toggleSelect(id) {
    if (_state.selected.has(id)) {
      _state.selected.delete(id);
    } else {
      _state.selected.add(id);
    }
    // Atualizar visual do card
    const card = document.getElementById('bq-card-' + id);
    if (card) card.classList.toggle('bq-card-selected', _state.selected.has(id));
    _updateSelectionBar();
  }

  function _deselectAll() {
    _state.selected.clear();
    document.querySelectorAll('.bq-card-selected').forEach(el => el.classList.remove('bq-card-selected'));
    document.querySelectorAll('.bq-checkbox').forEach(el => el.checked = false);
    _updateSelectionBar();
  }



  function _goPage(p) {
    const max = Math.ceil(_state.filtered.length / _state.perPage) - 1;
    _state.page = Math.max(0, Math.min(p, max));
    _renderList();
    
    document.getElementById('bq-list-container')?.scrollTo(0, 0);
  }



  function _preview(id) {
    const q = _state.questoes.find(x => x.id === id);
    if (!q) return;
    _state.preview = q;
    const letras = ['A', 'B', 'C', 'D', 'E'];

    const prevId = 'bq-preview-' + id;
    document.getElementById(prevId)?.remove();

    const html = `
      <div id="${prevId}" class="ex-modal-overlay bq-preview-overlay" onclick="if(event.target===this)this.remove()">
        <div class="ex-modal-box bq-modal bq-preview-box">
          <div class="ex-modal-header">
            <div>
              <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
                <span class="bq-badge bq-badge-disc">${_esc(q.disciplina || 'Geral')}</span>
                <span class="bq-badge bq-badge-tipo-${q.tipo}">${q.tipo === 'marcar' ? '☑️ Múltipla Escolha' : '✍️ Dissertativa'}</span>
                <span class="bq-badge" style="color:${({ Fácil:'#60d080', Médio:'#e8a04a', Difícil:'#e07060' }[q.nivel] || '#aaa')};">${_esc(q.nivel || '')}</span>
              </div>
              <h3 style="margin:0;font-size:18px;">Pré-visualização da Questão</h3>
            </div>
            <button class="ex-modal-close" onclick="document.getElementById('${prevId}').remove()">✕</button>
          </div>
          <div class="ex-modal-body">
            <div style="font-size:16px;font-weight:500;color:var(--text-0,#fff);line-height:1.6;margin-bottom:20px;">
              ${_esc(q.enunciado)}
            </div>

            ${q.tipo === 'marcar' && q.alternativas?.length ? `
              <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px;">
                ${q.alternativas.map((alt, i) => `
                  <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;
                    border:1.5px solid ${i === q.correta ? 'rgba(100,200,120,.5)' : 'var(--border,rgba(255,220,170,.08))'};
                    background:${i === q.correta ? 'rgba(100,200,120,.08)' : 'var(--bg-3,#2a2820)'};">
                    <span style="width:26px;height:26px;border-radius:50%;border:1.5px solid ${i === q.correta ? '#60d080' : 'var(--border,rgba(255,220,170,.2))'};
                      display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;
                      color:${i === q.correta ? '#60d080' : 'var(--text-2,#aaa)'};">
                      ${letras[i]}
                    </span>
                    <span style="flex:1;font-size:14px;color:${i === q.correta ? '#70e090' : 'var(--text-1,#ddd)'};">${_esc(alt)}</span>
                    ${i === q.correta ? '<span style="color:#60d080;font-weight:700;">✓ Correta</span>' : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${q.tipo === 'escrever' ? `
              <div style="background:var(--bg-3,#2a2820);border-radius:10px;padding:16px;margin-bottom:20px;
                border:1px dashed rgba(255,220,170,.15);font-size:13px;color:var(--text-2,#aaa);">
                ✍️ Campo de resposta dissertativa — o aluno escreverá livremente aqui.
              </div>
            ` : ''}

            ${q.dica ? `
              <div style="background:rgba(232,160,74,.06);border:1px solid rgba(232,160,74,.2);border-radius:10px;padding:12px 14px;
                margin-bottom:20px;font-size:13px;color:var(--accent,#e8a04a);">
                💡 Dica: ${_esc(q.dica)}
              </div>
            ` : ''}

            ${(q.temas || []).length ? `
              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px;">
                ${q.temas.map(t => `<span class="bq-tema-tag">${_esc(t)}</span>`).join('')}
              </div>
            ` : ''}

            <div style="font-size:12px;color:var(--text-3,#666);">
              👤 ${_esc(q.autor || 'Anônimo')} &nbsp;·&nbsp; 🔁 ${q.usos || 0} usos &nbsp;·&nbsp; ${_fmtDate(q.createdAt)}
            </div>
          </div>
          <div class="ex-modal-footer">
            <button class="bq-btn-ghost" onclick="document.getElementById('${prevId}').remove()">Fechar</button>
            <button class="bq-btn-primary" onclick="BancoGlobal._usarUma('${_esc(q.id)}');document.getElementById('${prevId}').remove()">
               Usar Esta Questão
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
  }

 
  function _usarUma(id) {
    _state.selected.clear();
    _state.selected.add(id);
    _usarSelecionadas();
  }

  function _usarSelecionadas() {
    if (!_state.selected.size) { _toast('Selecione pelo menos uma questão.', 'error'); return; }

    const questoesSel = [..._state.selected]
      .map(id => _state.questoes.find(q => q.id === id))
      .filter(Boolean);

    
    questoesSel.forEach(q => {
      q.usos = (q.usos || 0) + 1;
      _postBackend({ action: 'usar', id: q.id }).catch(() => {});
    });
    _save(_state.questoes);

  
    let questoesExSys = [];
    questoesSel.forEach(q => {
      const subQuestoes = q.questoes || q.questions;
      const isPacote = q.tipo === 'pacote' || (!q.enunciado && q.title && Array.isArray(subQuestoes));
      if (isPacote && Array.isArray(subQuestoes)) {
       
        questoesExSys.push(...subQuestoes.map(sq => ({
          tipo: sq.tipo || 'escrever',
          enunciado: sq.enunciado || sq.content || sq.question || '(sem enunciado)',
          alternativas: sq.alternativas || sq.options || [],
          correta: sq.correta ?? sq.correct ?? 0,
          dica: sq.dica || sq.hint || '',
          valor: sq.valor || sq.points || 1,
        })));
      } else {
        questoesExSys.push({
          tipo: q.tipo || 'escrever',
          enunciado: q.enunciado || q.content || q.question || '(sem enunciado)',
          alternativas: q.alternativas || q.options || [],
          correta: q.correta ?? q.correct ?? 0,
          dica: q.dica || q.hint || '',
          valor: q.valor || q.points || 1,
        });
      }
    });

    close();

   
    setTimeout(() => _abrirCriarComQuestoes(questoesExSys), 300);
  }

  function _abrirCriarComQuestoes(questoes) {
    const turmaId = _state.turmaId;
    if (!turmaId) { _toast('Turma não identificada.', 'error'); return; }

    
    const initialData = {
      title: 'Exercício do Banco Global',
      description: `${questoes.length} questão${questoes.length !== 1 ? 'ões' : ''} importada${questoes.length !== 1 ? 's' : ''} do banco`,
      questoes,
    };

   
    if (typeof window.ExSys?.openCreateExercicio === 'function') {
      window.ExSys.openCreateExercicio(turmaId, initialData);
      _toast(`✅ ${questoes.length} questão${questoes.length !== 1 ? 'ões' : ''} importada${questoes.length !== 1 ? 's' : ''}! Finalize o exercício.`, 'success');
    } else {
      _toast('Abra a aba de exercícios para criar o exercício.', 'info');
    }
  }

  

  function _switchTab(tab) {
    _state.tab = tab;
    ['browse', 'publicar'].forEach(t => {
      document.getElementById(`bq-panel-${t}`)?.classList.toggle('bq-hidden', t !== tab);
      document.getElementById(`bq-tab-${t}`)?.classList.toggle('bq-tab-active', t === tab);
    });
  }

  function _renderFormPublicar() {
    return `
      <div style="max-width:600px;margin:0 auto;">
        <h3 style="font-family:var(--font-display,serif);font-size:20px;color:var(--text-0,#fff);margin:0 0 4px;">
           Publicar Nova Questão
        </h3>
        <p style="font-size:13px;color:var(--text-3,#666);margin:0 0 24px;">
          Questões publicadas ficam disponíveis para todos os professores do StudySync.
        </p>

        <div class="ex-field">
          <label for="bq-pub-enunciado">Enunciado da questão *</label>
          <textarea id="bq-pub-enunciado" class="ex-textarea" rows="3"
            placeholder="Digite o enunciado completo da questão..."></textarea>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;">
          <div class="ex-field" style="margin-bottom:0;">
            <label for="bq-pub-tipo">Tipo *</label>
            <select id="bq-pub-tipo" class="ex-input bq-select" onchange="BancoGlobal._onTipoChange(this.value)">
              <option value="marcar">☑️ Múltipla Escolha</option>
              <option value="escrever">✍️ Dissertativa</option>
            </select>
          </div>
          <div class="ex-field" style="margin-bottom:0;">
            <label for="bq-pub-nivel">Nível *</label>
            <select id="bq-pub-nivel" class="ex-input bq-select">
              ${NIVEIS.map(n => `<option value="${n}">${n}</option>`).join('')}
            </select>
          </div>
          <div class="ex-field" style="margin-bottom:0;">
            <label for="bq-pub-disciplina">Disciplina *</label>
            <select id="bq-pub-disciplina" class="ex-input bq-select">
              <option value="">Selecionar...</option>
              ${DISCIPLINAS.map(d => `<option value="${d}">${d}</option>`).join('')}
            </select>
          </div>
        </div>

    
        <div id="bq-pub-alts-section">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
            <label style="font-size:11.5px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--text-2,#aaa);">
              Alternativas *
            </label>
            <span style="font-size:11px;color:var(--text-3,#666);">Marque a correta</span>
          </div>
          <div id="bq-pub-alts-list">
            ${[0,1,2,3].map(i => _renderAltRow(i)).join('')}
          </div>
          <button class="ex-add-alt-btn" onclick="BancoGlobal._addAltPub()" style="width:100%;margin-top:8px;">
            + Adicionar alternativa
          </button>
        </div>

        <div class="ex-field" style="margin-top:16px;">
          <label for="bq-pub-dica">Dica (opcional)</label>
          <input id="bq-pub-dica" class="ex-input" type="text" placeholder="Ex: Lembre-se da fórmula..."/>
        </div>

        <div class="ex-field">
          <label for="bq-pub-temas">Temas / Tags (separados por vírgula)</label>
          <input id="bq-pub-temas" class="ex-input" type="text" placeholder="Ex: potenciação, álgebra, ensino médio"/>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px;">
          <button class="bq-btn-ghost" onclick="BancoGlobal._switchTab('browse')">Cancelar</button>
          <button class="bq-btn-primary" onclick="BancoGlobal._publicar()">
            🌐 Publicar no Banco Global
          </button>
        </div>
      </div>
    `;
  }

  function _renderAltRow(i) {
    const letras = ['A', 'B', 'C', 'D', 'E', 'F'];
    return `
      <div class="ex-alt-row bq-pub-alt-row" id="bq-pub-alt-row-${i}">
        <input type="radio" name="bq-pub-correta" class="ex-radio" value="${i}" id="bq-pub-radio-${i}"
          ${i === 0 ? 'checked' : ''} style="accent-color:var(--accent,#e8a04a);" />
        <span class="ex-alt-letra">${letras[i]}</span>
        <input type="text" class="ex-input ex-alt-input bq-pub-alt-text"
          id="bq-pub-alt-${i}" placeholder="Alternativa ${letras[i]}..." />
        ${i >= 2 ? `<button class="ex-q-remove" onclick="BancoGlobal._removeAltPub(${i})" title="Remover">✕</button>` : ''}
      </div>
    `;
  }

  function _onTipoChange(tipo) {
    const section = document.getElementById('bq-pub-alts-section');
    if (section) section.style.display = tipo === 'marcar' ? '' : 'none';
  }

  let _altCount = 4;
  function _addAltPub() {
    if (_altCount >= 6) { _toast('Máximo de 6 alternativas.', 'info'); return; }
    const list = document.getElementById('bq-pub-alts-list');
    if (list) list.insertAdjacentHTML('beforeend', _renderAltRow(_altCount));
    _altCount++;
  }

  function _removeAltPub(i) {
    document.getElementById('bq-pub-alt-row-' + i)?.remove();
  }

  async function _publicar() {
    const enunciado = (document.getElementById('bq-pub-enunciado')?.value || '').trim();
    const tipo      = document.getElementById('bq-pub-tipo')?.value || 'marcar';
    const nivel     = document.getElementById('bq-pub-nivel')?.value || 'Médio';
    const disciplina = document.getElementById('bq-pub-disciplina')?.value || '';
    const dica      = (document.getElementById('bq-pub-dica')?.value || '').trim();
    const temasStr  = (document.getElementById('bq-pub-temas')?.value || '').trim();
    const temas     = temasStr ? temasStr.split(',').map(t => t.trim()).filter(Boolean) : [];

    if (!enunciado) { _toast('Digite o enunciado da questão.', 'error'); return; }
    if (!disciplina) { _toast('Selecione uma disciplina.', 'error'); return; }

    let alternativas = [];
    let correta = 0;

    if (tipo === 'marcar') {
      const altEls = document.querySelectorAll('.bq-pub-alt-text');
      alternativas = [...altEls].map(el => el.value.trim());
      if (alternativas.filter(Boolean).length < 2) {
        _toast('Adicione pelo menos 2 alternativas.', 'error'); return;
      }
      const radioSel = document.querySelector('input[name="bq-pub-correta"]:checked');
      correta = radioSel ? parseInt(radioSel.value) : 0;
    }

    const _appState = window.App?.getState?.() || window.App?.state;
    const autorNome = _appState?.user?.name || _appState?.user?.email || 'Professor';

    const nova = {
      id: _genId(),
      enunciado,
      tipo,
      alternativas,
      correta,
      dica,
      nivel,
      disciplina,
      temas,
      autor: autorNome,
      usos: 0,
      createdAt: Date.now(),
    };

    
    _state.questoes.unshift(nova);
    _save(_state.questoes);

   
    const ok = await _postBackend(nova);

    _toast(ok ? '🌐 Questão publicada no banco global!' : '✅ Questão salva localmente (backend offline).', 'success');

    
    _applyFilters();
    _switchTab('browse');
    _renderList();
    _altCount = 4;
  }

  

  function close() {
    const el = document.getElementById(MODAL_ID);
    if (!el) return;
    el.classList.remove('bq-overlay-show');
    setTimeout(() => el.remove(), 250);
  }

  
  function _esc(s) {
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function _fmtDate(ts) {
    try {
      if (!ts) return '';
      const d = new Date(ts);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('pt-BR');
    } catch { return ''; }
  }

  function _toast(msg, type = 'info') {
   
    if (typeof _exToast === 'function') { _exToast(msg, type); return; }
   
    const t = document.createElement('div');
    const colors = { success: '#60d080', error: '#e07060', info: '#e8a04a' };
    t.style.cssText = `position:fixed;bottom:80px;right:24px;z-index:999999;padding:10px 18px;border-radius:10px;
      background:var(--bg-2,#1e1c18);border:1px solid ${colors[type]||'#e8a04a'};color:${colors[type]||'#e8a04a'};
      font-size:13px;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,.4);
      animation:bqFadeIn .25s ease;`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3000);
  }

 

  function _injectStyles() {
    if (document.getElementById('bq-global-styles')) return;
    const style = document.createElement('style');
    style.id = 'bq-global-styles';
    style.textContent = `
      @keyframes bqFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      @keyframes bqSlideIn { from { opacity:0; transform:translateY(16px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }

      .bq-overlay { align-items: center; justify-content: center; }
      .bq-overlay-show .bq-modal { animation: bqSlideIn .3s cubic-bezier(.16,1,.3,1); }

      .bq-modal {
        max-width: 860px;
        width: 100%;
        max-height: 92vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

     
      .bq-tabs {
        display: flex;
        gap: 0;
        border-bottom: 1px solid var(--border, rgba(255,220,170,.08));
        padding: 0 24px;
        flex-shrink: 0;
      }
      .bq-tab {
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        color: var(--text-2, #aaa);
        font-size: 13px;
        font-weight: 600;
        padding: 12px 16px;
        cursor: pointer;
        transition: color .18s, border-color .18s;
        margin-bottom: -1px;
      }
      .bq-tab:hover { color: var(--text-0, #fff); }
      .bq-tab-active { color: var(--accent, #e8a04a) !important; border-bottom-color: var(--accent, #e8a04a) !important; }

     
      .bq-panel { display: flex; flex-direction: column; flex: 1; overflow: hidden; min-height: 0; }
      .bq-hidden { display: none !important; }

     
      .bq-filters {
        padding: 16px 24px 12px;
        border-bottom: 1px solid var(--border, rgba(255,220,170,.06));
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .bq-search-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }
      .bq-search-icon {
        position: absolute;
        left: 12px;
        font-size: 14px;
        pointer-events: none;
      }
      .bq-search-input {
        width: 100%;
        background: var(--bg-3, #2a2820);
        border: 1px solid var(--border, rgba(255,220,170,.08));
        border-radius: 10px;
        padding: 10px 36px 10px 36px;
        font-size: 14px;
        color: var(--text-0, #fff);
        outline: none;
        font-family: inherit;
        transition: border-color .2s;
      }
      .bq-search-input:focus { border-color: rgba(232,160,74,.35); }
      .bq-search-input::placeholder { color: var(--text-3, #666); }
      .bq-search-clear {
        position: absolute;
        right: 10px;
        background: none;
        border: none;
        color: var(--text-3, #666);
        cursor: pointer;
        font-size: 13px;
        padding: 4px;
        opacity: 0;
        transition: opacity .18s;
      }

      .bq-filter-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .bq-select {
        background: var(--bg-3, #2a2820);
        border: 1px solid var(--border, rgba(255,220,170,.08));
        border-radius: 8px;
        padding: 7px 10px;
        font-size: 12px;
        color: var(--text-1, #ddd);
        cursor: pointer;
        outline: none;
        font-family: inherit;
        flex: 1;
        min-width: 140px;
      }
      .bq-btn-limpar {
        background: none;
        border: 1px solid var(--border, rgba(255,220,170,.08));
        border-radius: 8px;
        color: var(--text-3, #666);
        font-size: 12px;
        padding: 7px 12px;
        cursor: pointer;
        white-space: nowrap;
        transition: color .18s, border-color .18s;
      }
      .bq-btn-limpar:hover { color: var(--text-1,#ddd); border-color: rgba(255,220,170,.2); }

     
      .bq-selection-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 24px;
        background: rgba(232,160,74,.08);
        border-bottom: 1px solid rgba(232,160,74,.18);
        flex-shrink: 0;
        gap: 12px;
        flex-wrap: wrap;
        font-size: 13px;
        font-weight: 600;
        color: var(--accent, #e8a04a);
      }

      
      .bq-modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 20px 24px;
        min-height: 0;
      }

      .bq-stats-row {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: var(--text-3, #666);
        margin-bottom: 14px;
      }

     
      .bq-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      @media (max-width: 640px) { .bq-grid { grid-template-columns: 1fr; } }

      
      .bq-card {
        background: var(--bg-3, #2a2820);
        border: 1.5px solid var(--border, rgba(255,220,170,.08));
        border-radius: 14px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        transition: border-color .18s, background .18s;
      }
      .bq-card:hover { border-color: rgba(232,160,74,.25); }
      .bq-card-selected {
        border-color: var(--accent, #e8a04a) !important;
        background: rgba(232,160,74,.05) !important;
      }

      .bq-card-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 8px;
      }
      .bq-card-badges { display: flex; gap: 5px; flex-wrap: wrap; }

      
      .bq-checkbox-wrap {
        display: flex;
        align-items: center;
        cursor: pointer;
        flex-shrink: 0;
      }
      .bq-checkbox { display: none; }
      .bq-checkmark {
        width: 20px;
        height: 20px;
        border-radius: 6px;
        border: 2px solid var(--border, rgba(255,220,170,.2));
        background: var(--bg-2, #1e1c18);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all .18s;
        position: relative;
      }
      .bq-checkbox:checked + .bq-checkmark {
        background: var(--accent, #e8a04a);
        border-color: var(--accent, #e8a04a);
      }
      .bq-checkbox:checked + .bq-checkmark::after {
        content: '✓';
        color: #0f0d0a;
        font-size: 12px;
        font-weight: 700;
        line-height: 1;
      }

      .bq-card-enunciado {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-0, #fff);
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

     
      .bq-card-alts {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .bq-card-alt {
        display: flex;
        align-items: center;
        gap: 7px;
        font-size: 12px;
        color: var(--text-2, #aaa);
        padding: 4px 8px;
        border-radius: 6px;
        border: 1px solid transparent;
      }
      .bq-card-alt-correta {
        color: #60d080;
        background: rgba(100,200,120,.06);
        border-color: rgba(100,200,120,.2);
      }
      .bq-alt-letra {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 1px solid currentColor;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 9px;
        font-weight: 700;
        flex-shrink: 0;
        opacity: .7;
      }
      .bq-alt-text { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .bq-alt-check { font-size: 11px; font-weight: 700; color: #60d080; flex-shrink: 0; }
      .bq-card-escrever-hint {
        font-size: 12px;
        color: var(--text-3, #666);
        font-style: italic;
        padding: 6px 10px;
        background: var(--bg-2, #1e1c18);
        border-radius: 8px;
        border: 1px dashed rgba(255,220,170,.1);
      }

     
      .bq-card-temas { display: flex; flex-wrap: wrap; gap: 5px; }
      .bq-tema-tag {
        font-size: 10px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 100px;
        background: rgba(232,160,74,.1);
        color: var(--accent, #e8a04a);
        border: 1px solid rgba(232,160,74,.15);
      }

      
      .bq-card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: auto;
        gap: 8px;
      }
      .bq-card-meta {
        display: flex;
        gap: 8px;
        font-size: 11px;
        color: var(--text-3, #666);
        flex-wrap: wrap;
      }
      .bq-card-actions { display: flex; gap: 6px; align-items: center; flex-shrink: 0; }

      
      .bq-badge {
        font-size: 10px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 100px;
        white-space: nowrap;
      }
      .bq-badge-disc {
        background: rgba(100,140,220,.12);
        color: #80a0e8;
      }
      .bq-badge-tipo-marcar {
        background: rgba(232,160,74,.12);
        color: var(--accent, #e8a04a);
      }
      .bq-badge-tipo-escrever {
        background: rgba(80,140,220,.12);
        color: #6090d0;
      }

      
      .bq-btn-primary {
        background: var(--accent, #e8a04a);
        color: #0f0d0a;
        border: none;
        border-radius: 8px;
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: opacity .18s, transform .12s;
        font-family: inherit;
        white-space: nowrap;
      }
      .bq-btn-primary:hover { opacity: .88; }
      .bq-btn-primary:active { transform: scale(.97); }

      .bq-btn-ghost {
        background: none;
        border: 1px solid var(--border, rgba(255,220,170,.12));
        border-radius: 8px;
        padding: 8px 14px;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-2, #aaa);
        cursor: pointer;
        transition: color .18s, border-color .18s;
        font-family: inherit;
      }
      .bq-btn-ghost:hover { color: var(--text-0,#fff); border-color: rgba(255,220,170,.25); }

      .bq-btn-usar {
        background: rgba(232,160,74,.12);
        border: 1px solid rgba(232,160,74,.22);
        border-radius: 7px;
        color: var(--accent, #e8a04a);
        font-size: 11px;
        font-weight: 700;
        padding: 5px 10px;
        cursor: pointer;
        transition: background .18s;
        font-family: inherit;
        white-space: nowrap;
      }
      .bq-btn-usar:hover { background: rgba(232,160,74,.22); }

      .bq-btn-icon {
        background: none;
        border: 1px solid var(--border, rgba(255,220,170,.1));
        border-radius: 7px;
        color: var(--text-2, #aaa);
        font-size: 14px;
        padding: 5px 8px;
        cursor: pointer;
        transition: color .18s, border-color .18s;
        line-height: 1;
      }
      .bq-btn-icon:hover { color: var(--text-0,#fff); border-color: rgba(255,220,170,.25); }

     
      .bq-pagination {
        display: flex;
        justify-content: center;
        gap: 6px;
        padding: 14px 24px;
        border-top: 1px solid var(--border, rgba(255,220,170,.06));
        flex-shrink: 0;
      }
      .bq-page-btn {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 1px solid var(--border, rgba(255,220,170,.1));
        background: var(--bg-3, #2a2820);
        color: var(--text-2, #aaa);
        font-size: 13px;
        cursor: pointer;
        transition: all .18s;
        font-family: inherit;
      }
      .bq-page-btn:hover:not(:disabled) { color: var(--text-0,#fff); border-color: rgba(255,220,170,.3); }
      .bq-page-btn:disabled { opacity: .35; cursor: default; }
      .bq-page-active {
        background: var(--accent, #e8a04a) !important;
        color: #0f0d0a !important;
        border-color: var(--accent, #e8a04a) !important;
        font-weight: 700;
      }

      
      .bq-loading {
        text-align: center;
        padding: 48px 24px;
        color: var(--text-2, #aaa);
        font-size: 14px;
      }
      .bq-empty {
        text-align: center;
        padding: 48px 24px;
        color: var(--text-2, #aaa);
      }

     
      .bq-preview-overlay { z-index: 100001 !important; }
      .bq-preview-box { max-width: 600px; }

      
      .bq-header-icon {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        background: rgba(232,160,74,.12);
        border: 1px solid rgba(232,160,74,.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        flex-shrink: 0;
      }

      
      .bq-pub-alt-row { margin-bottom: 0 !important; }

      /* Scroll customizado */
      .bq-modal-body::-webkit-scrollbar { width: 5px; }
      .bq-modal-body::-webkit-scrollbar-track { background: transparent; }
      .bq-modal-body::-webkit-scrollbar-thumb { background: var(--border, rgba(255,220,170,.1)); border-radius: 3px; }
    `;
    document.head.appendChild(style);
  }

  

  return {
    open,
    close,
   
    _onSearch,
    _clearSearch,
    _onFilterChange,
    _limparFiltros,
    _toggleSelect,
    _deselectAll,
    _usarUma,
    _usarSelecionadas,
    _preview,
    _switchTab,
    _onTipoChange,
    _addAltPub,
    _removeAltPub,
    _publicar,
    _goPage,
  
    _getQuestoes: () => _state.questoes,
    _getTotalPublicadas: () => _state.questoes.length,
  };

})();


(function patchExSys() {
  function patch() {
    if (window.ExSys) {
      window.ExSys.openGlobalBank = (turmaId) => BancoGlobal.open(turmaId);
      console.log('✅ BancoGlobal: patch do ExSys aplicado.');
    } else {
      
      setTimeout(patch, 100);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patch);
  } else {
    patch();
  }
})();