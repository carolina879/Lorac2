(function() {
  'use strict';

  
  const _localData = {
    avisos: {},
    exercicios: {},
    respostas: {},
    videos: {}
  };

  
  function esc(str) {
    return String(str || '')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }

  function toast(msg, type = 'success') {
    if (typeof App !== 'undefined' && App.toast) {
      App.toast(msg, type);
    } else {
      const t = document.createElement('div');
      t.textContent = msg;
      Object.assign(t.style, {
        position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)',
        background: type === 'error' ? '#c0392b' : '#e8a04a',
        color:'#0f0d0a', padding:'10px 20px', borderRadius:'12px',
        fontFamily:'var(--font-body)', fontSize:'14px', zIndex:99999,
        boxShadow:'0 4px 16px rgba(0,0,0,.5)'
      });
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 3000);
    }
  }

  function getTurmaId() {
    return window.__currentTurmaId__ || null;
  }

  function getTurmaData(key) {
    const turmaId = getTurmaId();
    if (!turmaId) return [];
    if (!_localData[key][turmaId]) _localData[key][turmaId] = [];
    return _localData[key][turmaId];
  }

  function setTurmaData(key, data) {
    const turmaId = getTurmaId();
    if (!turmaId) return;
    _localData[key][turmaId] = data;
  }

  window.AvisosModule = {
    abrir() {
      let modal = document.getElementById('modal-add-aviso');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-add-aviso';
        modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:200;align-items:center;justify-content:center;padding:16px;';
        modal.innerHTML = `
          <div style="background:var(--bg-2, #1c1914);border:1px solid rgba(255,220,170,.15);border-radius:22px;padding:32px;width:100%;max-width:560px;position:relative;max-height:92vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.7);">
            <button onclick="AvisosModule.fechar()" style="position:absolute;top:16px;right:16px;background:none;border:none;color:#b8a89a;cursor:pointer;font-size:20px;line-height:1;">✕</button>
            <div style="margin-bottom:24px;">
              <div style="font-family:monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#e8a04a;margin-bottom:6px;">📧 Novo Aviso</div>
              <h3 style="font-family:'DM Serif Display',serif;font-size:26px;color:#f0e8de;margin:0;">Criar Aviso</h3>
            </div>
            <div style="background:var(--bg-3, #252018);border:1px solid rgba(255,220,170,.08);border-radius:14px;padding:16px;margin-bottom:16px;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(255,220,170,.08);">
                <label style="font-size:12px;color:#b8a89a;min-width:50px;">Para:</label>
                <span style="background:rgba(232,160,74,.15);color:#e8a04a;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:500;">👥 Todos os alunos</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                <label style="font-size:12px;color:#b8a89a;min-width:50px;">Assunto:</label>
                <input id="aviso-assunto" placeholder="Assunto do aviso..." style="flex:1;background:#1c1914;border:1px solid rgba(255,220,170,.08);border-radius:8px;padding:10px 12px;font-size:14px;color:#f0e8de;outline:none;font-family:inherit;" />
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <label style="font-size:12px;color:#b8a89a;min-width:50px;">Prioridade:</label>
                <select id="aviso-prioridade" style="background:#1c1914;border:1px solid rgba(255,220,170,.08);border-radius:8px;padding:10px 12px;font-size:13px;color:#f0e8de;outline:none;cursor:pointer;">
                  <option value="normal">📢 Normal</option>
                  <option value="importante">⚠️ Importante</option>
                  <option value="urgente">🚨 Urgente</option>
                </select>
              </div>
            </div>
            <div style="margin-bottom:14px;">
              <label style="font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#b8a89a;display:block;margin-bottom:6px;">Mensagem</label>
              <textarea id="aviso-mensagem" placeholder="Escreva o conteúdo do aviso..." style="width:100%;min-height:140px;background:var(--bg-3, #252018);border:1px solid rgba(255,220,170,.08);border-radius:12px;padding:14px;font-size:14px;color:#f0e8de;outline:none;resize:vertical;line-height:1.7;font-family:inherit;"></textarea>
            </div>
            <div id="aviso-err" style="color:#e07060;font-size:13px;margin-bottom:14px;text-align:center;display:none;background:rgba(192,57,43,.1);border-radius:10px;padding:10px;"></div>
            <div style="display:flex;gap:10px;">
              <button onclick="AvisosModule.fechar()" style="flex:1;padding:14px;background:transparent;color:#b8a89a;border:1px solid rgba(255,220,170,.08);border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;">Cancelar</button>
              <button onclick="AvisosModule.salvar()" style="flex:2;padding:14px;background:#e8a04a;color:#0f0d0a;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;">📤 Enviar Aviso</button>
            </div>
          </div>`;
        document.body.appendChild(modal);
      }
      document.getElementById('aviso-assunto').value = '';
      document.getElementById('aviso-mensagem').value = '';
      document.getElementById('aviso-prioridade').value = 'normal';
      document.getElementById('aviso-err').style.display = 'none';
      modal.style.display = 'flex';
      setTimeout(() => document.getElementById('aviso-assunto')?.focus(), 80);
    },

    fechar() {
      const modal = document.getElementById('modal-add-aviso');
      if (modal) modal.style.display = 'none';
    },

    salvar() {
      const assunto = document.getElementById('aviso-assunto')?.value.trim();
      if (!assunto) {
        document.getElementById('aviso-err').textContent = 'Digite o assunto do aviso.';
        document.getElementById('aviso-err').style.display = 'block';
        return;
      }
      const mensagem = document.getElementById('aviso-mensagem')?.value.trim();
      if (!mensagem) {
        document.getElementById('aviso-err').textContent = 'Digite a mensagem.';
        document.getElementById('aviso-err').style.display = 'block';
        return;
      }
      const turmaId = getTurmaId();
      if (!turmaId) {
        toast('Turma não identificada.', 'error');
        return;
      }
      const prioridade = document.getElementById('aviso-prioridade')?.value || 'normal';
      const user = (typeof App !== 'undefined' && App.state?.user) || {};
      const aviso = {
        id: 'aviso_' + Date.now(),
        assunto,
        mensagem,
        prioridade,
        autor: user.username || 'Professor',
        autorId: user.id,
        createdAt: new Date().toISOString(),
        lida: false,
      };
      let avisos = getTurmaData('avisos') || [];
      avisos.unshift(aviso);
      setTurmaData('avisos', avisos);
      this.fechar();
      toast('Aviso enviado com sucesso!', 'success');
      TurmasUI.renderTabContent('avisos');
    },

    renderLista(avisos) {
      if (!avisos || !avisos.length) {
        return '<div class="turma-empty"><div class="turma-empty-icon">📧</div><div>Nenhum aviso enviado ainda.</div></div>';
      }
      const prioIcons = { urgente: '🚨', importante: '⚠️', normal: '📢' };
      const prioColors = { urgente: '#c0392b', importante: '#e8a04a', normal: '#b8a89a' };
      return '<div class="avisos-list">' + avisos.map(a => `
        <div class="aviso-card ${a.lida ? 'lida' : 'nao-lida'}" onclick="AvisosModule.verDetalhe('${a.id}')">
          <div class="aviso-header">
            <span class="aviso-prio">${prioIcons[a.prioridade]}</span>
            <span class="aviso-assunto">${esc(a.assunto)}</span>
            ${!a.lida ? '<span class="aviso-badge-nova">Nova</span>' : ''}
          </div>
          <div class="aviso-preview">${esc(a.mensagem.substring(0, 100))}${a.mensagem.length > 100 ? '...' : ''}</div>
          <div class="aviso-meta">
            <span>👤 ${esc(a.autor)}</span>
            <span>📅 ${new Date(a.createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      `).join('') + '</div>';
    },

    verDetalhe(avisoId) {
      const turmaId = getTurmaId();
      if (!turmaId) return;
      const avisos = getTurmaData('avisos') || [];
      const aviso = avisos.find(a => a.id === avisoId);
      if (!aviso) return;
      aviso.lida = true;
      setTurmaData('avisos', avisos);
      const prioIcons = { urgente: '🚨', importante: '⚠️', normal: '📢' };
      const prioColors = { urgente: '#c0392b', importante: '#e8a04a', normal: '#b8a89a' };
      let modal = document.getElementById('modal-view-aviso');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-view-aviso';
        modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:210;align-items:center;justify-content:center;padding:16px;';
        document.body.appendChild(modal);
      }
      modal.innerHTML = `
        <div style="background:var(--bg-2, #1c1914);border:1px solid rgba(255,220,170,.15);border-radius:22px;padding:32px;width:100%;max-width:560px;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.7);">
          <button onclick="document.getElementById('modal-view-aviso').style.display='none'" style="position:absolute;top:16px;right:16px;background:none;border:none;color:#b8a89a;cursor:pointer;font-size:20px;">✕</button>
          <div style="background:var(--bg-3, #252018);border:1px solid rgba(255,220,170,.08);border-radius:14px;padding:14px;margin-bottom:20px;">
            <div style="display:flex;align-items:center;gap:8px;"><span style="font-size:12px;color:#b8a89a;">Para:</span><span style="background:rgba(232,160,74,.15);color:#e8a04a;padding:4px 10px;border-radius:6px;font-size:12px;">👥 Todos os alunos</span></div>
          </div>
          <div style="margin-bottom:16px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
              <span style="font-size:24px;">${prioIcons[aviso.prioridade]}</span>
              <h2 style="font-family:'DM Serif Display',serif;font-size:22px;color:#f0e8de;margin:0;flex:1;">${esc(aviso.assunto)}</h2>
            </div>
            <div style="display:flex;gap:12px;font-size:12px;color:#7a7065;flex-wrap:wrap;">
              <span>👤 ${esc(aviso.autor)}</span>
              <span>📅 ${new Date(aviso.createdAt).toLocaleString('pt-BR')}</span>
              <span style="color:${prioColors[aviso.prioridade]};font-weight:600;">${aviso.prioridade}</span>
            </div>
          </div>
          <div style="background:var(--bg-3, #252018);border:1px solid rgba(255,220,170,.08);border-radius:12px;padding:20px;line-height:1.8;font-size:14.5px;color:#f0e8de;white-space:pre-wrap;">${esc(aviso.mensagem)}</div>
        </div>`;
      modal.style.display = 'flex';
      TurmasUI.renderTabContent('avisos');
    }
  };

  window.ExerciciosModule = {
    tipo: 'alternativa',
    numQuestoes: 1,
    pdfFile: null,
    pdfData: null,

    abrir() {
      let modal = document.getElementById('modal-add-exercicio');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-add-exercicio';
        modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:200;align-items:center;justify-content:center;padding:16px;overflow-y:auto;';
        modal.innerHTML = this.getModalHTML();
        document.body.appendChild(modal);
      }
      this.tipo = 'alternativa';
      this.numQuestoes = 1;
      this.pdfFile = null;
      this.pdfData = null;
      document.getElementById('ex-titulo').value = '';
      document.getElementById('ex-data-entrega').value = '';
      document.getElementById('ex-pdf-preview')?.style && (document.getElementById('ex-pdf-preview').style.display = 'none');
      const dropzone = document.getElementById('ex-pdf-dropzone');
      if (dropzone) dropzone.style.display = 'block';
      document.getElementById('ex-err') && (document.getElementById('ex-err').style.display = 'none');
      this.carregarMaterias();
      this.renderQuestoes();
      this.setTipo('alternativa');
      modal.style.display = 'flex';
      setTimeout(() => document.getElementById('ex-titulo')?.focus(), 80);
    },

    getModalHTML() {
      return `<div style="background:var(--bg-2, #1c1914);border:1px solid rgba(255,220,170,.15);border-radius:22px;padding:32px;width:100%;max-width:600px;position:relative;margin:20px 0;box-shadow:0 20px 60px rgba(0,0,0,.7);">
        <button onclick="ExerciciosModule.fechar()" style="position:absolute;top:16px;right:16px;background:none;border:none;color:#b8a89a;cursor:pointer;font-size:20px;line-height:1;">✕</button>
        <div style="margin-bottom:24px;">
          <div style="font-family:monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#e8a04a;margin-bottom:6px;">📝 Novo Exercício</div>
          <h3 style="font-family:'DM Serif Display',serif;font-size:26px;color:#f0e8de;margin:0;">Criar Exercício</h3>
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#b8a89a;display:block;margin-bottom:6px;">Título</label>
          <input id="ex-titulo" placeholder="Ex.: Exercício 1 - Equações" style="width:100%;background:var(--bg-3, #252018);border:1px solid rgba(255,220,170,.08);border-radius:12px;padding:12px 14px;font-size:14.5px;color:#f0e8de;outline:none;font-family:inherit;" />
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#b8a89a;display:block;margin-bottom:6px;">Vincular à matéria</label>
          <select id="ex-materia" style="width:100%;background:var(--bg-3, #252018);border:1px solid rgba(255,220,170,.08);border-radius:12px;padding:12px 14px;font-size:14px;color:#f0e8de;outline:none;cursor:pointer;">
            <option value="">Nenhuma matéria</option>
          </select>
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#b8a89a;display:block;margin-bottom:8px;">Tipo</label>
          <div style="display:flex;gap:8px;">
            <button id="ex-tipo-marcAR" onclick="ExerciciosModule.setTipo('alternativa')" style="flex:1;padding:12px;background:#e8a04a;color:#0f0d0a;border:none;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;">☑️ Múltipla Escolha</button>
            <button id="ex-tipo-disserTAR" onclick="ExerciciosModule.setTipo('dissertativa')" style="flex:1;padding:12px;background:transparent;color:#b8a89a;border:1px solid rgba(255,220,170,.08);border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;">✏️ Dissertativa</button>
          </div>
        </div>
        <div id="ex-questoes-container" style="margin-bottom:12px;"></div>
        <button onclick="ExerciciosModule.adicionarQuestao()" style="width:100%;padding:12px;background:transparent;color:#e8a04a;border:2px dashed rgba(232,160,74,.3);border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;margin-bottom:14px;">+ Adicionar Questão</button>
        <div style="margin-bottom:14px;">
          <label style="font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#b8a89a;display:block;margin-bottom:6px;">Data de entrega</label>
          <input id="ex-data-entrega" type="date" style="width:100%;background:var(--bg-3, #252018);border:1px solid rgba(255,220,170,.08);border-radius:12px;padding:12px 14px;font-size:14px;color:#f0e8de;outline:none;cursor:pointer;" />
        </div>
        <div style="margin-bottom:16px;">
          <label style="font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#b8a89a;display:block;margin-bottom:6px;">📄 PDF da lista (opcional)</label>
          <div id="ex-pdf-dropzone" onclick="document.getElementById('ex-pdf-input').click()" style="border:2px dashed rgba(232,160,74,.3);border-radius:12px;padding:20px;text-align:center;cursor:pointer;">
            <div style="font-size:24px;margin-bottom:6px;">📄</div>
            <div style="font-size:13px;color:#b8a89a;">Clique ou arraste o PDF aqui</div>
          </div>
          <input type="file" id="ex-pdf-input" accept=".pdf" style="display:none;" onchange="ExerciciosModule.onPdfChange(event)" />
          <div id="ex-pdf-preview" style="display:none;background:var(--bg-3, #252018);border:1px solid rgba(255,220,170,.08);border-radius:12px;padding:12px 16px;align-items:center;gap:12px;margin-top:10px;">
            <span style="font-size:24px;">📄</span>
            <div style="flex:1;"><div id="ex-pdf-name" style="font-size:14px;color:#f0e8de;font-weight:500;"></div><div id="ex-pdf-size" style="font-size:12px;color:#7a7065;"></div></div>
            <button onclick="ExerciciosModule.clearPdf()" style="background:none;border:none;color:#b8a89a;cursor:pointer;font-size:16px;">✕</button>
          </div>
        </div>
        <div id="ex-err" style="color:#e07060;font-size:13px;margin-bottom:14px;text-align:center;display:none;background:rgba(192,57,43,.1);border-radius:10px;padding:10px;"></div>
        <div style="display:flex;gap:10px;">
          <button onclick="ExerciciosModule.fechar()" style="flex:1;padding:14px;background:transparent;color:#b8a89a;border:1px solid rgba(255,220,170,.08);border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;">Cancelar</button>
          <button onclick="ExerciciosModule.salvar()" style="flex:2;padding:14px;background:#e8a04a;color:#0f0d0a;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;">📝 Publicar Exercício</button>
        </div>
      </div>`;
    },

    fechar() {
      const modal = document.getElementById('modal-add-exercicio');
      if (modal) modal.style.display = 'none';
    },

    setTipo(tipo) {
      this.tipo = tipo;
      const btnA = document.getElementById('ex-tipo-marcAR');
      const btnB = document.getElementById('ex-tipo-disserTAR');
      const altContainer = document.querySelector('.ex-alternativas-container');
      if (tipo === 'alternativa') {
        btnA.style.background = '#e8a04a';
        btnA.style.color = '#0f0d0a';
        btnA.style.border = 'none';
        btnB.style.background = 'transparent';
        btnB.style.color = '#b8a89a';
        btnB.style.border = '1px solid rgba(255,220,170,.08)';
      } else {
        btnB.style.background = '#e8a04a';
        btnB.style.color = '#0f0d0a';
        btnB.style.border = 'none';
        btnA.style.background = 'transparent';
        btnA.style.color = '#b8a89a';
        btnA.style.border = '1px solid rgba(255,220,170,.08)';
      }
      this.renderQuestoes();
    },

    carregarMaterias() {
      const select = document.getElementById('ex-materia');
      if (!select) return;
      const turmaId = getTurmaId();
      select.innerHTML = '<option value="">Nenhuma matéria</option>';
      if (!turmaId) return;
      const materias = window._localMaterias?.[turmaId] || [];
      materias.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = `${m.icon} ${m.name}`;
        select.appendChild(opt);
      });
    },

    renderQuestoes() {
      const container = document.getElementById('ex-questoes-container');
      if (!container) return;
      container.innerHTML = '';
      for (let i = 0; i < this.numQuestoes; i++) {
        const div = document.createElement('div');
        div.className = 'ex-questao-item';
        div.dataset.q = i;
        div.style.cssText = 'background:var(--bg-3, #252018);border:1px solid rgba(255,220,170,.08);border-radius:14px;padding:16px;margin-bottom:12px;';
        let altHtml = '';
        if (this.tipo === 'alternativa') {
          altHtml = `<div class="ex-alternativas-container" style="margin-top:10px;">
            ${['a','b','c','d'].map(alt => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
              <input type="radio" name="alt-correta-${i}" value="${alt}" ${alt === 'a' ? 'checked' : ''} style="accent-color:#e8a04a;">
              <input class="ex-alt-text" data-alt="${alt}" data-q="${i}" placeholder="Alternativa ${alt.toUpperCase()}" style="flex:1;background:#1c1914;border:1px solid rgba(255,220,170,.08);border-radius:8px;padding:10px 12px;font-size:13px;color:#f0e8de;outline:none;" />
            </div>`).join('')}
            <div style="font-size:11px;color:#7a7065;">Selecione o círculo da alternativa correta</div>
          </div>`;
        }
        div.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <span style="font-weight:600;color:#b8a89a;">Questão ${i + 1}</span>
            ${this.numQuestoes > 1 ? `<button onclick="ExerciciosModule.removerQuestao(${i})" style="background:none;border:none;color:#7a7065;cursor:pointer;font-size:16px;">✕</button>` : ''}
          </div>
          <textarea class="ex-questao-enunciado" placeholder="Enunciado da questão..." style="width:100%;min-height:80px;background:#1c1914;border:1px solid rgba(255,220,170,.08);border-radius:10px;padding:12px;font-size:13.5px;color:#f0e8de;outline:none;resize:vertical;line-height:1.6;font-family:inherit;margin-bottom:12px;"></textarea>
          ${altHtml}`;
        container.appendChild(div);
      }
    },

    adicionarQuestao() { this.numQuestoes++; this.renderQuestoes(); },
    removerQuestao(index) { if (this.numQuestoes > 1) { this.numQuestoes--; this.renderQuestoes(); } },

    onPdfChange(e) {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) { this._showErr('PDF muito grande (máx 10 MB).'); return; }
      this.pdfFile = file;
      const reader = new FileReader();
      reader.onload = (ev) => { this.pdfData = ev.target.result; };
      reader.readAsDataURL(file);
      document.getElementById('ex-pdf-name').textContent = file.name;
      document.getElementById('ex-pdf-size').textContent = this._formatSize(file.size);
      document.getElementById('ex-pdf-preview').style.display = 'flex';
      document.getElementById('ex-pdf-dropzone').style.display = 'none';
    },

    clearPdf() {
      this.pdfFile = null;
      this.pdfData = null;
      document.getElementById('ex-pdf-input').value = '';
      document.getElementById('ex-pdf-preview').style.display = 'none';
      document.getElementById('ex-pdf-dropzone').style.display = 'block';
    },

    _formatSize(bytes) { return bytes < 1024 * 1024 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / (1024 * 1024)).toFixed(1) + ' MB'; },
    _showErr(msg) { const el = document.getElementById('ex-err'); if (el) { el.textContent = msg; el.style.display = 'block'; } },

    salvar() {
      const titulo = document.getElementById('ex-titulo')?.value.trim();
      if (!titulo) { this._showErr('Digite o título do exercício.'); return; }
      const turmaId = getTurmaId();
      if (!turmaId) { this._showErr('Turma não identificada.'); return; }
      const questoes = [];
      const questaoEls = document.querySelectorAll('.ex-questao-item');
      let hasError = false;
      questaoEls.forEach((el, i) => {
        const enunciado = el.querySelector('.ex-questao-enunciado')?.value.trim();
        if (!enunciado) { this._showErr(`Preencha o enunciado da questão ${i + 1}.`); hasError = true; return; }
        const questao = { id: 'q_' + Date.now() + '_' + i, enunciado, alternativas: [] };
        if (this.tipo === 'alternativa') {
          const correta = el.querySelector(`input[name="alt-correta-${i}"]:checked`)?.value;
          ['a','b','c','d'].forEach(alt => {
            const text = el.querySelector(`.ex-alt-text[data-alt="${alt}"]`)?.value.trim();
            if (text) questao.alternativas.push({ id: alt, texto: text, correta: alt === correta });
          });
          if (questao.alternativas.length < 2) { this._showErr(`Questão ${i + 1}: precisa de pelo menos 2 alternativas.`); hasError = true; }
        }
        questoes.push(questao);
      });
      if (hasError) return;
      const exercicio = {
        id: 'ex_' + Date.now(),
        titulo,
        tipo: this.tipo,
        materiaId: document.getElementById('ex-materia')?.value || null,
        dataEntrega: document.getElementById('ex-data-entrega')?.value || null,
        pdfFile: this.pdfFile?.name || null,
        pdfData: this.pdfData,
        questoes,
        createdAt: new Date().toISOString(),
        status: 'ativo',
      };
      let exercicios = getTurmaData('exercicios') || [];
      exercicios.push(exercicio);
      setTurmaData('exercicios', exercicios);
      this.fechar();
      toast('Exercício publicado!', 'success');
      TurmasUI.renderTabContent('exercicios');
    },

    renderLista(exercicios) {
      if (!exercicios || !exercicios.length) {
        return '<div class="turma-empty"><div class="turma-empty-icon">📝</div><div>Nenhum exercício criado ainda.</div></div>';
      }
      const tipoIcons = { alternativa: '☑️', dissertativa: '✏️' };
      return '<div class="exercicios-list">' + exercicios.map(ex => `
        <div class="exercicio-card" onclick="ExerciciosModule.abrirDetalhe('${ex.id}')" style="background:var(--bg-2, #1c1914);border:1px solid rgba(255,220,170,.08);border-radius:14px;padding:18px;cursor:pointer;transition:all .2s;margin-bottom:12px;" onmouseover="this.style.borderColor='rgba(232,160,74,.3)'" onmouseout="this.style.borderColor='rgba(255,220,170,.08)'">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <span style="font-size:20px;">${tipoIcons[ex.tipo]}</span>
            <span style="flex:1;font-size:15px;font-weight:700;color:#f0e8de;">${esc(ex.titulo)}</span>
            ${ex.status === 'encerrado' ? '<span style="background:#c0392b;color:#fff;padding:3px 8px;border-radius:100px;font-size:10px;font-weight:700;">Encerrado</span>' : ''}
          </div>
          <div style="display:flex;gap:14px;font-size:12px;color:#7a7065;margin-bottom:8px;">
            <span>📋 ${ex.questoes.length} questão(ões)</span>
            ${ex.dataEntrega ? `<span>📅 Entrega: ${new Date(ex.dataEntrega).toLocaleDateString('pt-BR')}</span>` : ''}
            ${ex.pdfFile ? '<span>📄 PDF</span>' : ''}
          </div>
          <div style="font-size:11px;color:#7a7065;text-align:right;">📅 ${new Date(ex.createdAt).toLocaleDateString('pt-BR')}</div>
        </div>
      `).join('') + '</div>';
    },

    abrirDetalhe(exId) {
      const turmaId = getTurmaId();
      if (!turmaId) return;
      const exercicios = getTurmaData('exercicios') || [];
      const ex = exercicios.find(e => e.id === exId);
      if (!ex) return;
      const isProfessor = (typeof App !== 'undefined' && App.state?.user?.role) === 'professor';
      const tipoIcons = { alternativa: '☑️', dissertativa: '✏️' };
      let modal = document.getElementById('modal-view-exercicio');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-view-exercicio';
        modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:210;align-items:center;justify-content:center;padding:16px;overflow-y:auto;';
        document.body.appendChild(modal);
      }
      let questoesHtml = ex.questoes.map((q, i) => `
        <div style="background:var(--bg-3, #252018);border:1px solid rgba(255,220,170,.08);border-radius:14px;padding:20px;margin-bottom:16px;">
          <div style="font-weight:600;color:#b8a89a;margin-bottom:10px;">Questão ${i + 1}</div>
          <div style="font-size:14px;color:#f0e8de;line-height:1.7;margin-bottom:14px;white-space:pre-wrap;">${esc(q.enunciado)}</div>
          ${ex.tipo === 'alternativa' && q.alternativas.length ? `
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${q.alternativas.map(a => `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#1c1914;border:1px solid rgba(255,220,170,.08);border-radius:8px;">
              <span style="font-weight:600;color:${a.correta ? '#7a9e7e' : '#7a7065'};width:20px;">${a.id.toUpperCase()}</span>
              <span style="flex:1;color:#f0e8de;">${esc(a.texto)}</span>
              ${a.correta ? '<span style="color:#7a9e7e;font-size:12px;">✓ Correta</span>' : ''}
            </div>`).join('')}
          </div>` : ''}
        </div>
      `).join('');
      const respostas = _localData.respostas?.[exId] || [];
      let respostasHtml = '';
      if (isProfessor && respostas.length) {
        respostasHtml = `<div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,220,170,.08);">
          <h4 style="font-size:16px;color:#f0e8de;margin-bottom:14px;">📬 Respostas Recebidas (${respostas.length})</h4>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${respostas.map(r => `<div style="background:var(--bg-3, #252018);border:1px solid rgba(255,220,170,.08);border-radius:10px;padding:14px;">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="font-weight:600;color:#b8a89a;">👤 ${esc(r.autor)}</span>
                <span style="font-size:11px;color:#7a7065;">${new Date(r.createdAt).toLocaleString('pt-BR')}</span>
              </div>
              ${ex.tipo === 'dissertativa' ? `<div style="font-size:13px;color:#f0e8de;white-space:pre-wrap;">${esc(r.respostaTexto)}</div>` : `<div style="font-size:13px;color:#f0e8de;">Resposta: <strong>${r.respostaAlternativa?.toUpperCase() || 'Não respondida'}</strong></div>`}
            </div>`).join('')}
          </div>
        </div>`;
      }
      modal.innerHTML = `<div style="background:var(--bg-2, #1c1914);border:1px solid rgba(255,220,170,.15);border-radius:22px;padding:32px;width:100%;max-width:600px;position:relative;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.7);">
        <button onclick="document.getElementById('modal-view-exercicio').style.display='none'" style="position:absolute;top:16px;right:16px;background:none;border:none;color:#b8a89a;cursor:pointer;font-size:20px;z-index:1;">✕</button>
        <div style="margin-bottom:20px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span style="font-size:20px;">${tipoIcons[ex.tipo]}</span>
            <h2 style="font-family:'DM Serif Display',serif;font-size:22px;color:#f0e8de;flex:1;margin:0;">${esc(ex.titulo)}</h2>
          </div>
          <div style="display:flex;gap:12px;font-size:12px;color:#7a7065;flex-wrap:wrap;">
            <span>📋 ${ex.questoes.length} questão(ões)</span>
            ${ex.dataEntrega ? `<span>📅 Entrega: ${new Date(ex.dataEntrega).toLocaleDateString('pt-BR')}</span>` : ''}
            ${ex.pdfFile ? `<button onclick="ExerciciosModule.baixarPdf('${ex.id}')" style="background:#e8a04a;color:#0f0d0a;border:none;padding:4px 10px;border-radius:6px;font-size:11px;cursor:pointer;">📄 Baixar PDF</button>` : ''}
          </div>
        </div>
        ${questoesHtml}
        ${respostasHtml}
        ${!isProfessor ? `<div style="margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,220,170,.08);">
          <h4 style="font-size:16px;color:#f0e8de;margin-bottom:14px;">Sua Resposta</h4>
          ${ex.tipo === 'alternativa' ? `<div style="display:flex;flex-wrap:wrap;gap:10px;">
            ${['a','b','c','d'].map(alt => `<button onclick="ExerciciosModule.enviarResposta('${ex.id}','${alt}')" style="padding:12px 20px;background:var(--bg-3, #252018);border:1px solid rgba(255,220,170,.08);border-radius:10px;font-size:14px;font-weight:600;color:#f0e8de;cursor:pointer;">${alt.toUpperCase()}</button>`).join('')}
          </div>` : `<div>
            <textarea id="ex-resposta-texto" placeholder="Digite sua resposta..." style="width:100%;min-height:120px;background:var(--bg-3, #252018);border:1px solid rgba(255,220,170,.08);border-radius:12px;padding:14px;font-size:14px;color:#f0e8de;outline:none;resize:vertical;line-height:1.6;margin-bottom:12px;"></textarea>
            <button onclick="ExerciciosModule.enviarRespostaTexto('${ex.id}')" style="padding:12px 24px;background:#e8a04a;color:#0f0d0a;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">📤 Enviar Resposta</button>
          </div>`}
        </div>` : ''}
      </div>`;
      modal.style.display = 'flex';
    },

    enviarResposta(exId, alternativa) {
      const user = (typeof App !== 'undefined' && App.state?.user) || {};
      if (!_localData.respostas[exId]) _localData.respostas[exId] = [];
      _localData.respostas[exId].push({
        autor: user.username || 'Aluno',
        autorId: user.id,
        respostaAlternativa: alternativa,
        createdAt: new Date().toISOString(),
      });
      toast('Resposta enviada!', 'success');
      this.abrirDetalhe(exId);
    },

    enviarRespostaTexto(exId) {
      const resposta = document.getElementById('ex-resposta-texto')?.value.trim();
      if (!resposta) { toast('Digite sua resposta.', 'error'); return; }
      const user = (typeof App !== 'undefined' && App.state?.user) || {};
      if (!_localData.respostas[exId]) _localData.respostas[exId] = [];
      _localData.respostas[exId].push({
        autor: user.username || 'Aluno',
        autorId: user.id,
        respostaTexto: resposta,
        createdAt: new Date().toISOString(),
      });
      toast('Resposta enviada!', 'success');
      this.abrirDetalhe(exId);
    },

    baixarPdf(exId) {
      const turmaId = getTurmaId();
      if (!turmaId) return;
      const exercicios = getTurmaData('exercicios') || [];
      const ex = exercicios.find(e => e.id === exId);
      if (!ex?.pdfData) return;
      const link = document.createElement('a');
      link.href = ex.pdfData;
      link.download = ex.pdfFile || 'exercicio.pdf';
      link.click();
    }
  };

  window.VideoModule = {
    tab: 'link',
    galleryFile: null,
    galleryData: null,
    recordedBlob: null,
    recordedData: null,
    timerInterval: null,
    recordingTime: 0,

    abrir() {
      let modal = document.getElementById('modal-add-video-v2');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-add-video-v2';
        modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:200;align-items:center;justify-content:center;padding:16px;';
        modal.innerHTML = this.getModalHTML();
        document.body.appendChild(modal);
      }
      this.tab = 'link';
      this.galleryFile = null;
      this.galleryData = null;
      this.recordedBlob = null;
      this.recordedData = null;
      this.recordingTime = 0;
      ['vid-titulo', 'vid-desc', 'vid-url'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
      document.getElementById('vid-gallery-preview') && (document.getElementById('vid-gallery-preview').style.display = 'none');
      document.getElementById('vid-gallery-dropzone') && (document.getElementById('vid-gallery-dropzone').style.display = 'block');
      document.getElementById('vid-record-preview') && (document.getElementById('vid-record-preview').style.display = 'none');
      document.getElementById('vid-preview') && (document.getElementById('vid-preview').style.display = 'none');
      document.getElementById('vid-rec-status') && (document.getElementById('vid-rec-status').textContent = 'Clique em "Iniciar Gravação"');
      document.getElementById('vid-rec-timer') && (document.getElementById('vid-rec-timer').style.display = 'none');
      document.getElementById('vid-btn-start-record') && (document.getElementById('vid-btn-start-record').style.display = 'inline-block');
      document.getElementById('vid-btn-stop-record') && (document.getElementById('vid-btn-stop-record').style.display = 'none');
      document.getElementById('vid-err') && (document.getElementById('vid-err').style.display = 'none');
      this.setTab('link');
      modal.style.display = 'flex';
      setTimeout(() => document.getElementById('vid-titulo')?.focus(), 80);
    },

    getModalHTML() {
      return `<div style="background:var(--bg-2, #1c1914);border:1px solid rgba(255,220,170,.15);border-radius:22px;padding:32px;width:100%;max-width:520px;position:relative;max-height:92vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.7);">
        <button onclick="VideoModule.fechar()" style="position:absolute;top:16px;right:16px;background:none;border:none;color:#b8a89a;cursor:pointer;font-size:20px;line-height:1;">✕</button>
        <div style="margin-bottom:24px;">
          <div style="font-family:monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#e8a04a;margin-bottom:6px;">🎬 Nova Video-Aula</div>
          <h3 style="font-family:'DM Serif Display',serif;font-size:26px;color:#f0e8de;margin:0;">Adicionar Vídeo</h3>
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#b8a89a;display:block;margin-bottom:6px;">Título</label>
          <input id="vid-titulo" placeholder="Ex.: Aula 1 - Introdução" style="width:100%;background:var(--bg-3, #252018);border:1px solid rgba(255,220,170,.08);border-radius:12px;padding:12px 14px;font-size:14.5px;color:#f0e8de;outline:none;font-family:inherit;" />
        </div>
        <div style="margin-bottom:20px;">
          <label style="font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#b8a89a;display:block;margin-bottom:6px;">Descrição (opcional)</label>
          <input id="vid-desc" placeholder="Sobre este vídeo..." style="width:100%;background:var(--bg-3, #252018);border:1px solid rgba(255,220,170,.08);border-radius:12px;padding:12px 14px;font-size:14px;color:#f0e8de;outline:none;font-family:inherit;" />
        </div>
        <div style="display:flex;gap:6px;margin-bottom:20px;background:var(--bg-3, #252018);border:1px solid rgba(255,220,170,.08);border-radius:12px;padding:4px;">
          <button id="vid-tab-link" onclick="VideoModule.setTab('link')" style="flex:1;padding:9px;border:none;border-radius:9px;background:#e8a04a;color:#0f0d0a;font-weight:600;font-size:12px;cursor:pointer;">🔗 Link</button>
          <button id="vid-tab-gallery" onclick="VideoModule.setTab('gallery')" style="flex:1;padding:9px;border:none;border-radius:9px;background:transparent;color:#b8a89a;font-size:12px;cursor:pointer;">📁 Galeria</button>
          <button id="vid-tab-record" onclick="VideoModule.setTab('record')" style="flex:1;padding:9px;border:none;border-radius:9px;background:transparent;color:#b8a89a;font-size:12px;cursor:pointer;">🎥 Gravar</button>
        </div>
        <div id="vid-panel-link">
          <label style="font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#b8a89a;display:block;margin-bottom:8px;">URL do vídeo</label>
          <input id="vid-url" placeholder="https:
        </div>
        <div id="vid-panel-gallery" style="display:none;">
          <div id="vid-gallery-dropzone" onclick="document.getElementById('vid-gallery-input').click()" style="border:2px dashed rgba(232,160,74,.3);border-radius:14px;padding:32px 24px;text-align:center;cursor:pointer;margin-bottom:12px;">
            <div style="font-size:32px;margin-bottom:8px;">🎬</div>
            <div style="font-size:14px;color:#b8a89a;font-weight:500;">Clique ou arraste o vídeo aqui</div>
            <div style="font-size:12px;color:#7a7065;margin-top:4px;">MP4, MOV, AVI, WEBM (máx 500 MB)</div>
          </div>
          <input type="file" id="vid-gallery-input" accept="video/*" style="display:none;" onchange="VideoModule.onGalleryChange(event)" />
          <div id="vid-gallery-preview" style="display:none;background:var(--bg-3, #252018);border:1px solid rgba(255,220,170,.08);border-radius:12px;padding:14px 16px;align-items:center;gap:12px;">
            <div style="font-size:28px;">🎬</div>
            <div style="flex:1;"><div id="vid-gallery-name" style="font-size:14px;color:#f0e8de;font-weight:500;"></div><div id="vid-gallery-size" style="font-size:12px;color:#7a7065;"></div></div>
            <button onclick="VideoModule.clearGallery()" style="background:none;border:none;color:#b8a89a;cursor:pointer;font-size:16px;">✕</button>
          </div>
        </div>
        <div id="vid-panel-record" style="display:none;">
          <div style="background:var(--bg-3, #252018);border:1px solid rgba(255,220,170,.08);border-radius:14px;padding:20px;text-align:center;margin-bottom:12px;">
            <video id="vid-preview" autoplay muted playsinline style="width:100%;max-height:200px;border-radius:10px;background:#000;display:none;margin-bottom:12px;"></video>
            <div id="vid-rec-status" style="font-size:14px;color:#7a7065;margin-bottom:12px;">Clique em "Iniciar Gravação"</div>
            <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
              <button id="vid-btn-start-record" onclick="VideoModule.startRecording()" style="padding:10px 20px;background:#e8a04a;color:#0f0d0a;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;">⏺ Iniciar</button>
              <button id="vid-btn-stop-record" onclick="VideoModule.stopRecording()" style="display:none;padding:10px 20px;background:#c0392b;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;">⏹ Parar</button>
            </div>
            <div id="vid-rec-timer" style="font-size:24px;font-family:monospace;color:#e8a04a;margin-top:12px;display:none;">00:00</div>
          </div>
          <div id="vid-record-preview" style="display:none;background:var(--bg-3, #252018);border:1px solid rgba(255,220,170,.08);border-radius:12px;padding:14px 16px;align-items:center;gap:12px;">
            <div style="font-size:28px;">✅</div>
            <div style="flex:1;"><div style="font-size:14px;color:#f0e8de;font-weight:500;">Vídeo gravado</div><div id="vid-record-size" style="font-size:12px;color:#7a7065;"></div></div>
            <button onclick="VideoModule.clearRecording()" style="background:none;border:none;color:#b8a89a;cursor:pointer;font-size:16px;">✕</button>
          </div>
        </div>
        <div id="vid-err" style="color:#e07060;font-size:13px;margin-top:14px;text-align:center;display:none;background:rgba(192,57,43,.1);border-radius:10px;padding:10px;"></div>
        <button onclick="VideoModule.salvar()" style="width:100%;margin-top:20px;padding:14px;background:#e8a04a;color:#0f0d0a;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;">Publicar Vídeo</button>
      </div>`;
    },

    fechar() {
      const modal = document.getElementById('modal-add-video-v2');
      if (modal) modal.style.display = 'none';
      this.stopRecording();
    },

    setTab(tab) {
      this.tab = tab;
      ['link', 'gallery', 'record'].forEach(t => {
        const panel = document.getElementById(`vid-panel-${t}`);
        const btn = document.getElementById(`vid-tab-${t}`);
        if (panel) panel.style.display = t === tab ? 'block' : 'none';
        if (btn) {
          btn.style.background = t === tab ? '#e8a04a' : 'transparent';
          btn.style.color = t === tab ? '#0f0d0a' : '#b8a89a';
          btn.style.fontWeight = t === tab ? '600' : '400';
        }
      });
    },

    onGalleryChange(e) {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 500 * 1024 * 1024) { this._showErr('Arquivo muito grande (máx 500 MB).'); return; }
      this.galleryFile = file;
      const reader = new FileReader();
      reader.onload = (ev) => { this.galleryData = ev.target.result; };
      reader.readAsDataURL(file);
      document.getElementById('vid-gallery-name').textContent = file.name;
      document.getElementById('vid-gallery-size').textContent = this._formatSize(file.size);
      document.getElementById('vid-gallery-preview').style.display = 'flex';
      document.getElementById('vid-gallery-dropzone').style.display = 'none';
    },

    clearGallery() {
      this.galleryFile = null;
      this.galleryData = null;
      document.getElementById('vid-gallery-input').value = '';
      document.getElementById('vid-gallery-preview').style.display = 'none';
      document.getElementById('vid-gallery-dropzone').style.display = 'block';
    },

    async startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const video = document.getElementById('vid-preview');
        video.srcObject = stream;
        video.style.display = 'block';
        this.recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        const chunks = [];
        this.recorder.ondataavailable = (e) => chunks.push(e.data);
        this.recorder.onstop = () => {
          this.recordedBlob = new Blob(chunks, { type: 'video/webm' });
          const reader = new FileReader();
          reader.onload = (e) => { this.recordedData = e.target.result; };
          reader.readAsDataURL(this.recordedBlob);
          document.getElementById('vid-record-size').textContent = this._formatSize(this.recordedBlob.size);
          document.getElementById('vid-record-preview').style.display = 'flex';
          document.getElementById('vid-rec-status').textContent = 'Gravação concluída!';
        };
        this.recorder.start();
        this.recordingTime = 0;
        document.getElementById('vid-btn-start-record').style.display = 'none';
        document.getElementById('vid-btn-stop-record').style.display = 'inline-block';
        document.getElementById('vid-rec-status').textContent = 'Gravando...';
        this.timerInterval = setInterval(() => {
          this.recordingTime++;
          const m = Math.floor(this.recordingTime / 60).toString().padStart(2, '0');
          const s = (this.recordingTime % 60).toString().padStart(2, '0');
          document.getElementById('vid-rec-timer').textContent = `${m}:${s}`;
          document.getElementById('vid-rec-timer').style.display = 'block';
        }, 1000);
      } catch (err) { toast('Erro ao acessar câmera/microfone.', 'error'); }
    },

    stopRecording() {
      if (this.recorder && this.recorder.state === 'recording') {
        this.recorder.stop();
        this.recorder.stream.getTracks().forEach(t => t.stop());
        clearInterval(this.timerInterval);
        document.getElementById('vid-btn-start-record') && (document.getElementById('vid-btn-start-record').style.display = 'inline-block');
        document.getElementById('vid-btn-stop-record') && (document.getElementById('vid-btn-stop-record').style.display = 'none');
        document.getElementById('vid-preview') && (document.getElementById('vid-preview').style.display = 'none');
      }
    },

    clearRecording() {
      this.recordedBlob = null;
      this.recordedData = null;
      this.recordingTime = 0;
      document.getElementById('vid-record-preview') && (document.getElementById('vid-record-preview').style.display = 'none');
      document.getElementById('vid-rec-timer') && (document.getElementById('vid-rec-timer').style.display = 'none');
      document.getElementById('vid-rec-status') && (document.getElementById('vid-rec-status').textContent = 'Clique em "Iniciar Gravação"');
    },

    _formatSize(bytes) { return bytes < 1024 * 1024 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / (1024 * 1024)).toFixed(1) + ' MB'; },
    _showErr(msg) { const el = document.getElementById('vid-err'); if (el) { el.textContent = msg; el.style.display = 'block'; } },

    salvar() {
      const titulo = document.getElementById('vid-titulo')?.value.trim();
      if (!titulo) { this._showErr('Digite o título.'); return; }
      const turmaId = getTurmaId();
      if (!turmaId) { this._showErr('Turma não identificada.'); return; }
      const video = { id: 'vid_' + Date.now(), titulo, desc: document.getElementById('vid-desc')?.value.trim() || '', createdAt: new Date().toISOString() };
      if (this.tab === 'link') {
        const url = document.getElementById('vid-url')?.value.trim();
        if (!url) { this._showErr('Digite a URL.'); return; }
        video.tipo = 'link';
        video.url = url;
      } else if (this.tab === 'gallery') {
        if (!this.galleryFile) { this._showErr('Selecione um vídeo.'); return; }
        video.tipo = 'upload';
        video.nome = this.galleryFile.name;
        video.data = this.galleryData;
      } else {
        if (!this.recordedBlob) { this._showErr('Grave um vídeo primeiro.'); return; }
        video.tipo = 'record';
        video.data = this.recordedData;
      }
      let videos = getTurmaData('videos') || [];
      videos.push(video);
      setTurmaData('videos', videos);
      this.fechar();
      toast('Vídeo publicado!', 'success');
      TurmasUI.renderTabContent('videos');
    }
  };

  window.TurmasUI = {
    currentTab: 'avisos',

    renderTabs() {
      
      if (typeof ExSys !== 'undefined') return '';
      
      return `<div style="display:flex;gap:6px;margin-bottom:20px;background:var(--bg-3, #252018);border:1px solid rgba(255,220,170,.08);border-radius:14px;padding:4px;">
        <button onclick="TurmasUI.renderTabContent('avisos')" id="tab-btn-avisos" style="flex:1;padding:10px;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;background:#e8a04a;color:#0f0d0a;">📧 Avisos</button>
        <button onclick="TurmasUI.renderTabContent('exercicios')" id="tab-btn-exercicios" style="flex:1;padding:10px;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;background:transparent;color:#b8a89a;">📝 Exercícios</button>
        <button onclick="TurmasUI.renderTabContent('videos')" id="tab-btn-videos" style="flex:1;padding:10px;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;background:transparent;color:#b8a89a;">🎬 Vídeos</button>
        <button onclick="TurmasUI.renderTabContent('materias')" id="tab-btn-materias" style="flex:1;padding:10px;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;background:transparent;color:#b8a89a;">📚 Matérias</button>
      </div><div id="turma-tab-content"></div>`;
    },

    renderTabContent(tab) {
      if (tab) this.currentTab = tab;
      const content = document.getElementById('turma-tab-content');
      if (!content) return;
      const isProfessor = (typeof App !== 'undefined' && App.state?.user?.role) === 'professor';
      let html = '';
      switch (this.currentTab) {
        case 'avisos':
          html = (isProfessor ? '<button onclick="AvisosModule.abrir()" style="width:100%;padding:14px;background:#e8a04a;color:#0f0d0a;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:16px;">📧 Novo Aviso</button>' : '') + AvisosModule.renderLista(getTurmaData('avisos'));
          break;
        case 'exercicios':
          html = (isProfessor ? '<button onclick="ExerciciosModule.abrir()" style="width:100%;padding:14px;background:#e8a04a;color:#0f0d0a;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:16px;">📝 Criar Exercício</button>' : '') + ExerciciosModule.renderLista(getTurmaData('exercicios'));
          break;
        case 'videos':
          html = (isProfessor ? '<button onclick="VideoModule.abrir()" style="width:100%;padding:14px;background:#e8a04a;color:#0f0d0a;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:16px;">🎬 Adicionar Vídeo</button>' : '') + this.renderVideos(getTurmaData('videos'));
          break;
        case 'materias':
          const turmaId = getTurmaId();
          if (turmaId) {
            const materias = window._localMaterias?.[turmaId] || [];
            html = materias.length ? '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;">' + materias.map(m => `<div style="background:var(--bg-2, #1c1914);border:1px solid rgba(255,220,170,.08);border-radius:14px;padding:18px;cursor:pointer;" onclick="MateriaModal.abrirMateria('${m.id}')"><div style="font-size:36px;margin-bottom:12px;">${m.icon}</div><div style="font-size:15px;font-weight:600;color:#f0e8de;">${esc(m.name)}</div></div>`).join('') + '</div>' : '<div class="turma-empty"><div class="turma-empty-icon">📚</div><div>Nenhuma matéria cadastrada.</div></div>';
          }
          break;
      }

      ['avisos', 'exercicios', 'videos', 'materias'].forEach(t => {
        const btn = document.getElementById(`tab-btn-${t}`);
        if (btn) {
          btn.style.background = t === this.currentTab ? '#e8a04a' : 'transparent';
          btn.style.color = t === this.currentTab ? '#0f0d0a' : '#b8a89a';
        }
      });
      content.innerHTML = html;
    },

    renderVideos(videos) {
      if (!videos || !videos.length) return '<div class="turma-empty"><div class="turma-empty-icon">🎬</div><div>Nenhum vídeo adicionado.</div></div>';
      return '<div style="display:flex;flex-direction:column;gap:12px;">' + videos.map(v => `
        <div style="background:var(--bg-2, #1c1914);border:1px solid rgba(255,220,170,.08);border-radius:14px;padding:16px;cursor:pointer;transition:all .2s;" onmouseover="this.style.borderColor='rgba(232,160,74,.3)'" onmouseout="this.style.borderColor='rgba(255,220,170,.08)'" onclick="TurmasUI.abrirVideo('${v.id}')">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:48px;height:48px;background:var(--bg-3, #252018);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:24px;">${v.tipo === 'link' ? '🔗' : '🎬'}</div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:14px;font-weight:500;color:#f0e8de;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(v.titulo)}</div>
              ${v.desc ? `<div style="font-size:12px;color:#7a7065;margin-top:2px;">${esc(v.desc)}</div>` : ''}
              <div style="font-size:11px;color:#7a7065;margin-top:4px;">${v.tipo === 'link' ? 'Link externo' : v.nome || 'Vídeo enviado'}</div>
            </div>
          </div>
        </div>
      `).join('') + '</div>';
    },

    abrirVideo(videoId) {
      const turmaId = getTurmaId();
      if (!turmaId) return;
      const videos = getTurmaData('videos') || [];
      const video = videos.find(v => v.id === videoId);
      if (!video) return;
      let modal = document.getElementById('modal-view-video');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-view-video';
        modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:210;align-items:center;justify-content:center;padding:16px;';
        document.body.appendChild(modal);
      }
      let videoContent = '';
      if (video.tipo === 'link') {
        const match = video.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?]+)/);
        if (match) {
          videoContent = `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${match[1]}" frameborder="0" allowfullscreen style="border-radius:12px;"></iframe>`;
        } else {
          videoContent = `<a href="${esc(video.url)}" target="_blank" style="display:block;padding:20px;background:var(--bg-3, #252018);border-radius:12px;text-align:center;color:#e8a04a;font-size:14px;">🔗 Abrir link do vídeo</a>`;
        }
      } else if (video.data) {
        videoContent = `<video src="${video.data}" controls style="width:100%;border-radius:12px;"></video>`;
      }
      modal.innerHTML = `<div style="background:var(--bg-2, #1c1914);border:1px solid rgba(255,220,170,.15);border-radius:22px;padding:32px;width:100%;max-width:700px;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.7);">
        <button onclick="document.getElementById('modal-view-video').style.display='none'" style="position:absolute;top:16px;right:16px;background:none;border:none;color:#b8a89a;cursor:pointer;font-size:20px;z-index:1;">✕</button>
        <h3 style="font-family:'DM Serif Display',serif;font-size:22px;color:#f0e8de;margin-bottom:8px;">${esc(video.titulo)}</h3>
        ${video.desc ? `<p style="font-size:13px;color:#7a7065;margin-bottom:16px;">${esc(video.desc)}</p>` : ''}
        ${videoContent}
        <div style="font-size:11px;color:#7a7065;margin-top:12px;text-align:right;">📅 ${new Date(video.createdAt).toLocaleString('pt-BR')}</div>
      </div>`;
      modal.style.display = 'flex';
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (typeof App !== 'undefined') {
      App.openAddVideoModal = function() { VideoModule.abrir(); };
      const origAbrirTurma = App.abrirTurma;
      App.abrirTurma = function(turmaId) {
     
        if (typeof ExSys !== 'undefined') return origAbrirTurma.call(this, turmaId);
        
        if (origAbrirTurma) origAbrirTurma.call(this, turmaId);
        const container = document.getElementById('turma-detail-content');
        if (container) {
          container.innerHTML = TurmasUI.renderTabs();
          TurmasUI.renderTabContent();
        }
      };
    }
  });

  const css = document.createElement('style');
  css.textContent = `
    .turma-empty { text-align:center;padding:48px 24px;background:var(--bg-2, #1c1914);border:1px dashed rgba(255,220,170,.15);border-radius:16px; }
    .turma-empty-icon { font-size:48px;margin-bottom:12px;opacity:0.6; }
    .turma-empty > div { color:#7a7065;font-size:14px; }
    .avisos-list, .exercicios-list { display:flex;flex-direction:column;gap:12px; }
    .aviso-card, .exercicio-card { background:var(--bg-2, #1c1914);border:1px solid rgba(255,220,170,.08);border-radius:14px;padding:18px 20px;cursor:pointer;transition:all .2s; }
    .aviso-card:hover, .exercicio-card:hover { border-color:rgba(232,160,74,.3); }
    .aviso-card.nao-lida { border-left:4px solid #e8a04a;background:rgba(232,160,74,.05); }
    .aviso-card.lida { opacity:0.75; }
    .aviso-header, .exercicio-header { display:flex;align-items:center;gap:10px;margin-bottom:10px; }
    .aviso-assunto, .exercicio-titulo { flex:1;font-size:15px;font-weight:700;color:#f0e8de;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
    .aviso-badge-nova { background:#e8a04a;color:#0f0d0a;padding:3px 8px;border-radius:100px;font-size:10px;font-weight:700;text-transform:uppercase; }
    .aviso-preview { font-size:13px;color:#7a7065;line-height:1.5;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden; }
    .aviso-meta { display:flex;gap:16px;font-size:11px;color:#7a7065; }
    @media(max-width:768px) { .avisos-list, .exercicios-list { gap:10px; } .aviso-card, .exercicio-card { padding:14px 16px; } }
  `;
  document.head.appendChild(css);

  console.log('[AdvancedFeatures] ✅ Módulo carregado.');
})();