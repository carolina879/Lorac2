
const AlunoTurmaDashboard = (() => {

 
  function _storageKey(userId, turmaId) {
    return `studysync_aluno_progress_${userId}_${turmaId}`;
  }

  function _loadProgress(userId, turmaId) {
    try {
      const raw = localStorage.getItem(_storageKey(userId, turmaId));
      return raw ? JSON.parse(raw) : _defaultProgress();
    } catch { return _defaultProgress(); }
  }

  function _defaultProgress() {
    return {
      exerciciosConcluidos: [],
      notas: {},         
      acessos: [],         
      ultimoAcesso: null,
    };
  }

  function _saveProgress(userId, turmaId, progress) {
    try {
      localStorage.setItem(_storageKey(userId, turmaId), JSON.stringify(progress));
    } catch {}
  }

 
  function registrarAcesso(userId, turmaId) {
    const progress = _loadProgress(userId, turmaId);
    const today = new Date().toISOString().slice(0, 10);
    let entry = progress.acessos.find(a => a.date === today);
    if (!entry) {
      entry = { date: today, minutos: 0, timestamp: Date.now() };
      progress.acessos.push(entry);
    }
    progress.ultimoAcesso = Date.now();
   
    if (!AlunoTurmaDashboard._sessionStart) {
      AlunoTurmaDashboard._sessionStart = Date.now();
    }
    _saveProgress(userId, turmaId, progress);
  }

  
  function registrarExercicio(userId, turmaId, exercicioId, nota) {
    const progress = _loadProgress(userId, turmaId);
    if (!progress.exerciciosConcluidos.includes(exercicioId)) {
      progress.exerciciosConcluidos.push(exercicioId);
    }
    if (nota !== undefined && nota !== null) {
      progress.notas[exercicioId] = nota;
    }
    const today = new Date().toISOString().slice(0, 10);
    let entry = progress.acessos.find(a => a.date === today);
    if (!entry) {
      entry = { date: today, minutos: 0, timestamp: Date.now() };
      progress.acessos.push(entry);
    }
    _saveProgress(userId, turmaId, progress);
  }

  function show(turma, userId) {
    const progress = _loadProgress(userId, turma.id);
    const exercicios = _getExercicios(turma);
    const totalEx = exercicios.length;
    const concluidos = progress.exerciciosConcluidos.filter(id =>
      exercicios.some(e => e.id === id)
    );
    const pct = totalEx > 0 ? Math.round((concluidos.length / totalEx) * 100) : 0;

    
    const notasArr = Object.values(progress.notas).filter(n => n !== undefined && n !== null);
    const notaMedia = notasArr.length
      ? (notasArr.reduce((a, b) => a + b, 0) / notasArr.length).toFixed(1)
      : '—';


    const totalMin = progress.acessos.reduce((acc, a) => acc + (a.minutos || 0), 0);
    const totalHoras = Math.floor(totalMin / 60);
    const restMin = totalMin % 60;
    const tempoStr = totalMin === 0 ? '< 1 min' : (totalHoras > 0 ? `${totalHoras}h ${restMin}m` : `${restMin}m`);

    const ultimoAcessoStr = progress.ultimoAcesso
      ? _formatTimeAgo(progress.ultimoAcesso)
      : 'Nunca';

    
    const htmlModal = `
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:24px;">
        <div style="font-size:36px;">${turma.icon || '🏫'}</div>
        <div>
          <h2 style="font-family:var(--font-display);font-size:22px;color:var(--text-0);margin:0 0 4px;">Meu Progresso</h2>
          <div style="font-size:13px;color:var(--text-2);">${_esc(turma.name)}</div>
        </div>
      </div>

     
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
        ${_statCard('📝', 'Exercícios', `${concluidos.length}/${totalEx}`, pct + '%', 'concluídos', '#7a9e7e')}
        ${_statCard('⭐', 'Nota Média', notaMedia, notaMedia !== '—' ? notaMedia + '/10' : '—', 'média', '#e8a04a')}
        ${_statCard('⏱️', 'Tempo Total', tempoStr, '', 'de estudo', '#64a0e8')}
        ${_statCard('📅', 'Último Acesso', ultimoAcessoStr, '', '', '#c8a0e8')}
      </div>


      <div style="margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-size:13px;font-weight:600;color:var(--text-1);">Progresso Geral da Turma</span>
          <span style="font-size:13px;font-weight:700;color:var(--accent);">${pct}%</span>
        </div>
        <div style="height:10px;background:var(--bg-3);border-radius:10px;overflow:hidden;">
          <div style="height:100%;background:linear-gradient(90deg,#7a9e7e,var(--accent));border-radius:10px;width:${pct}%;transition:width .6s cubic-bezier(.16,1,.3,1);"></div>
        </div>
        ${totalEx === 0 ? `<div style="font-size:12px;color:var(--text-3);margin-top:6px;">Nenhum exercício disponível ainda.</div>` : ''}
      </div>

      
      ${totalEx > 0 ? `
        <div style="margin-bottom:8px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-3);margin-bottom:10px;">Exercícios</div>
          <div style="display:flex;flex-direction:column;gap:6px;max-height:200px;overflow-y:auto;padding-right:4px;">
            ${exercicios.map(ex => {
              const done = progress.exerciciosConcluidos.includes(ex.id);
              const nota = progress.notas[ex.id];
              return `
                <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg-3);border-radius:10px;border:1px solid var(--border);">
                  <div style="width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;
                    background:${done ? 'rgba(122,158,126,.2)' : 'var(--bg-2)'};">
                    ${done ? '✅' : '⬜'}
                  </div>
                  <div style="flex:1;min-width:0;">
                    <div style="font-size:13px;font-weight:500;color:${done ? 'var(--text-1)' : 'var(--text-0)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                      ${_esc(ex.title || ex.name || 'Exercício')}
                    </div>
                    ${ex.due_date ? `<div style="font-size:11px;color:var(--text-3);">Prazo: ${_formatDate(ex.due_date)}</div>` : ''}
                  </div>
                  ${nota !== undefined ? `<span style="padding:2px 8px;background:rgba(232,160,74,.15);color:var(--accent);border-radius:6px;font-size:12px;font-weight:700;">${nota}/10</span>` : ''}
                  ${!done ? `<span style="padding:2px 8px;background:rgba(220,80,60,.1);color:#e07060;border-radius:6px;font-size:11px;">Pendente</span>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      
      ${_renderCalendario(progress.acessos)}

      <button class="btn-secondary" onclick="App.closeModal()" style="width:100%;margin-top:20px;">Fechar</button>
    `;

    window.App?.openModal(htmlModal);

    
    setTimeout(() => {
      const bar = document.querySelector('.aluno-progress-bar');
      if (bar) bar.style.width = pct + '%';
    }, 100);
  }

  function _statCard(icon, label, value, sub, sublabel, color) {
    return `
      <div style="background:var(--bg-3);border:1px solid var(--border);border-radius:14px;padding:16px;position:relative;overflow:hidden;">
        <div style="position:absolute;top:12px;right:12px;font-size:22px;opacity:.3;">${icon}</div>
        <div style="font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3);margin-bottom:6px;">${label}</div>
        <div style="font-size:22px;font-weight:700;color:${color};font-family:var(--font-mono,'DM Mono',monospace);">${value}</div>
        ${sub ? `<div style="font-size:11px;color:var(--text-3);margin-top:2px;">${sub} ${sublabel}</div>` : (sublabel ? `<div style="font-size:11px;color:var(--text-3);margin-top:2px;">${sublabel}</div>` : '')}
      </div>
    `;
  }

  function _renderCalendario(acessos) {
    if (!acessos.length) return '';

   
    const days = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const entry = acessos.find(a => a.date === dateStr);
      days.push({ date: dateStr, minutos: entry?.minutos || 0, label: _shortDate(d) });
    }

    const maxMin = Math.max(...days.map(d => d.minutos), 1);

    return `
      <div style="margin-top:20px;margin-bottom:4px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-3);margin-bottom:10px;">Acessos — Últimas 2 Semanas</div>
        <div style="display:flex;gap:4px;align-items:flex-end;height:48px;">
          ${days.map(d => `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;" title="${d.date}: ${d.minutos}min">
              <div style="width:100%;border-radius:3px 3px 0 0;transition:height .3s;
                background:${d.minutos > 0 ? 'var(--accent)' : 'var(--bg-3)'};
                opacity:${d.minutos > 0 ? (0.3 + 0.7 * (d.minutos / maxMin)).toFixed(2) : 1};
                height:${d.minutos > 0 ? Math.max(6, Math.round((d.minutos / maxMin) * 40)) : 4}px;">
              </div>
            </div>
          `).join('')}
        </div>
        <div style="display:flex;gap:4px;margin-top:4px;">
          ${days.map(d => `<div style="flex:1;text-align:center;font-size:8px;color:var(--text-3);">${d.label}</div>`).join('')}
        </div>
      </div>
    `;
  }

  function _getExercicios(turma) {
    if (!turma) return [];
   
    try {
      const raw = localStorage.getItem('studysync_exercicios_' + turma.id);
      return raw ? JSON.parse(raw) : (turma.exercicios || []);
    } catch { return turma.exercicios || []; }
  }

  function _formatTimeAgo(ts) {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff/60)}min atrás`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h atrás`;
    return `${Math.floor(diff/86400)}d atrás`;
  }

  function _formatDate(dateStr) {
    try { return new Date(dateStr).toLocaleDateString('pt-BR'); } catch { return dateStr; }
  }

  function _shortDate(d) {
    return `${d.getDate()}/${d.getMonth()+1}`;
  }

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  
  function injectProgressButton() {
   
    const observer = new MutationObserver(() => {
      const tabRow = document.querySelector('.turma-tabs-row');
      if (tabRow && !tabRow.querySelector('.btn-meu-progresso')) {
        const btn = document.createElement('button');
        btn.className = 'turma-tab-pill btn-meu-progresso';
        btn.innerHTML = '📊 Meu Progresso';
        btn.onclick = () => {
          const appState = window.App?.getState?.() || window.App?.state;
          const turma = appState?.currentTurma;
          const userId = appState?.user?.id;
          const isProfessor = appState?.user?.role === 'professor' && turma?.professor_id === appState?.user?.id;
          if (!turma || !userId) return;
          if (isProfessor) {
            window.App?.showProfessorDashboard?.(turma.id);
          } else {
            registrarAcesso(userId, turma.id);
            show(turma, userId);
          }
        };
        tabRow.appendChild(btn);
        _injectStyles();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function _injectStyles() {
    if (document.getElementById('aluno-dash-styles')) return;
    const style = document.createElement('style');
    style.id = 'aluno-dash-styles';
    style.textContent = `
      .btn-meu-progresso {
        background: linear-gradient(135deg, rgba(232,160,74,.15), rgba(232,160,74,.08)) !important;
        border-color: rgba(232,160,74,.3) !important;
        color: var(--accent, #e8a04a) !important;
        position: relative;
      }
      .btn-meu-progresso:hover {
        background: rgba(232,160,74,.2) !important;
      }
    `;
    document.head.appendChild(style);
  }

  return {
    show,
    registrarAcesso,
    registrarExercicio,
    injectProgressButton,
    _loadProgress,
    _saveProgress,
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AlunoTurmaDashboard.injectProgressButton());
} else {
  AlunoTurmaDashboard.injectProgressButton();
}
