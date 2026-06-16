

const CompartilharExercicio = (() => {


  const MODO = 'ambos';

  const API_BASE = '';
  const LS_SHARED_KEY = 'ss_exercicios_compartilhados'; // Set de IDs já compartilhados
  const MODAL_ID = 'modal-compartilhar-ex';


  let _sharedIds = _loadSharedIds();

  function _loadSharedIds() {
    try {
      return new Set(JSON.parse(localStorage.getItem(LS_SHARED_KEY) || '[]'));
    } catch { return new Set(); }
  }

  function _saveSharedIds() {
    try {
      localStorage.setItem(LS_SHARED_KEY, JSON.stringify([..._sharedIds]));
    } catch {}
  }

 
  function openConfirm(turmaId, exId) {
    
    const ex = window._ExercicioState?.exercicios?.[turmaId]?.[exId];
    if (!ex) { _toast('Exercício não encontrado.', 'error'); return; }

    const jaCompartilhado = _sharedIds.has(exId);
    const totalQ = ex.questoes?.length || 0;
    const marcar = ex.questoes?.filter(q => q.tipo === 'marcar').length || 0;
    const escrever = ex.questoes?.filter(q => q.tipo === 'escrever').length || 0;

    document.getElementById(MODAL_ID)?.remove();

    const _appState = window.App?.getState?.() || window.App?.state;
    const autorNome = _appState?.user?.name || _appState?.user?.email || 'Professor';

    const disciplinaSugerida = ex.disciplina || '';
    const nivelSugerido = ex.nivel || 'Médio';

    const html = `
      <div id="${MODAL_ID}" class="ex-modal-overlay cex-overlay" onclick="if(event.target===this)CompartilharExercicio.close()">
        <div class="ex-modal-box ex-modal-large cex-modal">

          <!-- Header -->
          <div class="ex-modal-header">
            <div style="display:flex;align-items:center;gap:12px;">
              <div class="cex-header-icon">🌐</div>
              <div>
                <h3 style="margin:0;">Compartilhar no Banco Global</h3>
                <div class="ex-modal-subtitle">
                  ${jaCompartilhado
                    ? '⚠️ Este exercício já foi compartilhado antes — você pode republicar.'
                    : 'O exercício ficará disponível para todos os professores do StudySync.'}
                </div>
              </div>
            </div>
            <button class="ex-modal-close" onclick="CompartilharExercicio.close()">✕</button>
          </div>

          <div class="ex-modal-body">

            <!-- Prévia do exercício -->
            <div class="cex-preview-box">
              <div class="cex-preview-header">
                <div class="cex-preview-title">${_esc(ex.title)}</div>
                <div class="cex-preview-stats">
                  <span>📝 ${totalQ} questão${totalQ !== 1 ? 'ões' : ''}</span>
                  ${marcar ? `<span>☑️ ${marcar} múltipla escolha</span>` : ''}
                  ${escrever ? `<span>✍️ ${escrever} dissertativa${escrever !== 1 ? 's' : ''}</span>` : ''}
                </div>
                ${ex.description ? `<div class="cex-preview-desc">${_esc(ex.description)}</div>` : ''}
              </div>

              <!-- Preview das questões -->
              <div class="cex-questoes-preview">
                ${(ex.questoes || []).slice(0, 5).map((q, i) => `
                  <div class="cex-q-row">
                    <span class="cex-q-num">${i + 1}</span>
                    <div class="cex-q-body">
                      <div class="cex-q-enunciado">${_esc(q.enunciado || '(sem enunciado)')}</div>
                      <span class="cex-q-tipo ${q.tipo}">${q.tipo === 'marcar' ? '☑️ Múltipla escolha' : '✍️ Dissertativa'}</span>
                    </div>
                  </div>
                `).join('')}
                ${totalQ > 5 ? `<div class="cex-q-mais">+ ${totalQ - 5} questão${totalQ - 5 !== 1 ? 'ões' : ''} a mais</div>` : ''}
              </div>
            </div>

            <!-- Metadados para o banco -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px;">
              <div class="ex-field" style="margin-bottom:0;">
                <label for="cex-disciplina">Disciplina *</label>
                <select id="cex-disciplina" class="ex-input cex-select">
                  <option value="">Selecionar...</option>
                  ${['Matemática','Português','História','Geografia','Ciências','Biologia','Física','Química',
                     'Inglês','Artes','Educação Física','Filosofia','Sociologia','Informática','Outro']
                    .map(d => `<option value="${d}" ${d === disciplinaSugerida ? 'selected' : ''}>${d}</option>`)
                    .join('')}
                </select>
              </div>
              <div class="ex-field" style="margin-bottom:0;">
                <label for="cex-nivel">Nível de Dificuldade</label>
                <select id="cex-nivel" class="ex-input cex-select">
                  ${['Fácil','Médio','Difícil'].map(n =>
                    `<option value="${n}" ${n === nivelSugerido ? 'selected' : ''}>${n}</option>`
                  ).join('')}
                </select>
              </div>
            </div>

            <div class="ex-field" style="margin-top:12px;">
              <label for="cex-temas">Temas / Tags (separados por vírgula)</label>
              <input id="cex-temas" class="ex-input" type="text"
                value="${_esc(ex.temas?.join(', ') || '')}"
                placeholder="Ex: equações, álgebra, ensino médio" />
            </div>

            <!-- Modo de publicação -->
            <div class="cex-modo-box">
              <div class="cex-modo-label">O que será publicado no banco:</div>
              <div class="cex-modo-opts">
                ${MODO === 'ambos' || MODO === 'pacote' ? `
                  <div class="cex-modo-item">
                    <span class="cex-modo-icon">📦</span>
                    <div>
                      <div class="cex-modo-title">Exercício completo</div>
                      <div class="cex-modo-desc">Outros profs podem importar o exercício inteiro de uma vez</div>
                    </div>
                  </div>
                ` : ''}
                ${MODO === 'ambos' || MODO === 'questoes' ? `
                  <div class="cex-modo-item">
                    <span class="cex-modo-icon">🔀</span>
                    <div>
                      <div class="cex-modo-title">Questões avulsas (${totalQ})</div>
                      <div class="cex-modo-desc">Cada questão entra separada no banco para uso individual</div>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Aviso de visibilidade -->
            <div class="cex-aviso">
              🔓 Após compartilhar, <strong>todos os professores</strong> poderão ver e usar este exercício.
              Suas questões não terão as respostas dos alunos — apenas o conteúdo pedagógico.
            </div>

          </div>

          <div class="ex-modal-footer">
            <button class="btn-secondary" onclick="CompartilharExercicio.close()">Cancelar</button>
            <button class="btn-primary cex-btn-confirmar" onclick="CompartilharExercicio.confirmar('${_esc(turmaId)}','${_esc(exId)}')">
              🌐 ${jaCompartilhado ? 'Republicar' : 'Compartilhar'} no Banco Global
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    requestAnimationFrame(() => document.getElementById(MODAL_ID)?.classList.add('cex-overlay-show'));
    _injectStyles();
  }

 
  async function confirmar(turmaId, exId) {
    const ex = window._ExercicioState?.exercicios?.[turmaId]?.[exId];
    if (!ex) { _toast('Exercício não encontrado.', 'error'); return; }

    const disciplina = document.getElementById('cex-disciplina')?.value || '';
    const nivel = document.getElementById('cex-nivel')?.value || 'Médio';
    const temasStr = document.getElementById('cex-temas')?.value || '';
    const temas = temasStr.split(',').map(t => t.trim()).filter(Boolean);

    if (!disciplina) { _toast('Selecione uma disciplina.', 'error'); return; }

    const btn = document.querySelector('.cex-btn-confirmar');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Publicando...'; }

    const _appState = window.App?.getState?.() || window.App?.state;
    const autorNome = _appState?.user?.name || _appState?.user?.email || 'Professor';

    let sucessos = 0;
    let erros = 0;

    
    if (MODO === 'pacote' || MODO === 'ambos') {
      const pacote = {
        id: 'bqpkg_' + exId,
        tipo: 'pacote',
        title: ex.title,
        description: ex.description || '',
        disciplina,
        nivel,
        temas,
        autor: autorNome,
        questoes: ex.questoes.map(q => ({
          enunciado: q.enunciado,
          tipo: q.tipo,
          alternativas: q.alternativas || [],
          correta: q.correta ?? 0,
          dica: q.dica || '',
          valor: q.valor || 1,
        })),
        usos: 0,
        createdAt: Date.now(),
        exOrigemId: exId,
        turmaOrigemId: turmaId,
      };

      const ok = await _postBanco(pacote);
      if (ok) {
        sucessos++;
       
        _addToBancoLocal(pacote);
      } else {
        erros++;
      }
    }

  
    if (MODO === 'questoes' || MODO === 'ambos') {
      for (const q of ex.questoes) {
        if (!q.enunciado?.trim()) continue;
        const questao = {
          id: 'bq_' + _genId(),
          enunciado: q.enunciado,
          tipo: q.tipo,
          alternativas: q.alternativas || [],
          correta: q.correta ?? 0,
          dica: q.dica || '',
          nivel,
          disciplina,
          temas,
          autor: autorNome,
          usos: 0,
          createdAt: Date.now(),
          exOrigemId: exId,
        };
        const ok = await _postBanco(questao);
        if (ok) { sucessos++; _addToBancoLocal(questao); }
        else erros++;
      }
    }

   
    _sharedIds.add(exId);
    _saveSharedIds();

    
    close();

    const totalPublicados = MODO === 'pacote' ? 1
      : MODO === 'questoes' ? ex.questoes.length
      : 1 + ex.questoes.length;

    if (erros === 0) {
      _toast(`✅ ${totalPublicados === 1 ? 'Exercício compartilhado' : totalPublicados + ' itens publicados'} no Banco Global!`, 'success');
    } else if (sucessos > 0) {
      _toast(`⚠️ ${sucessos} item${sucessos !== 1 ? 'ns' : ''} publicado${sucessos !== 1 ? 's' : ''} (${erros} falha${erros !== 1 ? 's' : ''} — backend offline, salvo localmente).`, 'info');
    } else {
      _toast('📦 Salvo localmente (backend offline). Será sincronizado quando disponível.', 'info');
    }

  
    _updateCardBadge(exId, true);
  }


  function _genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  async function _postBanco(item) {
    try {
      const res = await fetch(`${API_BASE}/api/banco-global`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
        signal: AbortSignal.timeout(4000),
      });
      return res.ok;
    } catch { return false; }
  }

  function _addToBancoLocal(item) {
    
    if (window.BancoGlobal?._getQuestoes) {
      const questoes = window.BancoGlobal._getQuestoes();
      const jaExiste = questoes.some(q => q.id === item.id);
      if (!jaExiste) questoes.unshift(item);
    }
   
    try {
      const raw = localStorage.getItem('ss_banco_global');
      const arr = raw ? JSON.parse(raw) : [];
      if (!arr.some(q => q.id === item.id)) arr.unshift(item);
      localStorage.setItem('ss_banco_global', JSON.stringify(arr));
    } catch {}
  }

  function _updateCardBadge(exId, shared) {
    
    const badgeEl = document.getElementById('cex-badge-' + exId);
    if (badgeEl) {
      badgeEl.style.display = shared ? 'inline-flex' : 'none';
    } else {
      
      const card = document.querySelector(`[data-exid="${exId}"] .cex-shared-badge`);
      if (card) card.style.display = shared ? 'inline-flex' : 'none';
    }
  }

  function _esc(s) {
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function _toast(msg, type = 'info') {
    if (typeof _exToast === 'function') { _exToast(msg, type); return; }
    const colors = { success:'#60d080', error:'#e07060', info:'#e8a04a', warning:'#e8c04a' };
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:80px;right:24px;z-index:999999;padding:10px 18px;border-radius:10px;
      background:var(--bg-2,#1e1c18);border:1px solid ${colors[type]||'#e8a04a'};color:${colors[type]||'#e8a04a'};
      font-size:13px;font-weight:600;box-shadow:0 4px 20px rgba(0,0,0,.4);max-width:340px;line-height:1.4;`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(() => t.remove(), 300); }, 4000);
  }

  function close() {
    const el = document.getElementById(MODAL_ID);
    if (!el) return;
    el.classList.remove('cex-overlay-show');
    setTimeout(() => el.remove(), 250);
  }

 
  
  function _patchRender() {
    if (!window.ExSys) return;

    const _origRender = window.ExSys.renderExerciciosTabContent;
    window.ExSys.renderExerciciosTabContent = async function(turmaId) {
      await _origRender.call(this, turmaId);
      
      _injectShareButtons(turmaId);
    };
    console.log('✅ CompartilharExercicio: patch de renderização aplicado.');
  }

  function _injectShareButtons(turmaId) {
    const panel = document.getElementById('turma-tab-exercicios');
    if (!panel) return;

    const _s = window.App?.getState?.() || window.App?.state || {};
    const user = _s.user;
    if (!user || user.role !== 'professor') return;

    
    const cards = panel.querySelectorAll('.ex-card');
    cards.forEach(card => {
      const actionsEl = card.querySelector('.ex-card-actions');
      if (!actionsEl) return;

      const onclickAttr = card.getAttribute('onclick') || '';
      const matchResultados = onclickAttr.match(/openResultados\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/);
      if (!matchResultados) return;

      const [, tId, exId] = matchResultados;
      const isShared = _sharedIds.has(exId);


      if (actionsEl.querySelector('.cex-btn-share')) return;

      const btn = document.createElement('button');
      btn.className = 'btn-secondary small cex-btn-share';
      btn.title = isShared ? 'Republicar no Banco Global' : 'Compartilhar no Banco Global';
      btn.style.cssText = isShared
        ? 'background:rgba(100,200,120,.1)!important;border-color:rgba(100,200,120,.25)!important;color:#60d080!important;'
        : '';
      btn.innerHTML = isShared ? '✓ No banco' : '🌐 Compartilhar';
      btn.onclick = (e) => {
        e.stopPropagation();
        CompartilharExercicio.openConfirm(tId, exId);
      };

     
      const deleteBtn = actionsEl.querySelector('.danger');
      if (deleteBtn) {
        actionsEl.insertBefore(btn, deleteBtn);
      } else {
        actionsEl.appendChild(btn);
      }
    });
  }

 
  function _observePanel() {
    const observer = new MutationObserver(() => {
      const panel = document.getElementById('turma-tab-exercicios');
      if (panel && panel.querySelector('.ex-card:not(:has(.cex-btn-share))')) {
        const _s = window.App?.getState?.() || window.App?.state || {};
        const turmaId = _s.currentTurma?.id;
        if (turmaId) _injectShareButtons(turmaId);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }


  function _injectStyles() {
    if (document.getElementById('cex-styles')) return;
    const s = document.createElement('style');
    s.id = 'cex-styles';
    s.textContent = `
      @keyframes cexSlideIn { from { opacity:0; transform:translateY(14px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }

      .cex-overlay { align-items:center; justify-content:center; }
      .cex-overlay-show .cex-modal { animation: cexSlideIn .28s cubic-bezier(.16,1,.3,1); }
      .cex-modal { max-width: 600px; }

      .cex-header-icon {
        width: 42px; height: 42px; border-radius: 12px;
        background: rgba(100,160,232,.12);
        border: 1px solid rgba(100,160,232,.22);
        display: flex; align-items: center; justify-content: center;
        font-size: 22px; flex-shrink: 0;
      }

     
      .cex-preview-box {
        background: var(--bg-3, #2a2820);
        border: 1px solid var(--border, rgba(255,220,170,.08));
        border-radius: 14px;
        overflow: hidden;
      }
      .cex-preview-header {
        padding: 16px 18px;
        border-bottom: 1px solid var(--border, rgba(255,220,170,.08));
      }
      .cex-preview-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--text-0, #fff);
        margin-bottom: 6px;
      }
      .cex-preview-stats {
        display: flex;
        gap: 12px;
        font-size: 12px;
        color: var(--text-2, #aaa);
        flex-wrap: wrap;
        margin-bottom: 6px;
      }
      .cex-preview-desc {
        font-size: 13px;
        color: var(--text-2, #aaa);
        margin-top: 4px;
        font-style: italic;
      }

      
      .cex-questoes-preview {
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      .cex-q-row {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 10px 18px;
        border-bottom: 1px solid var(--border, rgba(255,220,170,.05));
      }
      .cex-q-row:last-child { border-bottom: none; }
      .cex-q-num {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: rgba(232,160,74,.12);
        color: var(--accent, #e8a04a);
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 1px;
      }
      .cex-q-body { flex: 1; min-width: 0; }
      .cex-q-enunciado {
        font-size: 13px;
        color: var(--text-1, #ddd);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 3px;
      }
      .cex-q-tipo {
        font-size: 10px;
        font-weight: 600;
        padding: 2px 7px;
        border-radius: 100px;
      }
      .cex-q-tipo.marcar {
        background: rgba(232,160,74,.12);
        color: var(--accent, #e8a04a);
      }
      .cex-q-tipo.escrever {
        background: rgba(80,140,220,.12);
        color: #6090d0;
      }
      .cex-q-mais {
        padding: 8px 18px;
        font-size: 12px;
        color: var(--text-3, #666);
        font-style: italic;
      }

    
      .cex-select {
        background: var(--bg-3, #2a2820) !important;
      }

     
      .cex-modo-box {
        margin-top: 18px;
        padding: 14px 16px;
        background: rgba(100,160,232,.06);
        border: 1px solid rgba(100,160,232,.15);
        border-radius: 12px;
      }
      .cex-modo-label {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: .08em;
        color: var(--text-3, #666);
        margin-bottom: 10px;
      }
      .cex-modo-opts { display: flex; flex-direction: column; gap: 8px; }
      .cex-modo-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }
      .cex-modo-icon {
        font-size: 18px;
        flex-shrink: 0;
        margin-top: 1px;
      }
      .cex-modo-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-1, #ddd);
        margin-bottom: 2px;
      }
      .cex-modo-desc {
        font-size: 12px;
        color: var(--text-3, #666);
        line-height: 1.4;
      }

    
      .cex-aviso {
        margin-top: 16px;
        padding: 10px 14px;
        background: rgba(232,160,74,.06);
        border: 1px solid rgba(232,160,74,.15);
        border-radius: 10px;
        font-size: 12px;
        color: var(--text-2, #aaa);
        line-height: 1.5;
      }
      .cex-aviso strong { color: var(--text-1, #ddd); }

     
      .cex-btn-share {
        transition: all .2s !important;
        white-space: nowrap;
      }
      .cex-btn-share:hover {
        background: rgba(100,160,232,.12) !important;
        border-color: rgba(100,160,232,.3) !important;
        color: #80a8e8 !important;
      }

     
      .cex-shared-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 10px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 100px;
        background: rgba(100,200,120,.1);
        color: #60d080;
        border: 1px solid rgba(100,200,120,.2);
        margin-left: 4px;
      }
    `;
    (document.head || document.documentElement).appendChild(s);
  }

 
  function _init() {
    _injectStyles();
    _patchRender();
    _observePanel();
    console.log('✅ CompartilharExercicio: inicializado. Modo:', MODO);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
  
    if (window.ExSys) {
      _init();
    } else {
      const checkExSys = setInterval(() => {
        if (window.ExSys) { clearInterval(checkExSys); _init(); }
      }, 100);
    }
  }

  
  return {
    openConfirm,
    confirmar,
    close,
    isShared: (exId) => _sharedIds.has(exId),
    getSharedIds: () => new Set(_sharedIds),
  };

})();
