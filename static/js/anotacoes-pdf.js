
const AnotacoesPDF = (() => {

  
  let pdfKey    = '';  
  let paginaAtual = 1;
  let painelAberto = false;

 
  function carregarNotas() {
    if (!pdfKey) return [];
    try { return JSON.parse(localStorage.getItem(pdfKey) || '[]'); }
    catch { return []; }
  }

  function salvarNotas(notas) {
    if (!pdfKey) return;
    localStorage.setItem(pdfKey, JSON.stringify(notas));
  }

 
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function fmtData(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'short' }) +
           ' ' + d.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
  }

  function corLabel(cor) {
    return { amarelo:'#e8c84a', verde:'#7abc8a', azul:'#7aaadd',
             vermelho:'#e07060', roxo:'#c8a0e8', laranja:'#e8a04a' }[cor] || '#e8a04a';
  }

 
  function injetarBotao() {
    const nav = document.getElementById('pdf-nav');
    if (!nav || document.getElementById('btn-anotacoes-pdf')) return;

    const btn = document.createElement('button');
    btn.id = 'btn-anotacoes-pdf';
    btn.className = 'pdf-nav-btn';
    btn.title = 'Anotações';
    btn.style.cssText = [
      'display:flex', 'align-items:center', 'gap:5px',
      'padding:5px 10px', 'font-size:12px', 'font-weight:600',
      'white-space:nowrap', 'background:transparent',
      'border:1px solid var(--border,#3a3228)',
      'border-radius:6px', 'color:var(--text-1,#c8b89a)',
      'cursor:pointer'
    ].join(';');
    btn.innerHTML = '📝 Notas <span id="anotacoes-badge" style="display:none;background:var(--accent,#e8a04a);color:var(--bg-0,#0f0d0a);border-radius:10px;padding:1px 6px;font-size:10px;font-weight:700;margin-left:2px;"></span>';
    btn.onclick = togglePainel;

   
    const btnDic = document.getElementById('btn-dicionario-pdf');
    if (btnDic && btnDic.nextSibling) {
      nav.insertBefore(btn, btnDic.nextSibling);
    } else {
      nav.insertBefore(btn, nav.firstChild);
    }
  }

  function togglePainel() {
    const painel = document.getElementById('anotacoes-painel');
    if (painel) {
      fecharPainel();
    } else {
      abrirPainel();
    }
  }

  function abrirPainel() {
    const pdfPanel = document.getElementById('pdf-reader-panel');
    if (!pdfPanel) {
      if (typeof App !== 'undefined') App.toast('Abra o leitor de PDF primeiro.', 'error');
      return;
    }
    if (!pdfKey) {
      if (typeof App !== 'undefined') App.toast('Carregue um PDF primeiro.', 'error');
      return;
    }

    painelAberto = true;
    atualizarBotao(true);

    const painel = document.createElement('div');
    painel.id = 'anotacoes-painel';
    painel.style.cssText = [
      'position:absolute', 'top:0', 'right:0', 'width:300px', 'height:100%',
      'background:var(--bg-2,#1a1612)',
      'border-left:1px solid var(--border,#3a3228)',
      'display:flex', 'flex-direction:column', 'z-index:100',
      'box-shadow:-4px 0 24px rgba(0,0,0,0.3)',
      'animation:anot-slide-in 0.2s ease'
    ].join(';');

    painel.innerHTML = buildPainelHTML();
    pdfPanel.style.position = 'relative';
    pdfPanel.appendChild(painel);

    renderListaNotas();
  }

  function fecharPainel() {
    const painel = document.getElementById('anotacoes-painel');
    if (painel) painel.remove();
    painelAberto = false;
    atualizarBotao(false);
  }

  function atualizarBotao(ativo) {
    const btn = document.getElementById('btn-anotacoes-pdf');
    if (!btn) return;
    btn.style.background = ativo ? 'var(--accent,#e8a04a)' : 'transparent';
    btn.style.color      = ativo ? 'var(--bg-0,#0f0d0a)' : 'var(--text-2,#8a7a6a)';
  }
  function buildPainelHTML() {
    return `
    <style>
      @keyframes anot-slide-in { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
      #anotacoes-painel *::-webkit-scrollbar { width:4px; }
      #anotacoes-painel *::-webkit-scrollbar-track { background:transparent; }
      #anotacoes-painel *::-webkit-scrollbar-thumb { background:var(--border,#3a3228); border-radius:4px; }

      .anot-nota-card {
        background:var(--bg-3,#211d18);
        border:1px solid var(--border,#3a3228);
        border-radius:10px;
        padding:11px 13px;
        margin-bottom:8px;
        transition:border-color 0.15s;
        position:relative;
        cursor:default;
      }
      .anot-nota-card:hover { border-color:rgba(232,160,74,0.35); }
      .anot-nota-card.anot-pagina-atual { border-color:var(--accent,#e8a04a); }

      .anot-cor-dot {
        width:8px; height:8px; border-radius:50%; flex-shrink:0; margin-top:3px;
      }
      .anot-cor-btn {
        width:20px; height:20px; border-radius:50%; border:2px solid transparent;
        cursor:pointer; transition:transform 0.15s;
      }
      .anot-cor-btn:hover { transform:scale(1.15); }
      .anot-cor-btn.selecionada { border-color:var(--text-0,#f0e8df) !important; transform:scale(1.15); }

      .anot-textarea {
        width:100%; background:var(--bg-4,#2a2420); border:1px solid var(--border,#3a3228);
        border-radius:8px; padding:9px 11px; font-size:13px;
        color:var(--text-0,#f0e8df); resize:vertical; min-height:72px;
        font-family:var(--font-body,sans-serif); line-height:1.5; outline:none;
        box-sizing:border-box; transition:border-color 0.15s;
      }
      .anot-textarea:focus { border-color:rgba(232,160,74,0.45); }

      .anot-btn-acao {
        background:none; border:none; cursor:pointer; padding:3px 5px;
        border-radius:5px; font-size:13px; transition:background 0.12s;
      }
      .anot-btn-acao:hover { background:rgba(255,255,255,0.07); }

      .anot-filtro-btn {
        padding:4px 10px; border-radius:20px; font-size:11px; font-weight:600;
        cursor:pointer; border:1px solid var(--border,#3a3228); transition:all 0.15s;
      }
      .anot-filtro-btn.ativo {
        background:var(--accent,#e8a04a) !important;
        color:var(--bg-0,#0f0d0a) !important;
        border-color:var(--accent,#e8a04a) !important;
      }
      .anot-filtro-btn:not(.ativo) { background:var(--bg-3,#211d18); color:var(--text-2,#8a7a6a); }

      .anot-vazio {
        text-align:center; color:var(--text-2,#8a7a6a); font-size:13px;
        padding:32px 16px;
      }
      .anot-vazio-icone { font-size:36px; margin-bottom:10px; }
    </style>


    <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;
                border-bottom:1px solid var(--border,#3a3228);background:var(--bg-3,#211d18);flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:18px;">📝</span>
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--text-0,#f0e8df);">Anotações</div>
          <div style="font-size:11px;color:var(--text-2,#8a7a6a);" id="anot-sub-header">Carregando…</div>
        </div>
      </div>
      <button onclick="AnotacoesPDF.fecharPainel()"
        style="background:none;border:none;color:var(--text-2,#8a7a6a);cursor:pointer;font-size:18px;line-height:1;padding:4px;">&times;</button>
    </div>


    <div style="display:flex;gap:6px;padding:10px 14px;border-bottom:1px solid var(--border,#3a3228);flex-shrink:0;flex-wrap:wrap;">
      <button class="anot-filtro-btn ativo" id="anot-f-todas"
        onclick="AnotacoesPDF.setFiltro('todas')">Todas</button>
      <button class="anot-filtro-btn" id="anot-f-pagina"
        onclick="AnotacoesPDF.setFiltro('pagina')">Esta página</button>
    </div>

    <div style="padding:12px 14px;border-bottom:1px solid var(--border,#3a3228);flex-shrink:0;" id="anot-form-wrap">
      <div style="font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
                  color:var(--text-2,#8a7a6a);margin-bottom:8px;" id="anot-form-titulo">
        + Nova nota — pág. <span id="anot-form-pag">1</span>
      </div>


      <div style="display:flex;gap:6px;margin-bottom:8px;align-items:center;">
        <span style="font-size:11px;color:var(--text-3,#5a4a3a);">Cor:</span>
        <button class="anot-cor-btn selecionada" data-cor="amarelo"
          style="background:#e8c84a;" onclick="AnotacoesPDF.selecionarCor('amarelo',this)"></button>
        <button class="anot-cor-btn" data-cor="verde"
          style="background:#7abc8a;" onclick="AnotacoesPDF.selecionarCor('verde',this)"></button>
        <button class="anot-cor-btn" data-cor="azul"
          style="background:#7aaadd;" onclick="AnotacoesPDF.selecionarCor('azul',this)"></button>
        <button class="anot-cor-btn" data-cor="vermelho"
          style="background:#e07060;" onclick="AnotacoesPDF.selecionarCor('vermelho',this)"></button>
        <button class="anot-cor-btn" data-cor="roxo"
          style="background:#c8a0e8;" onclick="AnotacoesPDF.selecionarCor('roxo',this)"></button>
        <button class="anot-cor-btn" data-cor="laranja"
          style="background:#e8a04a;" onclick="AnotacoesPDF.selecionarCor('laranja',this)"></button>
      </div>

      <textarea id="anot-nova-texto" class="anot-textarea"
        placeholder="Escreva sua anotação para esta página…"
        onkeydown="AnotacoesPDF.teclaTextarea(event)"></textarea>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:7px;">
        <span style="font-size:11px;color:var(--text-3,#5a4a3a);">Ctrl+Enter para salvar</span>
        <button onclick="AnotacoesPDF.salvarNova()"
          style="padding:6px 16px;background:var(--accent,#e8a04a);color:var(--bg-0,#0f0d0a);
                 border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">
          Salvar
        </button>
      </div>
    </div>

 
    <div id="anot-lista" style="flex:1;overflow-y:auto;padding:12px 14px;"></div>
    `;
  }

 
  let filtroAtual = 'todas';
  let corSelecionada = 'amarelo';
  let editandoId = null;

  function selecionarCor(cor, btn) {
    corSelecionada = cor;
    document.querySelectorAll('.anot-cor-btn').forEach(b => b.classList.remove('selecionada'));
    if (btn) btn.classList.add('selecionada');
  }

  function setFiltro(f) {
    filtroAtual = f;
    document.getElementById('anot-f-todas')?.classList.toggle('ativo', f === 'todas');
    document.getElementById('anot-f-pagina')?.classList.toggle('ativo', f === 'pagina');
    renderListaNotas();
  }

  function teclaTextarea(e) {
    if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); salvarNova(); }
  }

  function salvarNova() {
    const ta = document.getElementById('anot-nova-texto');
    if (!ta) return;
    const texto = ta.value.trim();
    if (!texto) { ta.focus(); return; }

    const notas = carregarNotas();
    const nova = {
      id:    Date.now() + Math.random().toString(36).slice(2),
      pagina: paginaAtual,
      texto,
      cor:   corSelecionada,
      data:  new Date().toISOString()
    };
    notas.push(nova);
    salvarNotas(notas);

    ta.value = '';
    renderListaNotas();
    atualizarBadge();
    if (typeof App !== 'undefined') App.toast('Anotação salva!', 'success');
  }

  function excluirNota(id) {
    if (!confirm('Excluir esta anotação?')) return;
    let notas = carregarNotas().filter(n => n.id !== id);
    salvarNotas(notas);
    renderListaNotas();
    atualizarBadge();
  }

  function iniciarEdicao(id) {
    editandoId = id;
    renderListaNotas();
   
    setTimeout(() => {
      const ta = document.getElementById('anot-edit-' + id);
      if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
    }, 50);
  }

  function salvarEdicao(id) {
    const ta = document.getElementById('anot-edit-' + id);
    if (!ta) return;
    const texto = ta.value.trim();
    if (!texto) return;

    
    const corBtn = document.querySelector(`#anot-edit-cor-${id} .selecionada`);
    const novaCor = corBtn ? corBtn.dataset.cor : null;

    let notas = carregarNotas();
    const idx = notas.findIndex(n => n.id === id);
    if (idx !== -1) {
      notas[idx].texto = texto;
      notas[idx].editada = new Date().toISOString();
      if (novaCor) notas[idx].cor = novaCor;
    }
    salvarNotas(notas);
    editandoId = null;
    renderListaNotas();
  }

  function cancelarEdicao() {
    editandoId = null;
    renderListaNotas();
  }

  function irParaPagina(pagina) {

    if (typeof App !== 'undefined') {
     
      const diff = pagina - paginaAtual;
      if (diff > 0) { for (let i = 0; i < diff; i++) App.pdfNextPage(); }
      else if (diff < 0) { for (let i = 0; i < Math.abs(diff); i++) App.pdfPrevPage(); }
    }
  }

  function renderListaNotas() {
    const lista = document.getElementById('anot-lista');
    const subHeader = document.getElementById('anot-sub-header');
    const formPag = document.getElementById('anot-form-pag');
    if (!lista) return;

    if (subHeader) subHeader.textContent = pdfKey.replace('pdf_notas::', '');
    if (formPag) formPag.textContent = paginaAtual;

    let notas = carregarNotas();

    if (filtroAtual === 'pagina') {
      notas = notas.filter(n => n.pagina === paginaAtual);
    }

    notas.sort((a, b) => a.pagina !== b.pagina ? a.pagina - b.pagina : new Date(a.data) - new Date(b.data));

    if (notas.length === 0) {
      lista.innerHTML = `
        <div class="anot-vazio">
          <div class="anot-vazio-icone">📭</div>
          <p>${filtroAtual === 'pagina'
            ? 'Nenhuma anotação nesta página.'
            : 'Nenhuma anotação ainda.'}</p>
          <p style="font-size:11px;margin-top:4px;opacity:0.65;">
            ${filtroAtual === 'pagina'
              ? 'Escreva algo acima!'
              : 'Navegue pelo PDF e anote o que for importante.'}
          </p>
        </div>`;
      return;
    }

    lista.innerHTML = notas.map(n => buildCardHTML(n)).join('');
  }

  function buildCardHTML(n) {
    const cor = corLabel(n.cor);
    const ehAtual = n.pagina === paginaAtual;
    const editando = editandoId === n.id;

    if (editando) {
     
      return `
      <div class="anot-nota-card ${ehAtual ? 'anot-pagina-atual' : ''}"
           style="border-left:3px solid ${cor};">
        <div style="font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
                    color:${cor};margin-bottom:8px;">Editando — pág. ${n.pagina}</div>

        
        <div style="display:flex;gap:5px;margin-bottom:8px;align-items:center;" id="anot-edit-cor-${esc(n.id)}">
          <span style="font-size:11px;color:var(--text-3,#5a4a3a);">Cor:</span>
          ${['amarelo','verde','azul','vermelho','roxo','laranja'].map(c => `
            <button class="anot-cor-btn${n.cor===c?' selecionada':''}" data-cor="${c}"
              style="background:${corLabel(c)};"
              onclick="AnotacoesPDF.selecionarCorEdicao('${esc(n.id)}','${c}',this)"></button>
          `).join('')}
        </div>

        <textarea id="anot-edit-${esc(n.id)}" class="anot-textarea"
          onkeydown="if(event.ctrlKey&&event.key==='Enter'){event.preventDefault();AnotacoesPDF.salvarEdicao('${esc(n.id)}')}"
          >${esc(n.texto)}</textarea>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:7px;">
          <button onclick="AnotacoesPDF.cancelarEdicao()"
            style="padding:5px 13px;background:var(--bg-4,#2a2420);border:1px solid var(--border,#3a3228);
                   border-radius:7px;font-size:12px;color:var(--text-1,#c8b89a);cursor:pointer;">
            Cancelar
          </button>
          <button onclick="AnotacoesPDF.salvarEdicao('${esc(n.id)}')"
            style="padding:5px 13px;background:var(--accent,#e8a04a);color:var(--bg-0,#0f0d0a);
                   border:none;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;">
            Salvar
          </button>
        </div>
      </div>`;
    }

    return `
    <div class="anot-nota-card ${ehAtual ? 'anot-pagina-atual' : ''}"
         style="border-left:3px solid ${cor};">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:6px;margin-bottom:6px;">
      
        <button onclick="AnotacoesPDF.irParaPagina(${n.pagina})"
          style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;
                 background:rgba(${hexToRgb(cor)},0.15);border:1px solid ${cor};
                 border-radius:20px;font-size:10px;font-weight:700;color:${cor};
                 cursor:pointer;flex-shrink:0;white-space:nowrap;"
          title="Ir para a página ${n.pagina}">
          📄 pág. ${n.pagina}
          ${!ehAtual ? '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>' : ''}
        </button>
       
        <div style="display:flex;gap:2px;flex-shrink:0;">
          <button class="anot-btn-acao" title="Editar"
            onclick="AnotacoesPDF.iniciarEdicao('${esc(n.id)}')">✏️</button>
          <button class="anot-btn-acao" title="Excluir"
            onclick="AnotacoesPDF.excluirNota('${esc(n.id)}')">🗑️</button>
        </div>
      </div>
 
      <div style="font-size:13px;color:var(--text-0,#f0e8df);line-height:1.6;
                  word-break:break-word;white-space:pre-wrap;">${esc(n.texto)}</div>
    
      <div style="font-size:10px;color:var(--text-3,#5a4a3a);margin-top:7px;">
        ${fmtData(n.editada || n.data)}${n.editada ? ' (editada)' : ''}
      </div>
    </div>`;
  }

  
  function selecionarCorEdicao(id, cor, btn) {
    const container = document.getElementById('anot-edit-cor-' + id);
    if (container) container.querySelectorAll('.anot-cor-btn').forEach(b => b.classList.remove('selecionada'));
    if (btn) btn.classList.add('selecionada');
  }


  function atualizarBadge() {
    const badge = document.getElementById('anotacoes-badge');
    if (!badge) return;
    const total = carregarNotas().length;
    if (total > 0) {
      badge.textContent = total;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }


  function atualizarIndicadorPagina() {
    
    document.getElementById('anot-indicador-pagina')?.remove();

    if (!pdfKey) return;
    const notas = carregarNotas().filter(n => n.pagina === paginaAtual);
    if (notas.length === 0) return;

    const canvasWrap = document.getElementById('pdf-canvas-wrap');
    if (!canvasWrap) return;

    const ind = document.createElement('div');
    ind.id = 'anot-indicador-pagina';
    ind.title = `${notas.length} anotação(ões) nesta página — clique para ver`;
    ind.style.cssText = [
      'position:absolute', 'top:12px', 'right:12px',
      'background:var(--accent,#e8a04a)', 'color:var(--bg-0,#0f0d0a)',
      'border-radius:20px', 'padding:4px 10px',
      'font-size:12px', 'font-weight:700',
      'cursor:pointer', 'z-index:10',
      'display:flex', 'align-items:center', 'gap:5px',
      'box-shadow:0 2px 10px rgba(0,0,0,0.4)',
      'animation:anot-pop-in 0.2s ease',
      'user-select:none'
    ].join(';');
    ind.innerHTML = `📝 ${notas.length} nota${notas.length > 1 ? 's' : ''}`;
    ind.onclick = () => {
      if (!document.getElementById('anotacoes-painel')) {
        abrirPainel();
      }
      setFiltro('pagina');
    };

    canvasWrap.style.position = 'relative';
    canvasWrap.appendChild(ind);
  }

  
  function hexToRgb(hex) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : '232,160,74';
  }


  function onPdfLoad(filename) {
    pdfKey = 'pdf_notas::' + (filename || 'sem-nome');
    paginaAtual = 1;

    
    document.getElementById('btn-anotacoes-pdf')?.remove();

   
    injetarBotao();
    atualizarBadge();
    atualizarIndicadorPagina();
  }

  function onPageChange(page) {
    paginaAtual = page;
   
    if (painelAberto && document.getElementById('anotacoes-painel')) {
      const formPag = document.getElementById('anot-form-pag');
      if (formPag) formPag.textContent = page;
     
      document.querySelectorAll('.anot-nota-card').forEach(card => {
        
      });
      renderListaNotas();
    }
    atualizarIndicadorPagina();
  }

  function onPdfClose() {
    fecharPainel();
    pdfKey = '';
    paginaAtual = 1;
    document.getElementById('btn-anotacoes-pdf')?.remove();
    document.getElementById('anot-indicador-pagina')?.remove();
  }

 
  const observer = new MutationObserver(() => {
    const nav = document.getElementById('pdf-nav');
    if (nav && nav.style.display !== 'none' && pdfKey && !document.getElementById('btn-anotacoes-pdf')) {
      injetarBotao();
      atualizarBadge();
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    const pdfBody = document.getElementById('pdf-body');
    if (pdfBody) observer.observe(pdfBody, { childList:true, subtree:true, attributes:true, attributeFilter:['style'] });
    const nav = document.getElementById('pdf-nav');
    if (nav) observer.observe(nav, { attributes:true, attributeFilter:['style'] });

   
    const style = document.createElement('style');
    style.textContent = `@keyframes anot-pop-in { from { transform:scale(0.8); opacity:0; } to { transform:scale(1); opacity:1; } }`;
    document.head.appendChild(style);
  });

  return {
    togglePainel,
    abrirPainel,
    fecharPainel,
    setFiltro,
    selecionarCor,
    selecionarCorEdicao,
    salvarNova,
    excluirNota,
    iniciarEdicao,
    salvarEdicao,
    cancelarEdicao,
    irParaPagina,
    teclaTextarea,
    onPdfLoad,
    onPageChange,
    onPdfClose
  };
})();

window.AnotacoesPDF = AnotacoesPDF;