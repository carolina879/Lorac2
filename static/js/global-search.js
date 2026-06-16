
const GlobalSearch = (() => {
  let _open = false;
  let _query = '';
  let _debounceTimer = null;

 
  function init() {
    _injectSearchButton();
    _injectSearchPanel();
    _setupKeyboardShortcut();
  }

  function _injectSearchButton() {
   
    document.querySelectorAll('.app-header .header-nav').forEach(_addBtnToNav);

    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            node.querySelectorAll?.('.app-header .header-nav').forEach(_addBtnToNav);
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function _addBtnToNav(nav) {
    if (nav.querySelector('.gs-trigger-btn')) return; // já tem
    const btn = document.createElement('button');
    btn.className = 'nav-btn gs-trigger-btn';
    btn.title = 'Busca Global (Ctrl+K)';
    btn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>Buscar
    `;
    btn.onclick = toggle;
    nav.prepend(btn);
  }

  function _injectSearchPanel() {
    const panel = document.createElement('div');
    panel.id = 'gs-panel';
    panel.innerHTML = `
      <div id="gs-backdrop" onclick="GlobalSearch.close()"></div>
      <div id="gs-box">
        <div id="gs-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:var(--text-2);flex-shrink:0">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input id="gs-input"
            placeholder="Buscar em salas, tarefas, fórum, flashcards…"
            oninput="GlobalSearch.onInput(this.value)"
            onkeydown="GlobalSearch.onKey(event)"
            autocomplete="off" spellcheck="false"
          />
          <kbd id="gs-esc-hint" onclick="GlobalSearch.close()">ESC</kbd>
        </div>
        <div id="gs-results">
          <div class="gs-empty-state">
            <div class="gs-empty-icon">🔍</div>
            <p>Digite para buscar em todo o StudySync</p>
            <div class="gs-hint-pills">
              <span class="gs-pill">📚 Salas</span>
              <span class="gs-pill">✅ Tarefas</span>
              <span class="gs-pill">💬 Fórum</span>
              <span class="gs-pill">🧠 Flashcards</span>
            </div>
          </div>
        </div>
        <div id="gs-footer">
          <span>↑↓ navegar</span>
          <span>↵ ir</span>
          <span>ESC fechar</span>
        </div>
      </div>
    `;
    document.body.appendChild(panel);
    _injectStyles();
  }

  function _injectStyles() {
    const style = document.createElement('style');
    style.id = 'gs-styles';
    style.textContent = `
      #gs-panel {
        display: none;
        position: fixed;
        inset: 0;
        z-index: 99999;
        align-items: flex-start;
        justify-content: center;
        padding-top: 80px;
      }
      #gs-panel.open { display: flex; }

      #gs-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.65);
        backdrop-filter: blur(4px);
        animation: gs-fade-in 0.15s ease;
      }

      #gs-box {
        position: relative;
        width: 100%;
        max-width: 640px;
        background: var(--bg-2, #1e1b18);
        border: 1px solid var(--border, rgba(255,255,255,.1));
        border-radius: 18px;
        box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(232,160,74,0.08);
        overflow: hidden;
        animation: gs-slide-in 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        margin: 0 16px;
      }

      #gs-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 20px;
        border-bottom: 1px solid var(--border, rgba(255,255,255,.08));
        background: var(--bg-1, #161412);
      }

      #gs-input {
        flex: 1;
        background: none;
        border: none;
        outline: none;
        font-size: 16px;
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        color: var(--text-0, #f0ece4);
        caret-color: var(--accent, #e8a04a);
      }
      #gs-input::placeholder { color: var(--text-3, #6b6460); }

      #gs-esc-hint {
        padding: 3px 8px;
        background: var(--bg-3, #2a2520);
        border: 1px solid var(--border, rgba(255,255,255,.1));
        border-radius: 6px;
        font-size: 11px;
        color: var(--text-3, #6b6460);
        cursor: pointer;
        font-family: var(--font-mono, 'DM Mono', monospace);
        white-space: nowrap;
      }

      #gs-results {
        max-height: 440px;
        overflow-y: auto;
        padding: 8px;
        scrollbar-width: thin;
        scrollbar-color: var(--border) transparent;
      }

      .gs-empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--text-3, #6b6460);
      }
      .gs-empty-icon { font-size: 36px; margin-bottom: 12px; }
      .gs-empty-state p { font-size: 14px; margin-bottom: 16px; }

      .gs-hint-pills {
        display: flex;
        gap: 8px;
        justify-content: center;
        flex-wrap: wrap;
      }
      .gs-pill {
        padding: 4px 12px;
        background: var(--bg-3, #2a2520);
        border: 1px solid var(--border, rgba(255,255,255,.08));
        border-radius: 20px;
        font-size: 12px;
        color: var(--text-2, #9b9188);
      }

      .gs-section-header {
        padding: 8px 10px 4px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--text-3, #6b6460);
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .gs-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 10px;
        cursor: pointer;
        transition: background 0.1s;
        margin-bottom: 2px;
      }
      .gs-item:hover, .gs-item.gs-focused {
        background: var(--bg-3, #2a2520);
      }
      .gs-item-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
        background: var(--bg-3, #2a2520);
      }
      .gs-item-icon.room  { background: rgba(100,160,232,.15); }
      .gs-item-icon.task  { background: rgba(122,158,126,.15); }
      .gs-item-icon.forum { background: rgba(232,160,74,.15); }
      .gs-item-icon.fc    { background: rgba(200,160,232,.15); }

      .gs-item-body { flex: 1; min-width: 0; }
      .gs-item-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-0, #f0ece4);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .gs-item-title mark {
        background: rgba(232,160,74,.3);
        color: var(--accent, #e8a04a);
        border-radius: 3px;
        padding: 0 2px;
      }
      .gs-item-sub {
        font-size: 12px;
        color: var(--text-3, #6b6460);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 2px;
      }
      .gs-item-badge {
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
        flex-shrink: 0;
      }
      .gs-badge-room  { background: rgba(100,160,232,.2); color: #64a0e8; }
      .gs-badge-task  { background: rgba(122,158,126,.2); color: #7a9e7e; }
      .gs-badge-forum { background: rgba(232,160,74,.2); color: var(--accent, #e8a04a); }
      .gs-badge-fc    { background: rgba(200,160,232,.2); color: #c8a0e8; }

      .gs-no-results {
        text-align: center;
        padding: 32px 20px;
        color: var(--text-3, #6b6460);
        font-size: 14px;
      }
      .gs-no-results strong { color: var(--text-1, #c8c0b8); }

      .gs-divider {
        height: 1px;
        background: var(--border, rgba(255,255,255,.06));
        margin: 6px 10px;
      }

      #gs-footer {
        display: flex;
        gap: 16px;
        padding: 8px 20px;
        background: var(--bg-1, #161412);
        border-top: 1px solid var(--border, rgba(255,255,255,.06));
        font-size: 11px;
        color: var(--text-3, #6b6460);
        font-family: var(--font-mono, 'DM Mono', monospace);
      }
      #gs-footer span::before { margin-right: 4px; }

      @keyframes gs-fade-in { from { opacity: 0 } to { opacity: 1 } }
      @keyframes gs-slide-in {
        from { opacity: 0; transform: translateY(-12px) scale(0.98); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }

      .gs-trigger-btn { position: relative; }
    `;
    document.head.appendChild(style);
  }

  function _setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
    });
  }

  function toggle() {
    _open ? close() : open();
  }

  function open() {
    _open = true;
    const panel = document.getElementById('gs-panel');
    if (panel) panel.classList.add('open');
    setTimeout(() => {
      const input = document.getElementById('gs-input');
      if (input) { input.focus(); input.select(); }
    }, 50);
  }

  function close() {
    _open = false;
    const panel = document.getElementById('gs-panel');
    if (panel) panel.classList.remove('open');
  }

  
  function onInput(val) {
    _query = val.trim();
    clearTimeout(_debounceTimer);
    if (!_query) {
      _renderEmpty();
      return;
    }
    _debounceTimer = setTimeout(() => _doSearch(_query), 120);
  }

  let _focusedIndex = -1;
  let _items = [];

  function onKey(e) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); _moveFocus(1); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); _moveFocus(-1); }
    if (e.key === 'Enter') { e.preventDefault(); _activateFocused(); }
  }

  function _moveFocus(dir) {
    _focusedIndex = Math.max(-1, Math.min(_items.length - 1, _focusedIndex + dir));
    _renderFocusState();
  }

  function _renderFocusState() {
    document.querySelectorAll('#gs-results .gs-item').forEach((el, i) => {
      el.classList.toggle('gs-focused', i === _focusedIndex);
    });
  }

  function _activateFocused() {
    if (_focusedIndex >= 0 && _items[_focusedIndex]) {
      _items[_focusedIndex].action();
    }
  }

 
  function _doSearch(q) {
    _focusedIndex = -1;
    _items = [];

    const rooms    = _searchRooms(q);
    const tarefas  = _searchTarefas(q);
    const forum    = _searchForum(q);
    const fc       = _searchFlashcards(q);

    if (!rooms.length && !tarefas.length && !forum.length && !fc.length) {
      _renderNoResults(q);
      return;
    }

    let html = '';

    if (rooms.length) {
      html += _sectionHeader('📚', 'Salas');
      rooms.forEach(r => {
        _items.push(r);
        html += _itemHtml(r, 'room', '📚', 'gs-badge-room', 'Sala');
      });
    }

    if (tarefas.length) {
      if (html) html += '<div class="gs-divider"></div>';
      html += _sectionHeader('✅', 'Tarefas');
      tarefas.forEach(t => {
        _items.push(t);
        html += _itemHtml(t, 'task', t.done ? '✅' : '⬜', 'gs-badge-task', t.done ? 'Concluída' : 'Pendente');
      });
    }

    if (forum.length) {
      if (html) html += '<div class="gs-divider"></div>';
      html += _sectionHeader('💬', 'Fórum');
      forum.forEach(f => {
        _items.push(f);
        html += _itemHtml(f, 'forum', '💬', 'gs-badge-forum', 'Pergunta');
      });
    }

    if (fc.length) {
      if (html) html += '<div class="gs-divider"></div>';
      html += _sectionHeader('🧠', 'Flashcards');
      fc.forEach(c => {
        _items.push(c);
        html += _itemHtml(c, 'fc', '🧠', 'gs-badge-fc', 'Flashcard');
      });
    }

    const results = document.getElementById('gs-results');
    if (results) {
      results.innerHTML = html;
   
      results.querySelectorAll('.gs-item').forEach((el, i) => {
        el.addEventListener('click', () => _items[i]?.action());
        el.addEventListener('mouseenter', () => { _focusedIndex = i; _renderFocusState(); });
      });
    }
  }

  function _highlight(text, q) {
    if (!q) return _esc(text);
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
    return _esc(text).replace(re, '<mark>$1</mark>');
  }

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function _sectionHeader(icon, label) {
    return `<div class="gs-section-header">${icon} ${label}</div>`;
  }

  function _itemHtml(item, type, icon, badgeClass, badgeLabel) {
    return `
      <div class="gs-item" data-type="${type}">
        <div class="gs-item-icon ${type}">${icon}</div>
        <div class="gs-item-body">
          <div class="gs-item-title">${item.titleHtml}</div>
          ${item.sub ? `<div class="gs-item-sub">${item.subHtml || _esc(item.sub)}</div>` : ''}
        </div>
        <span class="gs-item-badge ${badgeClass}">${badgeLabel}</span>
      </div>
    `;
  }

  function _searchRooms(q) {
    const appState = window.App?.getState?.() || window.App?.state;
    if (!appState?.allRooms) return [];
    const ql = q.toLowerCase();
    return appState.allRooms
      .filter(r => r.name.toLowerCase().includes(ql))
      .slice(0, 5)
      .map(r => ({
        title: r.name,
        titleHtml: _highlight(r.name, q),
        sub: `${r.online_count || 0} online`,
        subHtml: `${r.online_count || 0} online`,
        action: () => { close(); window.App?.joinRoom(r.id, r.name, !!r.has_password); }
      }));
  }

  function _searchTarefas(q) {
    const STORAGE_KEY = 'studysync_tarefas_v1';
    let tarefas = [];
    try { tarefas = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch {}
    const ql = q.toLowerCase();
    return tarefas
      .filter(t => t.title?.toLowerCase().includes(ql) || t.desc?.toLowerCase().includes(ql))
      .slice(0, 5)
      .map(t => ({
        title: t.title,
        titleHtml: _highlight(t.title, q),
        sub: t.desc || (t.done ? 'Concluída' : 'Pendente'),
        subHtml: t.desc ? _highlight(t.desc, q) : null,
        done: t.done,
        action: () => { close(); window.App?.showTarefas?.(); }
      }));
  }

  function _searchForum(q) {
    const STORAGE_KEY = 'studysync_forum_v1';
    let qs = [];
    try { qs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch {}
    const ql = q.toLowerCase();
    return qs
      .filter(f => f.title?.toLowerCase().includes(ql) || f.body?.toLowerCase().includes(ql) || (f.tags||[]).join(' ').toLowerCase().includes(ql))
      .slice(0, 5)
      .map(f => ({
        title: f.title,
        titleHtml: _highlight(f.title, q),
        sub: `Por ${f.author} · ${(f.answers||[]).length} resposta(s)`,
        done: false,
        action: () => { close(); window.App?.showForum?.(); setTimeout(() => window.App?.forumShowDetail?.(f.id), 200); }
      }));
  }

  function _searchFlashcards(q) {
    const appState = window.App?.getState?.() || window.App?.state;
    let fcs = appState?.flashcards || [];
    if (!fcs.length) {
      const userId = appState?.user?.id;
      if (userId) {
        try { fcs = JSON.parse(localStorage.getItem('studysync_fc_' + userId) || '[]'); } catch {}
      }
    }
    const ql = q.toLowerCase();
    return fcs
      .filter(c => c.q?.toLowerCase().includes(ql) || c.a?.toLowerCase().includes(ql))
      .slice(0, 5)
      .map(c => ({
        title: c.q,
        titleHtml: _highlight(c.q, q),
        sub: `R: ${c.a}`,
        subHtml: `R: ${_highlight(c.a, q)}`,
        done: false,
        action: () => { close(); window.App?.toggleFlashcards?.(); }
      }));
  }

  function _renderEmpty() {
    const results = document.getElementById('gs-results');
    if (!results) return;
    results.innerHTML = `
      <div class="gs-empty-state">
        <div class="gs-empty-icon">🔍</div>
        <p>Digite para buscar em todo o StudySync</p>
        <div class="gs-hint-pills">
          <span class="gs-pill">📚 Salas</span>
          <span class="gs-pill">✅ Tarefas</span>
          <span class="gs-pill">💬 Fórum</span>
          <span class="gs-pill">🧠 Flashcards</span>
        </div>
      </div>
    `;
  }

  function _renderNoResults(q) {
    const results = document.getElementById('gs-results');
    if (!results) return;
    results.innerHTML = `
      <div class="gs-no-results">
        <div style="font-size:32px;margin-bottom:12px;">🤷</div>
        Nenhum resultado para <strong>"${_esc(q)}"</strong>
        <div style="margin-top:8px;font-size:12px;color:var(--text-3);">Tente palavras-chave diferentes</div>
      </div>
    `;
  }

  return { init, toggle, open, close, onInput, onKey };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => GlobalSearch.init());
} else {
  GlobalSearch.init();
}
