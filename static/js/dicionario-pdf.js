
const DicionarioPDF = (() => {
  const API = ''; 
  let painelAberto = false;

  function esc(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function md(text) {
    return esc(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  async function callAI(message) {
    var res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message, context: 'Você é um dicionário inteligente multilíngue. Responda sempre de forma organizada e concisa.' })
    });
    if (!res.ok) {
      var err = await res.json().catch(function() { return {}; });
      throw new Error(err.detail || 'Erro ' + res.status);
    }
    var data = await res.json();
    return data.response || '';
  }

  function toggle() {
    var painel = document.getElementById('dic-painel');
    if (painel) {
      fechar();
    } else {
      abrir();
    }
  }

  function abrir() {
   
    var pdfPanel = document.getElementById('pdf-reader-panel');
    if (!pdfPanel || !pdfPanel.classList.contains('open')) {
      if (typeof App !== 'undefined') App.toast('Abra o leitor de PDF primeiro.', 'error');
      return;
    }

    painelAberto = true;

    var painel = document.createElement('div');
    painel.id = 'dic-painel';
    painel.style.cssText = [
      'position:absolute',
      'top:0',
      'right:0',
      'width:320px',
      'height:100%',
      'background:var(--bg-2,#1a1612)',
      'border-left:1px solid var(--border,#3a3228)',
      'display:flex',
      'flex-direction:column',
      'z-index:100',
      'box-shadow:-4px 0 24px rgba(0,0,0,0.3)',
      'animation:slideInRight 0.2s ease'
    ].join(';');

    painel.innerHTML = buildPainel();
    pdfPanel.style.position = 'relative';
    pdfPanel.appendChild(painel);

    setTimeout(function() {
      var input = document.getElementById('dic-input');
      if (input) input.focus();
    }, 100);
  }

  function fechar() {
    var painel = document.getElementById('dic-painel');
    if (painel) painel.remove();
    painelAberto = false;

    var btn = document.getElementById('btn-dicionario-pdf');
    if (btn) {
      btn.style.background = 'transparent';
      btn.style.color = 'var(--text-2,#8a7a6a)';
    }
  }

  function buildPainel() {
    var h = '';

    h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--border,#3a3228);background:var(--bg-3,#211d18);flex-shrink:0;">';
    h += '<div style="display:flex;align-items:center;gap:8px;">';
    h += '<span style="font-size:18px;">&#128218;</span>';
    h += '<div><div style="font-size:14px;font-weight:600;color:var(--text-0,#f0e8df);">Dicion&aacute;rio</div>';
    h += '<div style="font-size:11px;color:var(--text-2,#8a7a6a);">Qualquer idioma</div></div>';
    h += '</div>';
    h += '<button onclick="DicionarioPDF.fechar()" style="background:none;border:none;color:var(--text-2,#8a7a6a);cursor:pointer;font-size:18px;line-height:1;padding:4px;">&times;</button>';
    h += '</div>';

    h += '<div style="padding:14px 16px;border-bottom:1px solid var(--border,#3a3228);flex-shrink:0;">';
    h += '<div style="display:flex;gap:8px;">';
    h += '<input id="dic-input" type="text" placeholder="Digite uma palavra ou frase..." onkeydown="if(event.key===\'Enter\')DicionarioPDF.buscar()" style="flex:1;background:var(--bg-3,#211d18);border:1px solid var(--border,#3a3228);border-radius:8px;padding:9px 12px;font-size:14px;color:var(--text-0,#f0e8df);outline:none;" />';
    h += '<button onclick="DicionarioPDF.buscar()" style="padding:9px 14px;background:var(--accent,#e8a04a);color:var(--bg-0,#0f0d0a);border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">Buscar</button>';
    h += '</div>';

    h += '<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;">';
    var filtros = [
      ['tudo', 'Tudo', true],
      ['definicao', 'Defini&ccedil;&atilde;o', false],
      ['sinonimos', 'Sin&ocirc;nimos', false],
      ['antonimos', 'Ant&ocirc;nimos', false],
      ['traducao', 'Tradu&ccedil;&atilde;o', false],
      ['origem', 'Origem', false]
    ];
    filtros.forEach(function(f) {
      var bg = f[2] ? 'var(--accent,#e8a04a)' : 'var(--bg-3,#211d18)';
      var color = f[2] ? 'var(--bg-0,#0f0d0a)' : 'var(--text-2,#8a7a6a)';
      h += '<button id="dic-filtro-' + f[0] + '" onclick="DicionarioPDF.setFiltro(\'' + f[0] + '\')" style="padding:4px 10px;background:' + bg + ';color:' + color + ';border:1px solid var(--border,#3a3228);border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;">' + f[1] + '</button>';
    });
    h += '</div>';
    h += '</div>';

   
    h += '<div id="dic-resultado" style="flex:1;overflow-y:auto;padding:16px;">';
    h += '<div style="text-align:center;color:var(--text-2,#8a7a6a);font-size:13px;margin-top:40px;">';
    h += '<div style="font-size:40px;margin-bottom:12px;">&#128269;</div>';
    h += '<p>Digite uma palavra acima</p>';
    h += '<p style="font-size:11px;margin-top:6px;opacity:0.7;">Funciona com qualquer idioma</p>';
    h += '</div></div>';

    return h;
  }

  var filtroAtual = 'tudo';

  function setFiltro(f) {
    filtroAtual = f;
    var filtros = ['tudo', 'definicao', 'sinonimos', 'antonimos', 'traducao', 'origem'];
    filtros.forEach(function(id) {
      var btn = document.getElementById('dic-filtro-' + id);
      if (!btn) return;
      var active = id === f;
      btn.style.background = active ? 'var(--accent,#e8a04a)' : 'var(--bg-3,#211d18)';
      btn.style.color = active ? 'var(--bg-0,#0f0d0a)' : 'var(--text-2,#8a7a6a)';
    });
  }

  async function buscar() {
    var input = document.getElementById('dic-input');
    if (!input || !input.value.trim()) return;
    var palavra = input.value.trim();
    var resultado = document.getElementById('dic-resultado');
    if (!resultado) return;

    resultado.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--text-2,#8a7a6a);font-size:14px;">&#9203; <em>Consultando...</em></div>';

    var prompt = buildPrompt(palavra, filtroAtual);

    try {
      var r = await callAI(prompt);
      mostrarResultado(palavra, r);
    } catch(e) {
      resultado.innerHTML = '<div style="background:rgba(224,112,96,0.1);border:1px solid rgba(224,112,96,0.3);border-radius:10px;padding:14px;font-size:13px;color:#e07060;">&#10060; ' + esc(e.message) + '</div>';
    }
  }

  function buildPrompt(palavra, filtro) {
    var base = 'Para a palavra/frase "' + palavra + '", ';
    var instrucoes = {
      tudo: base + 'forneça em formato organizado:\n1. 📖 DEFINIÇÃO: explique o significado\n2. 🔄 SINÔNIMOS: liste 4-6 sinônimos\n3. 🔁 ANTÔNIMOS: liste 3-5 antônimos (se aplicável)\n4. 🌍 TRADUÇÃO: traduza para português (se não estiver em português) ou inglês e espanhol\n5. 🌱 ORIGEM: explique brevemente a etimologia\n\nSeja conciso e direto.',
      definicao: base + 'explique o significado de forma clara e completa. Inclua exemplos de uso se possível.',
      sinonimos: base + 'liste todos os sinônimos que conhece, organizados por contexto/significado.',
      antonimos: base + 'liste os antônimos, explicando brevemente a diferença de sentido.',
      traducao: base + 'traduza para português, inglês, espanhol e francês. Indique o idioma original da palavra.',
      origem: base + 'explique a etimologia: de qual língua vem, qual é a raiz, quando surgiu e como evoluiu.'
    };
    return instrucoes[filtro] || instrucoes['tudo'];
  }

  function mostrarResultado(palavra, texto) {
    var resultado = document.getElementById('dic-resultado');
    if (!resultado) return;

    var html = '<div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--border,#3a3228);">';
    html += '<div style="font-size:20px;font-weight:700;color:var(--accent,#e8a04a);font-family:var(--font-display,serif);">' + esc(palavra) + '</div>';
    html += '</div>';

    html += '<div style="font-size:13px;color:var(--text-0,#f0e8df);line-height:1.75;">' + md(texto) + '</div>';

   
    html += '<button id="dic-copiar-btn" style="margin-top:16px;padding:7px 14px;background:var(--bg-3,#211d18);border:1px solid var(--border,#3a3228);border-radius:8px;font-size:12px;color:var(--text-1,#c8b89a);cursor:pointer;width:100%;">&#128203; Copiar resultado</button>';

    resultado.innerHTML = html;

   
    document.getElementById('dic-copiar-btn').addEventListener('click', function() {
      var textoCopiar = palavra + '\n\n' + texto;
      navigator.clipboard.writeText(textoCopiar).then(function() {
        if (typeof App !== 'undefined') App.toast('Copiado!', 'success');
      });
    });
  }

  function injetarBotao() {
    var nav = document.getElementById('pdf-nav');
    if (!nav || document.getElementById('btn-dicionario-pdf')) return;

    var btn = document.createElement('button');
    btn.id = 'btn-dicionario-pdf';
    btn.className = 'pdf-nav-btn';
    btn.title = 'Dicionário Inteligente';
    btn.style.cssText = 'display:flex;align-items:center;gap:5px;padding:5px 10px;font-size:12px;font-weight:600;white-space:nowrap;';
    btn.innerHTML = '&#128218; Dicion&aacute;rio';
    btn.onclick = function() {
      var aberto = document.getElementById('dic-painel');
      if (aberto) {
        fechar();
        btn.style.background = 'transparent';
        btn.style.color = 'var(--text-2,#8a7a6a)';
      } else {
        abrir();
        btn.style.background = 'var(--accent,#e8a04a)';
        btn.style.color = 'var(--bg-0,#0f0d0a)';
      }
    };
    nav.insertBefore(btn, nav.firstChild);
  }

  
  var observer = new MutationObserver(function() {
    var nav = document.getElementById('pdf-nav');
    if (nav && nav.style.display !== 'none' && !document.getElementById('btn-dicionario-pdf')) {
      injetarBotao();
    }
  });

  document.addEventListener('DOMContentLoaded', function() {
    var pdfBody = document.getElementById('pdf-body');
    if (pdfBody) {
      observer.observe(pdfBody, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    }
   
    var nav = document.getElementById('pdf-nav');
    if (nav) observer.observe(nav, { attributes: true, attributeFilter: ['style'] });
  });

 
  var style = document.createElement('style');
  style.textContent = '@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
  document.head.appendChild(style);

  return {
    toggle: toggle,
    abrir: abrir,
    fechar: fechar,
    buscar: buscar,
    setFiltro: setFiltro
  };
})();

window.DicionarioPDF = DicionarioPDF;