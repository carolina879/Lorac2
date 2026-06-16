(function patchStudySync() {
  'use strict';

  const EXT_ICONS = {
    pdf:  { icon: '📄', color: '#e07060', label: 'PDF' },
    pptx: { icon: '📊', color: '#c96a4a', label: 'PowerPoint' },
    ppt:  { icon: '📊', color: '#c96a4a', label: 'PowerPoint' },
    docx: { icon: '📝', color: '#7a9e7e', label: 'Word' },
    doc:  { icon: '📝', color: '#7a9e7e', label: 'Word' },
    xlsx: { icon: '📈', color: '#5c7a5f', label: 'Excel' },
    xls:  { icon: '📈', color: '#5c7a5f', label: 'Excel' },
    txt:  { icon: '📃', color: '#b8a89a', label: 'Texto' },
    mp4:  { icon: '🎬', color: '#a0c4e8', label: 'Vídeo' },
    mp3:  { icon: '🎵', color: '#c8a0e8', label: 'Áudio' },
    zip:  { icon: '🗜️', color: '#7a6e65', label: 'Arquivo' },
  };

  function extInfo(filename) {
    const ext = (filename || '').split('.').pop().toLowerCase();
    return EXT_ICONS[ext] || { icon: '📎', color: '#b8a89a', label: ext.toUpperCase() || 'Arquivo' };
  }

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function toast(msg, type = 'success') {
    if (typeof App !== 'undefined' && typeof App.toast === 'function') {
      App.toast(msg, type);
    } else {
      const t = document.createElement('div');
      t.textContent = msg;
      Object.assign(t.style, {
        position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
        background: type === 'error' ? '#c0392b' : '#e8a04a',
        color: '#0f0d0a', padding: '10px 20px', borderRadius: '12px',
        fontFamily: 'var(--font-body)', fontSize: '14px', zIndex: 9999,
        boxShadow: '0 4px 16px rgba(0,0,0,.5)'
      });
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 3000);
    }
  }

  const _localMaterias = {}; 

  function getTurmaMaterias() {
    const turmaId = _currentTurmaId();
    if (!turmaId) return [];
    if (!_localMaterias[turmaId]) _localMaterias[turmaId] = [];
    return _localMaterias[turmaId];
  }

  function _currentTurmaId() {
    try {
      const heroCode = document.querySelector('.turma-hero-code');
      if (!heroCode) return null;
      return window.__currentTurmaId__ || null;
    } catch { return null; }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (typeof App !== 'undefined') {
      const _origAbrirTurma = App.abrirTurma;
      App.abrirTurma = function (turmaId) {
        window.__currentTurmaId__ = turmaId;
        if (!_localMaterias[turmaId]) _localMaterias[turmaId] = [];
        return _origAbrirTurma.call(this, turmaId);
      };
    }
  });

  function getOrCreateModal() {
    let modal = document.getElementById('modal-add-materia-v2');
    if (modal) return modal;

    const html = `
<div id="modal-add-materia-v2"
     style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.78);
            z-index:1200;align-items:center;justify-content:center;padding:16px;">

  <div style="background:var(--bg-2);border:1px solid var(--border-warm);
              border-radius:22px;padding:32px;width:100%;max-width:520px;
              position:relative;max-height:92vh;overflow-y:auto;
              box-shadow:0 20px 60px rgba(0,0,0,.7);">

    <button onclick="MateriaModal.fechar()"
            style="position:absolute;top:16px;right:16px;background:none;
                   border:none;color:var(--text-3);cursor:pointer;font-size:20px;
                   line-height:1;transition:color .15s;"
            onmouseover="this.style.color='var(--text-0)'"
            onmouseout="this.style.color='var(--text-3)'">✕</button>

    <div style="margin-bottom:24px;">
      <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:.14em;
                  text-transform:uppercase;color:var(--accent);margin-bottom:6px;">
        Nova Matéria
      </div>
      <h3 style="font-family:var(--font-display);font-size:26px;color:var(--text-0);">
        Adicionar Conteúdo
      </h3>
    </div>

    <div style="display:flex;gap:10px;margin-bottom:16px;">
      <div style="flex:0 0 auto;">
        <label style="font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
                      color:var(--text-2);display:block;margin-bottom:6px;">Ícone</label>
        <div id="mat-icon-display"
             onclick="MateriaModal.toggleIconPicker()"
             style="width:48px;height:48px;background:var(--bg-3);border:1px solid var(--border);
                    border-radius:12px;display:flex;align-items:center;justify-content:center;
                    font-size:24px;cursor:pointer;transition:border-color .15s;"
             onmouseover="this.style.borderColor='var(--border-warm)'"
             onmouseout="this.style.borderColor='var(--border)'">📚</div>
      </div>
      <div style="flex:1;">
        <label style="font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
                      color:var(--text-2);display:block;margin-bottom:6px;">Nome da matéria</label>
        <input id="mat-nome"
               placeholder="Ex.: Matemática — Funções"
               style="width:100%;background:var(--bg-3);border:1px solid var(--border);
                      border-radius:12px;padding:12px 14px;font-size:14.5px;
                      color:var(--text-0);outline:none;transition:border-color .22s,box-shadow .22s;
                      font-family:var(--font-body);"
               onfocus="this.style.borderColor='var(--border-warm)';this.style.boxShadow='0 0 0 3px rgba(232,160,74,.1)'"
               onblur="this.style.borderColor='var(--border)';this.style.boxShadow='none'" />
      </div>
    </div>

    <div id="mat-emoji-picker" style="display:none;background:var(--bg-3);border:1px solid var(--border);
         border-radius:14px;padding:12px;margin-bottom:16px;flex-wrap:wrap;gap:6px;">
    </div>

    <div style="display:flex;gap:6px;margin-bottom:20px;background:var(--bg-3);
                border:1px solid var(--border);border-radius:12px;padding:4px;">
      <button id="mat-tab-arquivo" onclick="MateriaModal.setTab('arquivo')"
              style="flex:1;padding:9px 12px;border:none;border-radius:9px;
                     background:var(--accent);color:var(--bg-0);font-weight:600;
                     font-size:13px;cursor:pointer;transition:all .2s;font-family:var(--font-body);">
        📁 Enviar Arquivo
      </button>
      <button id="mat-tab-texto" onclick="MateriaModal.setTab('texto')"
              style="flex:1;padding:9px 12px;border:none;border-radius:9px;
                     background:transparent;color:var(--text-2);font-size:13px;
                     cursor:pointer;transition:all .2s;font-family:var(--font-body);">
        ✏️ Escrever Conteúdo
      </button>
    </div>

    <div id="mat-panel-arquivo">
      <label style="font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
                    color:var(--text-2);display:block;margin-bottom:8px;">
        Arquivo (PDF, PPTX, DOCX, XLSX, etc.)
      </label>

      <div id="mat-dropzone"
           onclick="document.getElementById('mat-file-input').click()"
           ondragover="MateriaModal.onDragOver(event)"
           ondragleave="MateriaModal.onDragLeave(event)"
           ondrop="MateriaModal.onDrop(event)"
           style="border:2px dashed rgba(232,160,74,.3);border-radius:14px;
                  padding:32px 24px;text-align:center;cursor:pointer;
                  transition:all .22s;margin-bottom:12px;">
        <div style="font-size:32px;margin-bottom:8px;">📂</div>
        <div style="font-size:14px;color:var(--text-1);font-weight:500;">
          Clique para selecionar ou arraste aqui
        </div>
        <div style="font-size:12px;color:var(--text-3);margin-top:4px;">
          PDF · PPTX · DOCX · XLSX · TXT · MP4 · MP3 · ZIP
        </div>
      </div>

      <input type="file" id="mat-file-input"
             accept=".pdf,.pptx,.ppt,.docx,.doc,.xlsx,.xls,.txt,.mp4,.mp3,.zip,.rar"
             style="display:none;"
             onchange="MateriaModal.onFileChange(event)" />

      <div id="mat-file-preview" style="display:none;background:var(--bg-3);
           border:1px solid var(--border);border-radius:12px;padding:14px 16px;
           align-items:center;gap:12px;">
        <div id="mat-file-icon" style="font-size:28px;">📎</div>
        <div style="flex:1;min-width:0;">
          <div id="mat-file-name" style="font-size:14px;color:var(--text-0);
               font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></div>
          <div id="mat-file-size" style="font-size:12px;color:var(--text-3);margin-top:2px;"></div>
        </div>
        <button onclick="MateriaModal.clearFile()"
                style="background:none;border:none;color:var(--text-3);cursor:pointer;
                       font-size:16px;padding:4px;transition:color .15s;"
                onmouseover="this.style.color='#e07060'"
                onmouseout="this.style.color='var(--text-3)'">✕</button>
      </div>

      <div style="margin-top:14px;">
        <label style="font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
                      color:var(--text-2);display:block;margin-bottom:6px;">
          Descrição (opcional)
        </label>
        <input id="mat-arquivo-desc"
               placeholder="Ex.: Apostila do capítulo 3..."
               style="width:100%;background:var(--bg-3);border:1px solid var(--border);
                      border-radius:12px;padding:11px 14px;font-size:14px;
                      color:var(--text-0);outline:none;transition:border-color .22s;
                      font-family:var(--font-body);"
               onfocus="this.style.borderColor='var(--border-warm)'"
               onblur="this.style.borderColor='var(--border)'" />
      </div>
    </div>

    <div id="mat-panel-texto" style="display:none;">
      <label style="font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
                    color:var(--text-2);display:block;margin-bottom:6px;">
        Conteúdo escrito
      </label>
      <textarea id="mat-texto-conteudo"
                placeholder="Digite aqui o conteúdo da aula, resumos, explicações..."
                style="width:100%;min-height:160px;background:var(--bg-3);
                       border:1px solid var(--border);border-radius:12px;
                       padding:14px;font-size:14px;color:var(--text-0);outline:none;
                       resize:vertical;transition:border-color .22s;line-height:1.7;
                       font-family:var(--font-body);"
                onfocus="this.style.borderColor='var(--border-warm)'"
                onblur="this.style.borderColor='var(--border)'"></textarea>
      <div style="font-size:11px;color:var(--text-3);margin-top:6px;text-align:right;"
           id="mat-texto-count">0 caracteres</div>
    </div>

    <div id="mat-err" style="color:#e07060;font-size:13px;margin-top:14px;
         text-align:center;display:none;background:rgba(192,57,43,.1);
         border-radius:10px;padding:10px;"></div>

    <button id="mat-btn-salvar" onclick="MateriaModal.salvar()"
            style="width:100%;margin-top:20px;padding:14px;background:var(--accent);
                   color:var(--bg-0);border:none;border-radius:12px;
                   font-size:15px;font-weight:700;cursor:pointer;
                   transition:opacity .2s,transform .15s;font-family:var(--font-body);"
            onmouseover="this.style.opacity='.9'"
            onmouseout="this.style.opacity='1'">
      Publicar Matéria
    </button>
  </div>
</div>`;

    document.body.insertAdjacentHTML('beforeend', html);
    modal = document.getElementById('modal-add-materia-v2');

    document.getElementById('mat-texto-conteudo')?.addEventListener('input', function () {
      const count = this.value.length;
      const el = document.getElementById('mat-texto-count');
      if (el) el.textContent = `${count} caractere${count !== 1 ? 's' : ''}`;
    });

    const emojis = ['📚','📖','📝','✏️','🔢','➗','📐','🔬','🧪','🧬','🌍','🗺️',
                    '🎨','🎭','🎵','🏛️','⚽','💻','🧮','📊','📈','🔭','💡','🧠'];
    const picker = document.getElementById('mat-emoji-picker');
    if (picker) {
      emojis.forEach(em => {
        const btn = document.createElement('button');
        btn.textContent = em;
        btn.style.cssText = 'background:none;border:none;font-size:22px;cursor:pointer;' +
          'padding:6px;border-radius:8px;transition:background .15s;';
        btn.onmouseover = () => btn.style.background = 'var(--bg-4)';
        btn.onmouseout  = () => btn.style.background = 'none';
        btn.onclick = () => {
          document.getElementById('mat-icon-display').textContent = em;
          MateriaModal.toggleIconPicker(false);
        };
        picker.appendChild(btn);
      });
    }

    return modal;
  }

  const _s = {
    tab: 'arquivo',
    file: null,
    fileData: null,
    pickerOpen: false,
  };

  window.MateriaModal = {
    _localMaterias,
    _renderMateriasTab,
    _formatSize,
    extInfo,

    abrir() {
      const modal = getOrCreateModal();

      _s.tab = 'arquivo';
      _s.file = null;
      _s.fileData = null;
      _s.pickerOpen = false;

      ['mat-nome', 'mat-arquivo-desc', 'mat-texto-conteudo'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });

      const countEl = document.getElementById('mat-texto-count');
      if (countEl) countEl.textContent = '0 caracteres';

      const errEl = document.getElementById('mat-err');
      if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }

      const iconDisplay = document.getElementById('mat-icon-display');
      if (iconDisplay) iconDisplay.textContent = '📚';

      const picker = document.getElementById('mat-emoji-picker');
      if (picker) picker.style.display = 'none';

      this.setTab('arquivo');
      this._clearFilePreview();

      modal.style.display = 'flex';
      setTimeout(() => document.getElementById('mat-nome')?.focus(), 80);
    },

    fechar() {
      const modal = document.getElementById('modal-add-materia-v2');
      if (modal) modal.style.display = 'none';
    },

    setTab(tab) {
      _s.tab = tab;
      const panels = { arquivo: 'mat-panel-arquivo', texto: 'mat-panel-texto' };
      const tabs   = { arquivo: 'mat-tab-arquivo',   texto: 'mat-tab-texto'   };

      Object.entries(panels).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (el) el.style.display = key === tab ? 'block' : 'none';
      });

      Object.entries(tabs).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (key === tab) {
          el.style.background = 'var(--accent)';
          el.style.color = 'var(--bg-0)';
          el.style.fontWeight = '600';
        } else {
          el.style.background = 'transparent';
          el.style.color = 'var(--text-2)';
          el.style.fontWeight = '400';
        }
      });
    },

    toggleIconPicker(force) {
      const picker = document.getElementById('mat-emoji-picker');
      if (!picker) return;
      _s.pickerOpen = force !== undefined ? force : !_s.pickerOpen;
      picker.style.display = _s.pickerOpen ? 'flex' : 'none';
    },

    onFileChange(event) {
      const file = event.target.files?.[0];
      if (file) this._handleFile(file);
    },

    onDragOver(event) {
      event.preventDefault();
      const dz = document.getElementById('mat-dropzone');
      if (dz) {
        dz.style.borderColor = 'var(--accent)';
        dz.style.background  = 'rgba(232,160,74,.05)';
      }
    },

    onDragLeave(event) {
      const dz = document.getElementById('mat-dropzone');
      if (dz) {
        dz.style.borderColor = 'rgba(232,160,74,.3)';
        dz.style.background  = 'transparent';
      }
    },

    onDrop(event) {
      event.preventDefault();
      this.onDragLeave(event);
      const file = event.dataTransfer.files?.[0];
      if (file) this._handleFile(file);
    },

    _handleFile(file) {
      const MAX = 50 * 1024 * 1024; 
      if (file.size > MAX) {
        this._showErr('Arquivo muito grande (máx 50 MB).');
        return;
      }
      _s.file = file;

      const reader = new FileReader();
      reader.onload = (e) => { _s.fileData = e.target.result; };
      reader.readAsDataURL(file);

      const info    = extInfo(file.name);
      const iconEl  = document.getElementById('mat-file-icon');
      const nameEl  = document.getElementById('mat-file-name');
      const sizeEl  = document.getElementById('mat-file-size');
      const preview = document.getElementById('mat-file-preview');
      const dropzone = document.getElementById('mat-dropzone');

      if (iconEl)   iconEl.textContent = info.icon;
      if (nameEl)   nameEl.textContent = file.name;
      if (sizeEl)   sizeEl.textContent = this._formatSize(file.size) + ' · ' + info.label;
      if (preview)  preview.style.display = 'flex';
      if (dropzone) dropzone.style.display = 'none';

      const errEl = document.getElementById('mat-err');
      if (errEl) errEl.style.display = 'none';
    },

    clearFile() {
      _s.file = null;
      _s.fileData = null;
      this._clearFilePreview();
      const fileInput = document.getElementById('mat-file-input');
      if (fileInput) fileInput.value = '';
    },

    _clearFilePreview() {
      const preview  = document.getElementById('mat-file-preview');
      const dropzone = document.getElementById('mat-dropzone');
      if (preview)  preview.style.display = 'none';
      if (dropzone) dropzone.style.display = 'block';
    },

    _formatSize(bytes) {
      if (bytes < 1024)            return bytes + ' B';
      if (bytes < 1024 * 1024)     return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    },

    _showErr(msg) {
      const el = document.getElementById('mat-err');
      if (el) { el.textContent = msg; el.style.display = 'block'; }
    },

    salvar() {
      const nome    = document.getElementById('mat-nome')?.value.trim();
      const icon    = document.getElementById('mat-icon-display')?.textContent || '📚';
      const turmaId = window.__currentTurmaId__;

      if (!nome) {
        this._showErr('Digite o nome da matéria.');
        document.getElementById('mat-nome')?.focus();
        return;
      }

      if (!turmaId) {
        this._showErr('Turma não identificada. Tente novamente.');
        return;
      }

      const errEl = document.getElementById('mat-err');
      if (errEl) errEl.style.display = 'none';

      const materia = {
        id: 'mat_' + Date.now(),
        name: nome,
        icon,
        createdAt: new Date().toISOString(),
        arquivos: [],
        textos: [],
      };

      if (_s.tab === 'arquivo') {
        if (!_s.file) {
          this._showErr('Selecione um arquivo para enviar.');
          return;
        }
        const desc = document.getElementById('mat-arquivo-desc')?.value.trim() || '';
        materia.arquivos.push({
          id: 'arq_' + Date.now(),
          name: _s.file.name,
          size: _s.file.size,
          data: _s.fileData,
          desc,
          ...extInfo(_s.file.name),
        });
      } else {
        const conteudo = document.getElementById('mat-texto-conteudo')?.value.trim();
        if (!conteudo) {
          this._showErr('Escreva algum conteúdo para a matéria.');
          return;
        }
        materia.textos.push({
          id: 'txt_' + Date.now(),
          conteudo,
          createdAt: new Date().toISOString(),
        });
      }

      if (!_localMaterias[turmaId]) _localMaterias[turmaId] = [];
      _localMaterias[turmaId].push(materia);

      try {
        const container = document.getElementById('turma-tab-materias');
        if (container) {
          container.innerHTML = _renderMateriasTab(turmaId);
        }
      } catch (err) {
        console.warn('MateriaModal: Não foi possível re-renderizar tab:', err);
      }

      this.fechar();
      toast('✅ Matéria publicada com sucesso!', 'success');
    },
  };

  function _renderMateriasTab(turmaId) {
    const materias = _localMaterias[turmaId] || [];
    if (!materias.length) {
      return `<div class="turma-empty">
        <div class="turma-empty-icon">📚</div>
        <div>Nenhuma matéria cadastrada ainda.</div>
      </div>`;
    }

    return `<div class="materias-grid-new">
      ${materias.map(m => `
        <div class="materia-card-new" onclick="MateriaModal.abrirMateria('${m.id}')"
             style="cursor:pointer;">
          <div class="mc-icon">${esc(m.icon)}</div>
          <div class="mc-name">${esc(m.name)}</div>
          ${m.arquivos.length ? `
            <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px;">
              ${m.arquivos.map(a => `
                <span style="display:inline-flex;align-items:center;gap:4px;
                             font-size:11px;color:var(--text-2);
                             background:var(--bg-3);border:1px solid var(--border);
                             border-radius:6px;padding:2px 8px;">
                  ${esc(a.icon)} ${esc(a.label)}
                </span>`).join('')}
            </div>` : ''}
          ${m.textos.length ? `
            <div style="margin-top:6px;font-size:11px;color:var(--text-3);">
              ✏️ ${m.textos.length} texto${m.textos.length !== 1 ? 's' : ''} escrito${m.textos.length !== 1 ? 's' : ''}
            </div>` : ''}
        </div>`).join('')}
    </div>`;
  }

  MateriaModal.abrirMateria = function (materiaId) {
    const turmaId = window.__currentTurmaId__;
    if (!turmaId) return;
    const materias = _localMaterias[turmaId] || [];
    const m = materias.find(x => x.id === materiaId);
    if (!m) return;

    let viewModal = document.getElementById('modal-view-materia');
    if (!viewModal) {
      viewModal = document.createElement('div');
      viewModal.id = 'modal-view-materia';
      viewModal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.78);' +
        'z-index:1300;align-items:center;justify-content:center;padding:16px;';
      document.body.appendChild(viewModal);
    }

    const arquivosHtml = m.arquivos.map(a => `
      <div style="display:flex;align-items:center;gap:12px;background:var(--bg-3);
                  border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:10px;">
        <span style="font-size:28px;">${esc(a.icon)}</span>
        <div style="flex:1;min-width:0;">
          <div style="font-size:14px;font-weight:500;color:var(--text-0);
                      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(a.name)}</div>
          ${a.desc ? `<div style="font-size:12px;color:var(--text-2);margin-top:2px;">${esc(a.desc)}</div>` : ''}
          <div style="font-size:11px;color:var(--text-3);margin-top:2px;">
            ${extInfo(a.name).label} · ${MateriaModal._formatSize(a.size)}
          </div>
        </div>
        <button onclick="MateriaModal._downloadArquivo('${a.id}', '${materiaId}')"
                style="background:var(--accent);border:none;border-radius:9px;padding:8px 14px;
                       color:var(--bg-0);font-size:12px;font-weight:600;cursor:pointer;
                       transition:opacity .15s;white-space:nowrap;"
                onmouseover="this.style.opacity='.85'"
                onmouseout="this.style.opacity='1'">
          ⬇ Baixar
        </button>
      </div>`).join('');

    const textosHtml = m.textos.map(t => `
      <div style="background:var(--bg-3);border:1px solid var(--border);border-radius:12px;
                  padding:18px;margin-bottom:12px;line-height:1.75;font-size:14.5px;
                  color:var(--text-0);white-space:pre-wrap;">${esc(t.conteudo)}</div>`).join('');

    viewModal.innerHTML = `
      <div style="background:var(--bg-2);border:1px solid var(--border-warm);
                  border-radius:22px;padding:32px;width:100%;max-width:540px;
                  position:relative;max-height:88vh;overflow-y:auto;
                  box-shadow:0 20px 60px rgba(0,0,0,.7);">
        <button onclick="document.getElementById('modal-view-materia').style.display='none'"
                style="position:absolute;top:16px;right:16px;background:none;border:none;
                       color:var(--text-3);cursor:pointer;font-size:20px;line-height:1;">✕</button>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
          <span style="font-size:36px;">${esc(m.icon)}</span>
          <div>
            <div style="font-family:var(--font-display);font-size:24px;color:var(--text-0);">
              ${esc(m.name)}
            </div>
            <div style="font-size:12px;color:var(--text-3);margin-top:2px;">
              Publicado em ${new Date(m.createdAt).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
        ${arquivosHtml || ''}
        ${textosHtml   || ''}
        ${!arquivosHtml && !textosHtml ? `
          <div style="text-align:center;color:var(--text-3);padding:24px;">
            Nenhum conteúdo nesta matéria.
          </div>` : ''}
      </div>`;

    viewModal.style.display = 'flex';
  };

  MateriaModal._downloadArquivo = function (arquivoId, materiaId) {
    const turmaId = window.__currentTurmaId__;
    if (!turmaId) return;
    const m = (_localMaterias[turmaId] || []).find(x => x.id === materiaId);
    if (!m) return;
    const a = m.arquivos.find(x => x.id === arquivoId);
    if (!a || !a.data) { toast('Dados do arquivo não encontrados.', 'error'); return; }

    const link = document.createElement('a');
    link.href = a.data;
    link.download = a.name;
    link.click();
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (typeof App !== 'undefined') {
      App.openAddMateriaModal = function () {
        MateriaModal.abrir();
      };

      const _origSwitchTab = App.switchTurmaTab;
      if (_origSwitchTab) {
        App.switchTurmaTab = function (tab) {
          _origSwitchTab.call(this, tab);
          if (tab === 'materias') {
            const turmaId   = window.__currentTurmaId__;
            const container = document.getElementById('turma-tab-materias');
            if (container && turmaId && _localMaterias[turmaId]?.length) {
              container.innerHTML = _renderMateriasTab(turmaId);
            }
          }
        };
      }
    }
  });

  console.log('[MateriaModal] ✅ Patch carregado com sucesso.');
})();