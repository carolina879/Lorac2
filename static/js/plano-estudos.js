const PlanoEstudos = (() => {
  const API = '';

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function md(text) {
    return esc(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/#{1,3} (.+)/g, '<strong style="font-size:15px;display:block;margin-top:10px;color:var(--accent,#e8a04a);">$1</strong>')
      .replace(/\n/g, '<br>');
  }

  async function callAI(message) {
    var res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message, context: 'Você é um especialista em pedagogia e planejamento de estudos. Monte planos detalhados, práticos e motivadores.' })
    });
    if (!res.ok) {
      var err = await res.json().catch(function() { return {}; });
      throw new Error(err.detail || 'Erro ' + res.status);
    }
    var data = await res.json();
    return data.response || '';
  }

  function openPanel() {
    var old = document.getElementById('plano-panel');
    if (old) { old.remove(); return; }

    var panel = document.createElement('div');
    panel.id = 'plano-panel';
    panel.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9998;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);';
    panel.innerHTML = buildPanel();
    document.body.appendChild(panel);
    panel.addEventListener('click', function(e) { if (e.target === panel) closePanel(); });
  }

  function closePanel() {
    var p = document.getElementById('plano-panel');
    if (p) p.remove();
  }

  function buildPanel() {
    var h = '<div style="background:var(--bg-2,#1a1612);border:1px solid var(--border,#3a3228);border-radius:20px;width:100%;max-width:640px;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,0.6);overflow:hidden;">';

    h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid var(--border,#3a3228);background:var(--bg-3,#211d18);flex-shrink:0;">';
    h += '<div><h2 style="font-family:var(--font-display,serif);font-size:22px;color:var(--text-0,#f0e8df);margin:0 0 2px;">&#128197; Plano de Estudos</h2>';
    h += '<p style="color:var(--text-2,#8a7a6a);font-size:13px;margin:0;">A IA monta seu cronograma personalizado</p></div>';
    h += '<button onclick="PlanoEstudos.closePanel()" style="background:none;border:none;color:var(--text-2,#8a7a6a);cursor:pointer;font-size:22px;line-height:1;padding:4px;">&times;</button>';
    h += '</div>';

    h += '<div id="plano-form" style="flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:16px;">';

    h += campo('Matérias / Assuntos a estudar',
      '<textarea id="plano-materias" placeholder="Ex: Matemática (álgebra, geometria), Português (gramática, redação), Física (cinemática)..." style="width:100%;min-height:90px;background:var(--bg-3,#211d18);border:1px solid var(--border,#3a3228);border-radius:10px;padding:12px 14px;font-size:14px;color:var(--text-0,#f0e8df);outline:none;resize:vertical;box-sizing:border-box;line-height:1.5;"></textarea>');

    h += campo('Objetivo principal',
      '<input id="plano-objetivo" type="text" placeholder="Ex: Passar no ENEM, Concurso público, Vestibular FUVEST, Recuperação escolar..." style="width:100%;background:var(--bg-3,#211d18);border:1px solid var(--border,#3a3228);border-radius:10px;padding:12px 14px;font-size:14px;color:var(--text-0,#f0e8df);outline:none;box-sizing:border-box;" />');

    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">';
    h += campo('Duração do plano',
      '<select id="plano-semanas" style="width:100%;background:var(--bg-3,#211d18);border:1px solid var(--border,#3a3228);border-radius:10px;padding:12px 14px;font-size:14px;color:var(--text-0,#f0e8df);outline:none;">' +
      '<option value="1">1 semana</option>' +
      '<option value="2" selected>2 semanas</option>' +
      '<option value="4">4 semanas (1 mês)</option>' +
      '</select>');
    h += campo('Horas disponíveis por dia',
      '<select id="plano-horas" style="width:100%;background:var(--bg-3,#211d18);border:1px solid var(--border,#3a3228);border-radius:10px;padding:12px 14px;font-size:14px;color:var(--text-0,#f0e8df);outline:none;">' +
      '<option value="1">1 hora</option>' +
      '<option value="2" selected>2 horas</option>' +
      '<option value="3">3 horas</option>' +
      '<option value="4">4 horas</option>' +
      '<option value="6">6+ horas</option>' +
      '</select>');
    h += '</div>';

    h += campo('Dias disponíveis para estudar',
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
      diaBtn('seg', 'Seg', true) +
      diaBtn('ter', 'Ter', true) +
      diaBtn('qua', 'Qua', true) +
      diaBtn('qui', 'Qui', true) +
      diaBtn('sex', 'Sex', true) +
      diaBtn('sab', 'Sáb', false) +
      diaBtn('dom', 'Dom', false) +
      '</div>');

    h += campo('Nível de conhecimento atual',
      '<select id="plano-nivel" style="width:100%;background:var(--bg-3,#211d18);border:1px solid var(--border,#3a3228);border-radius:10px;padding:12px 14px;font-size:14px;color:var(--text-0,#f0e8df);outline:none;">' +
      '<option value="iniciante">Iniciante (pouca base)</option>' +
      '<option value="intermediario" selected>Intermediário (base razoável)</option>' +
      '<option value="avancado">Avançado (revisão e aprofundamento)</option>' +
      '</select>');

    h += campo('Observações extras (opcional)',
      '<input id="plano-obs" type="text" placeholder="Ex: tenho prova na semana 3, prefiro estudar à noite, dificuldade em cálculo..." style="width:100%;background:var(--bg-3,#211d18);border:1px solid var(--border,#3a3228);border-radius:10px;padding:12px 14px;font-size:14px;color:var(--text-0,#f0e8df);outline:none;box-sizing:border-box;" />');

    h += '<button onclick="PlanoEstudos.gerar()" style="width:100%;padding:14px;background:var(--accent,#e8a04a);color:var(--bg-0,#0f0d0a);border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;margin-top:4px;">&#9889; Gerar Plano de Estudos</button>';

    h += '</div>';

    h += '<div id="plano-resultado" style="display:none;flex-direction:column;flex:1;overflow:hidden;">';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 24px;border-top:1px solid var(--border,#3a3228);border-bottom:1px solid var(--border,#3a3228);background:var(--bg-3,#211d18);flex-shrink:0;">';
    h += '<span style="font-size:14px;font-weight:600;color:var(--text-0,#f0e8df);">&#10024; Seu plano est&aacute; pronto!</span>';
    h += '<div style="display:flex;gap:8px;">';
    h += '<button onclick="PlanoEstudos.copiar()" style="padding:7px 14px;background:var(--bg-2,#1a1612);border:1px solid var(--border,#3a3228);border-radius:8px;font-size:12px;color:var(--text-1,#c8b89a);cursor:pointer;">&#128203; Copiar</button>';
    h += '<button onclick="PlanoEstudos.exportarPDF()" style="padding:7px 14px;background:var(--bg-2,#1a1612);border:1px solid var(--border,#3a3228);border-radius:8px;font-size:12px;color:var(--text-1,#c8b89a);cursor:pointer;">&#128196; Exportar PDF</button>';
    h += '<button onclick="PlanoEstudos.voltarForm()" style="padding:7px 14px;background:var(--bg-2,#1a1612);border:1px solid var(--border,#3a3228);border-radius:8px;font-size:12px;color:var(--text-1,#c8b89a);cursor:pointer;">&#8592; Refazer</button>';
    h += '</div></div>';
    h += '<div id="plano-texto" style="flex:1;overflow-y:auto;padding:24px;font-size:14px;color:var(--text-0,#f0e8df);line-height:1.8;"></div>';
    h += '</div>';

    h += '</div>';
    return h;
  }

  function campo(label, inputHtml) {
    return '<div><label style="display:block;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--text-2,#8a7a6a);margin-bottom:7px;">' + label + '</label>' + inputHtml + '</div>';
  }

  function diaBtn(id, label, ativo) {
    var bg = ativo ? 'var(--accent,#e8a04a)' : 'var(--bg-3,#211d18)';
    var color = ativo ? 'var(--bg-0,#0f0d0a)' : 'var(--text-2,#8a7a6a)';
    return '<button id="dia-' + id + '" data-ativo="' + (ativo ? '1' : '0') + '" onclick="PlanoEstudos.toggleDia(\'' + id + '\')" style="padding:7px 12px;background:' + bg + ';color:' + color + ';border:1px solid var(--border,#3a3228);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">' + label + '</button>';
  }

  var _planoTexto = '';

  function toggleDia(id) {
    var btn = document.getElementById('dia-' + id);
    if (!btn) return;
    var ativo = btn.dataset.ativo === '1';
    btn.dataset.ativo = ativo ? '0' : '1';
    btn.style.background = ativo ? 'var(--bg-3,#211d18)' : 'var(--accent,#e8a04a)';
    btn.style.color = ativo ? 'var(--text-2,#8a7a6a)' : 'var(--bg-0,#0f0d0a)';
  }

  function getDias() {
    var dias = { seg: 'Segunda', ter: 'Terça', qua: 'Quarta', qui: 'Quinta', sex: 'Sexta', sab: 'Sábado', dom: 'Domingo' };
    var selecionados = [];
    Object.keys(dias).forEach(function(id) {
      var btn = document.getElementById('dia-' + id);
      if (btn && btn.dataset.ativo === '1') selecionados.push(dias[id]);
    });
    return selecionados;
  }

  async function gerar() {
    var materias = (document.getElementById('plano-materias') || {}).value || '';
    var objetivo = (document.getElementById('plano-objetivo') || {}).value || '';
    var semanas = (document.getElementById('plano-semanas') || {}).value || '2';
    var horas = (document.getElementById('plano-horas') || {}).value || '2';
    var nivel = (document.getElementById('plano-nivel') || {}).value || 'intermediario';
    var obs = (document.getElementById('plano-obs') || {}).value || '';
    var dias = getDias();

    if (!materias.trim()) { if (typeof App !== 'undefined') App.toast('Informe as matérias a estudar.', 'error'); return; }
    if (dias.length === 0) { if (typeof App !== 'undefined') App.toast('Selecione pelo menos um dia.', 'error'); return; }

    var formEl = document.getElementById('plano-form');
    var resultEl = document.getElementById('plano-resultado');
    if (formEl) formEl.style.display = 'none';
    if (resultEl) {
      resultEl.style.display = 'flex';
      var textoEl = document.getElementById('plano-texto');
      if (textoEl) textoEl.innerHTML = '<div style="text-align:center;padding:60px 0;color:var(--text-2,#8a7a6a);font-size:14px;">&#9203; <em>A IA est&aacute; montando seu plano personalizado...</em></div>';
    }

    var nivelLabel = { iniciante: 'iniciante (pouca base)', intermediario: 'intermediário (base razoável)', avancado: 'avançado (revisão e aprofundamento)' };

    var prompt = 'Monte um plano de estudos detalhado e organizado com as seguintes informações:\n\n' +
      '- Matérias/Assuntos: ' + materias.trim() + '\n' +
      (objetivo.trim() ? '- Objetivo: ' + objetivo.trim() + '\n' : '') +
      '- Duração: ' + semanas + ' semana(s)\n' +
      '- Horas disponíveis por dia: ' + horas + ' hora(s)\n' +
      '- Dias de estudo: ' + dias.join(', ') + '\n' +
      '- Nível atual: ' + nivelLabel[nivel] + '\n' +
      (obs.trim() ? '- Observações: ' + obs.trim() + '\n' : '') +
      '\nOrganize o plano semana a semana, dia a dia. Para cada dia, especifique:\n' +
      '- Qual matéria/tópico estudar\n' +
      '- Quanto tempo dedicar a cada tópico\n' +
      '- O que praticar (exercícios, revisão, leitura etc)\n\n' +
      'Ao final, inclua dicas gerais de como aproveitar melhor o plano e manter a motivação.';

    try {
      var resultado = await callAI(prompt);
      _planoTexto = resultado;
      var textoEl = document.getElementById('plano-texto');
      if (textoEl) textoEl.innerHTML = md(resultado);
    } catch(e) {
      var textoEl = document.getElementById('plano-texto');
      if (textoEl) textoEl.innerHTML = '<div style="background:rgba(224,112,96,0.1);border:1px solid rgba(224,112,96,0.3);border-radius:10px;padding:14px;color:#e07060;">&#10060; ' + esc(e.message) + '</div>';
    }
  }

  function voltarForm() {
    var formEl = document.getElementById('plano-form');
    var resultEl = document.getElementById('plano-resultado');
    if (formEl) formEl.style.display = 'flex';
    if (resultEl) resultEl.style.display = 'none';
  }

  function copiar() {
    if (!_planoTexto) return;
    navigator.clipboard.writeText(_planoTexto).then(function() {
      if (typeof App !== 'undefined') App.toast('Plano copiado!', 'success');
    });
  }

  function exportarPDF() {
    if (!_planoTexto) return;
    var win = window.open('', '_blank');
    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
    html += '<title>Plano de Estudos - StudySync</title>';
    html += '<style>';
    html += 'body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 24px; color: #222; line-height: 1.7; }';
    html += 'h1 { color: #e8a04a; border-bottom: 2px solid #e8a04a; padding-bottom: 10px; }';
    html += 'strong { color: #333; }';
    html += '.header { background: #f8f4ef; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; font-size: 13px; color: #666; }';
    html += '@media print { button { display: none; } }';
    html += '</style></head><body>';
    html += '<h1>&#128197; Plano de Estudos</h1>';
    html += '<div class="header">Gerado pelo StudySync &bull; ' + new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '</div>';
    html += '<div>' + _planoTexto.replace(/\n/g, '<br>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') + '</div>';
    html += '<br><br><button onclick="window.print()" style="padding:10px 24px;background:#e8a04a;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;margin-right:10px;">&#128196; Imprimir / Salvar PDF</button>';
    html += '</body></html>';
    win.document.write(html);
    win.document.close();
  }

  function addNavButtons() {
    document.querySelectorAll('.header-nav').forEach(function(nav) {
      if (nav.querySelector('[data-plano-btn]')) return;
      var btn = document.createElement('button');
      btn.setAttribute('data-plano-btn', '1');
      btn.className = 'nav-btn';
      btn.onclick = openPanel;
      btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/></svg>Plano IA';
      nav.appendChild(btn);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addNavButtons);
  } else {
    addNavButtons();
  }

  return {
    openPanel: openPanel,
    closePanel: closePanel,
    toggleDia: toggleDia,
    gerar: gerar,
    voltarForm: voltarForm,
    copiar: copiar,
    exportarPDF: exportarPDF
  };
})();

window.PlanoEstudos = PlanoEstudos;