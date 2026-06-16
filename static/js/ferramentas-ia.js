
const FerramentasIA = (() => {
  const API = '';
  let conceitoSufixo = '';

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function md(text) {
    return esc(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.12);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:13px;">$1</code>')
      .replace(/\n/g, '<br>');
  }

  async function callAI(message, context) {
    var res = await fetch(API + '/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message, context: context || '' })
    });
    if (!res.ok) {
      var err = await res.json().catch(function() { return {}; });
      throw new Error(err.detail || 'Erro ' + res.status);
    }
    var data = await res.json();
    return data.response || '';
  }

  function buildPanel() {
    var h = '';

    h += '<div style="background:var(--bg-2,#1a1612);border:1px solid var(--border,#3a3228);border-radius:20px;width:100%;max-width:700px;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,0.6);overflow:hidden;">';

    h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid var(--border,#3a3228);background:var(--bg-3,#211d18);flex-shrink:0;">';
    h += '<div><h2 style="font-family:var(--font-display,serif);font-size:22px;color:var(--text-0,#f0e8df);margin:0 0 2px;">&#129504; Ferramentas de IA</h2>';
    h += '<p style="color:var(--text-2,#8a7a6a);font-size:13px;margin:0;">Resumo &bull; Quest&otilde;es &bull; Conceitos &bull; Reda&ccedil;&atilde;o</p></div>';
    h += '<button onclick="FerramentasIA.closePanel()" style="background:none;border:none;color:var(--text-2,#8a7a6a);cursor:pointer;font-size:22px;line-height:1;padding:4px;">&times;</button>';
    h += '</div>';

    h += '<div style="display:flex;border-bottom:1px solid var(--border,#3a3228);flex-shrink:0;">';
    h += tab('resumo', '&#128196; Resumo', true);
    h += tab('questoes', '&#10067; Quest&otilde;es', false);
    h += tab('conceito', '&#128161; Conceito', false);
    h += tab('redacao', '&#9997; Reda&ccedil;&atilde;o', false);
    h += '</div>';

    
    h += '<div style="flex:1;overflow-y:auto;padding:24px;">';
    h += panelResumo();
    h += panelQuestoes();
    h += panelConceito();
    h += panelRedacao();
    h += '</div>';

    h += '</div>';
    return h;
  }

  function tab(id, label, active) {
    var bg = active ? 'var(--accent,#e8a04a)' : 'transparent';
    var color = active ? 'var(--bg-0,#0f0d0a)' : 'var(--text-2,#8a7a6a)';
    var border = active ? '2px solid var(--accent,#e8a04a)' : '2px solid transparent';
    return '<button id="fia-tab-' + id + '" onclick="FerramentasIA.switchTab(\'' + id + '\')" style="flex:1;padding:13px 8px;border:none;cursor:pointer;font-size:13px;font-weight:600;background:' + bg + ';color:' + color + ';border-bottom:' + border + ';">' + label + '</button>';
  }

  function inputStyle() {
    return 'background:var(--bg-3,#211d18);border:1px solid var(--border,#3a3228);border-radius:10px;padding:12px 14px;font-size:14px;color:var(--text-0,#f0e8df);outline:none;';
  }

  function selectStyle() {
    return 'background:var(--bg-3,#211d18);border:1px solid var(--border,#3a3228);border-radius:8px;padding:9px 12px;font-size:13px;color:var(--text-1,#c8b89a);outline:none;';
  }

  function btnStyle() {
    return 'flex:1;padding:10px 20px;background:var(--accent,#e8a04a);color:var(--bg-0,#0f0d0a);border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;';
  }

  function panelResumo() {
    var h = '<div id="fia-content-resumo">';
    h += '<p style="color:var(--text-2,#8a7a6a);font-size:13px;margin:0 0 14px;">Cole um texto longo e a IA gera um resumo claro e organizado.</p>';
    h += '<textarea id="fia-resumo-input" placeholder="Cole aqui o texto que deseja resumir..." style="' + inputStyle() + 'width:100%;min-height:150px;resize:vertical;box-sizing:border-box;line-height:1.5;"></textarea>';
    h += '<div style="display:flex;gap:10px;margin-top:12px;align-items:center;">';
    h += '<select id="fia-resumo-tamanho" style="' + selectStyle() + '">';
    h += '<option value="curto">Resumo curto (3-5 pontos)</option>';
    h += '<option value="medio" selected>Resumo m&eacute;dio</option>';
    h += '<option value="detalhado">Resumo detalhado</option>';
    h += '</select>';
    h += '<button onclick="FerramentasIA.gerarResumo()" style="' + btnStyle() + '">&#10024; Gerar Resumo</button>';
    h += '</div>';
    h += '<div id="fia-resumo-output" style="display:none;margin-top:18px;"></div>';
    h += '</div>';
    return h;
  }

  function panelQuestoes() {
    var h = '<div id="fia-content-questoes" style="display:none;">';
    h += '<p style="color:var(--text-2,#8a7a6a);font-size:13px;margin:0 0 14px;">Cole um texto ou descreva uma mat&eacute;ria e a IA gera quest&otilde;es.</p>';
    h += '<textarea id="fia-questoes-input" placeholder="Ex: Revolu&ccedil;&atilde;o Francesa ou cole um texto..." style="' + inputStyle() + 'width:100%;min-height:120px;resize:vertical;box-sizing:border-box;line-height:1.5;"></textarea>';
    h += '<div style="display:flex;gap:10px;margin-top:12px;align-items:center;">';
    h += '<select id="fia-questoes-tipo" style="' + selectStyle() + '">';
    h += '<option value="multipla">M&uacute;ltipla escolha (com gabarito)</option>';
    h += '<option value="dissertativa">Dissertativas</option>';
    h += '<option value="verdadeiro">Verdadeiro ou Falso</option>';
    h += '<option value="misto">Misto</option>';
    h += '</select>';
    h += '<select id="fia-questoes-qtd" style="' + selectStyle() + '">';
    h += '<option value="3">3 quest&otilde;es</option>';
    h += '<option value="5" selected>5 quest&otilde;es</option>';
    h += '<option value="10">10 quest&otilde;es</option>';
    h += '</select>';
    h += '<button onclick="FerramentasIA.gerarQuestoes()" style="' + btnStyle() + '">&#10067; Gerar Quest&otilde;es</button>';
    h += '</div>';
    h += '<div id="fia-questoes-output" style="display:none;margin-top:18px;"></div>';
    h += '</div>';
    return h;
  }

  function panelConceito() {
    var h = '<div id="fia-content-conceito" style="display:none;">';
    h += '<p style="color:var(--text-2,#8a7a6a);font-size:13px;margin:0 0 14px;">Digite um termo ou conceito e a IA explica de forma did&aacute;tica.</p>';
    h += '<div style="display:flex;gap:10px;">';
    h += '<input id="fia-conceito-input" type="text" placeholder="Ex: Teorema de Pit&aacute;goras, Fotos&iacute;ntese..." onkeydown="if(event.key===\'Enter\')FerramentasIA.explicarConceito()" style="' + inputStyle() + 'flex:1;" />';
    h += '<button onclick="FerramentasIA.explicarConceito()" style="padding:10px 20px;background:var(--accent,#e8a04a);color:var(--bg-0,#0f0d0a);border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;">&#128161; Explicar</button>';
    h += '</div>';
    h += '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">';
    var tags = ['Como se eu tivesse 10 anos', 'D&ecirc; exemplos pr&aacute;ticos', 'Mostre a f&oacute;rmula', 'Compare com cotidiano'];
    var vals = ['Como se eu tivesse 10 anos', 'De exemplos praticos', 'Mostre a formula', 'Compare com cotidiano'];
    for (var i = 0; i < tags.length; i++) {
      h += '<button onclick="FerramentasIA.setSufixo(\'' + vals[i] + '\')" style="padding:5px 10px;background:var(--bg-3,#211d18);border:1px solid var(--border,#3a3228);border-radius:20px;font-size:12px;color:var(--text-2,#8a7a6a);cursor:pointer;">' + tags[i] + '</button>';
    }
    h += '</div>';
    h += '<div id="fia-conceito-output" style="display:none;margin-top:18px;"></div>';
    h += '</div>';
    return h;
  }

  function panelRedacao() {
    var h = '<div id="fia-content-redacao" style="display:none;">';
    h += '<p style="color:var(--text-2,#8a7a6a);font-size:13px;margin:0 0 14px;">Cole sua reda&ccedil;&atilde;o e receba feedback detalhado com nota e sugest&otilde;es.</p>';
    h += '<textarea id="fia-redacao-input" placeholder="Cole aqui sua reda&ccedil;&atilde;o completa..." style="' + inputStyle() + 'width:100%;min-height:200px;resize:vertical;box-sizing:border-box;line-height:1.6;"></textarea>';
    h += '<div style="display:flex;gap:10px;margin-top:12px;align-items:center;">';
    h += '<select id="fia-redacao-tipo" style="' + selectStyle() + '">';
    h += '<option value="enem">Estilo ENEM (5 compet&ecirc;ncias)</option>';
    h += '<option value="dissertativa">Dissertativa argumentativa</option>';
    h += '<option value="narrativa">Narrativa</option>';
    h += '<option value="geral">Avalia&ccedil;&atilde;o geral</option>';
    h += '</select>';
    h += '<button onclick="FerramentasIA.corrigirRedacao()" style="' + btnStyle() + '">&#9997; Corrigir Reda&ccedil;&atilde;o</button>';
    h += '</div>';
    h += '<div id="fia-redacao-output" style="display:none;margin-top:18px;"></div>';
    h += '</div>';
    return h;
  }

  function openPanel() {
    var old = document.getElementById('ferramentas-ia-panel');
    if (old) old.remove();

    var panel = document.createElement('div');
    panel.id = 'ferramentas-ia-panel';
    panel.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9998;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);';
    panel.innerHTML = buildPanel();
    document.body.appendChild(panel);
    panel.addEventListener('click', function(e) { if (e.target === panel) closePanel(); });
  }

  function closePanel() {
    var p = document.getElementById('ferramentas-ia-panel');
    if (p) p.remove();
  }

  function switchTab(tabId) {
    var tabs = ['resumo', 'questoes', 'conceito', 'redacao'];
    tabs.forEach(function(t) {
      var btn = document.getElementById('fia-tab-' + t);
      var content = document.getElementById('fia-content-' + t);
      var active = t === tabId;
      if (btn) {
        btn.style.background = active ? 'var(--accent,#e8a04a)' : 'transparent';
        btn.style.color = active ? 'var(--bg-0,#0f0d0a)' : 'var(--text-2,#8a7a6a)';
        btn.style.borderBottom = active ? '2px solid var(--accent,#e8a04a)' : '2px solid transparent';
      }
      if (content) content.style.display = active ? 'block' : 'none';
    });
  }

  function setSufixo(s) {
    conceitoSufixo = s;
    if (typeof App !== 'undefined') App.toast('Foco: ' + s, '');
  }

  function showLoading(id, msg) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.display = 'block';
    el.innerHTML = '<div style="background:var(--bg-3,#211d18);border:1px solid var(--border,#3a3228);border-radius:12px;padding:16px;text-align:center;color:var(--text-2,#8a7a6a);font-size:14px;">&#9203; <em>' + (msg || 'Processando...') + '</em></div>';
  }

  function showResult(id, resultHtml) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.display = 'block';
    el.innerHTML = '<div style="background:var(--bg-3,#211d18);border:1px solid var(--border,#3a3228);border-radius:12px;padding:18px;font-size:14px;color:var(--text-0,#f0e8df);line-height:1.7;">' + resultHtml + '</div>';

    
    var copyBtn = document.createElement('button');
    copyBtn.textContent = '📋 Copiar resultado';
    copyBtn.style.cssText = 'margin-top:12px;padding:7px 14px;background:var(--bg-2,#1a1612);border:1px solid var(--border,#3a3228);border-radius:8px;font-size:12px;color:var(--text-1,#c8b89a);cursor:pointer;display:block;';
    var resultDiv = el.querySelector('div');
    copyBtn.addEventListener('click', function() {
      var text = resultDiv ? resultDiv.innerText : '';
      navigator.clipboard.writeText(text).then(function() {
        if (typeof App !== 'undefined') App.toast('Copiado!', 'success');
        copyBtn.textContent = '✅ Copiado!';
        setTimeout(function() { copyBtn.textContent = '📋 Copiar resultado'; }, 2000);
      });
    });
    el.appendChild(copyBtn);
  }

  function showError(id, msg) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.display = 'block';
    el.innerHTML = '<div style="background:rgba(224,112,96,0.1);border:1px solid rgba(224,112,96,0.3);border-radius:12px;padding:14px;font-size:14px;color:#e07060;">&#10060; ' + esc(msg) + '</div>';
  }

  async function gerarResumo() {
    var input = document.getElementById('fia-resumo-input');
    if (!input || !input.value.trim()) { if (typeof App !== 'undefined') App.toast('Cole um texto para resumir.', 'error'); return; }
    if (input.value.trim().length < 50) { if (typeof App !== 'undefined') App.toast('Texto muito curto.', 'error'); return; }
    var tamanho = document.getElementById('fia-resumo-tamanho').value;
    var instrucoes = {
      curto: 'Faça um resumo em 3 a 5 bullet points curtos e objetivos.',
      medio: 'Faça um resumo em 1 a 2 parágrafos claros com as ideias principais.',
      detalhado: 'Faça um resumo detalhado com tópicos e subtópicos.'
    };
    showLoading('fia-resumo-output', 'Gerando resumo...');
    try {
      var r = await callAI(instrucoes[tamanho] + '\n\nTexto:\n' + input.value.trim(), 'Você é um assistente especializado em resumir textos para estudantes.');
      showResult('fia-resumo-output', md(r));
    } catch(e) { showError('fia-resumo-output', e.message); }
  }

  async function gerarQuestoes() {
    var input = document.getElementById('fia-questoes-input');
    if (!input || !input.value.trim()) { if (typeof App !== 'undefined') App.toast('Descreva o assunto ou cole um texto.', 'error'); return; }
    var tipo = document.getElementById('fia-questoes-tipo').value;
    var qtd = document.getElementById('fia-questoes-qtd').value;
    var prompts = {
      multipla: 'Crie ' + qtd + ' questões de múltipla escolha (A, B, C, D) com gabarito ao final.',
      dissertativa: 'Crie ' + qtd + ' questões dissertativas com respostas esperadas.',
      verdadeiro: 'Crie ' + qtd + ' afirmações para responder Verdadeiro ou Falso, com justificativa.',
      misto: 'Crie ' + qtd + ' questões variadas (múltipla escolha, dissertativas e V/F) com gabarito.'
    };
    showLoading('fia-questoes-output', 'Criando questões...');
    try {
      var r = await callAI(prompts[tipo] + '\n\nAssunto/Texto:\n' + input.value.trim(), 'Você é um professor criando exercícios de revisão para estudantes.');
      showResult('fia-questoes-output', md(r));
    } catch(e) { showError('fia-questoes-output', e.message); }
  }

  async function explicarConceito() {
    var input = document.getElementById('fia-conceito-input');
    if (!input || !input.value.trim()) { if (typeof App !== 'undefined') App.toast('Digite um conceito para explicar.', 'error'); return; }
    var sufixo = conceitoSufixo ? '\n\nFoco especial: ' + conceitoSufixo + '.' : '';
    showLoading('fia-conceito-output', 'Explicando "' + input.value.trim() + '"...');
    try {
      var r = await callAI('Explique o conceito de "' + input.value.trim() + '" de forma didática e clara para um estudante.' + sufixo, 'Você é um professor didático explicando conceitos de forma clara e acessível.');
      showResult('fia-conceito-output', md(r));
      conceitoSufixo = '';
    } catch(e) { showError('fia-conceito-output', e.message); }
  }

  async function corrigirRedacao() {
    var input = document.getElementById('fia-redacao-input');
    if (!input || !input.value.trim()) { if (typeof App !== 'undefined') App.toast('Cole sua redação para corrigir.', 'error'); return; }
    if (input.value.trim().length < 100) { if (typeof App !== 'undefined') App.toast('Redação muito curta.', 'error'); return; }
    var tipo = document.getElementById('fia-redacao-tipo').value;
    var prompts = {
      enem: 'Corrija esta redação no estilo ENEM. Avalie as 5 competências (0-200 cada, total 0-1000) e dê sugestões detalhadas de melhoria.',
      dissertativa: 'Corrija esta redação dissertativa argumentativa. Avalie tese, argumentos, coesão e coerência. Dê nota de 0 a 10 e sugestões.',
      narrativa: 'Corrija esta redação narrativa. Avalie enredo, personagens, linguagem e criatividade. Dê nota de 0 a 10 e sugestões.',
      geral: 'Faça uma correção geral: gramática, ortografia, coesão, coerência e argumentação. Aponte pontos positivos e o que melhorar.'
    };
    showLoading('fia-redacao-output', 'Analisando sua redação...');
    try {
      var r = await callAI(prompts[tipo] + '\n\nRedação:\n' + input.value.trim(), 'Você é um professor especialista em correção de redações, rigoroso mas construtivo.');
      showResult('fia-redacao-output', md(r));
    } catch(e) { showError('fia-redacao-output', e.message); }
  }

  return {
    openPanel: openPanel,
    closePanel: closePanel,
    switchTab: switchTab,
    setSufixo: setSufixo,
    gerarResumo: gerarResumo,
    gerarQuestoes: gerarQuestoes,
    explicarConceito: explicarConceito,
    corrigirRedacao: corrigirRedacao
  };
})();

window.FerramentasIA = FerramentasIA;